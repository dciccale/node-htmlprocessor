'use strict';

var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');
var spawnSync = require('child_process').spawnSync;
var HTMLProcessor = require('..');
var run = require('../index');
var utils = require('../lib/utils');
var Parser = require('../lib/parser');

function block(type, body, marker) {
  marker = marker || 'build';
  return '<!-- ' + marker + ':' + type + ' -->\n' + body + '\n<!-- /' + marker + ' -->';
}

function finished(stream) {
  return new Promise(function (resolve, reject) {
    stream.on('error', reject);
    stream.on('finish', resolve);
  });
}

describe('processor regression cases', function () {
  var dir;
  beforeEach(function () { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'htmlprocessor-')); });
  afterEach(function () { fs.rmSync(dir, { recursive: true, force: true }); });

  it('exports the constructor used by grunt-processhtml', function () {
    var processor = new HTMLProcessor({ environment: 'dist', data: { title: 'App' } });
    assert.strictEqual(processor.data.environment, 'dist');
    assert.strictEqual(processor.template('<%= title %> / <%= environment %>', processor.data), 'App / dist');
    fs.writeFileSync(path.join(dir, 'one.html'), block('js:dist app.js', '<script></script>'));
    fs.writeFileSync(path.join(dir, 'two.html'), block('css:dist app.css', '<link>'));
    assert.strictEqual(processor.process(path.join(dir, 'one.html')), '<script src="app.js"></script>');
    assert.strictEqual(processor.process(path.join(dir, 'two.html')), '<link rel="stylesheet" href="app.css">');
  });

  ['', 'before\n'].forEach(function (prefix) {
    it('removes a final block without a trailing newline, prefix ' + JSON.stringify(prefix), function () {
      assert.strictEqual(new HTMLProcessor().processContent(prefix + block('remove', 'delete')), prefix.replace(/\n$/, ''));
    });
  });

  it('removes repeated blocks at the start and end of a file', function () {
    var input = block('remove', 'delete') + '\nkeep\n' + block('remove', 'delete');
    assert.strictEqual(new HTMLProcessor().processContent(input), 'keep');
  });

  it('keeps unknown blocks and can strip their comments', function () {
    var input = block('unknown', 'keep');
    assert.strictEqual(new HTMLProcessor().processContent(input), input.split('\n').join(os.EOL));
    assert.strictEqual(new HTMLProcessor({ strip: true }).processContent(input), 'keep');
  });

  it('keeps blocks for another target', function () {
    var input = block('js:dev dev.js', '<script src="old.js"></script>');
    assert.strictEqual(new HTMLProcessor({ environment: 'dist' }).processContent(input), input.split('\n').join(os.EOL));
  });

  it('keeps incomplete blocks and ordinary HTML', function () {
    ['<p>plain</p>', '<!-- build:js app.js -->\n<script></script>'].forEach(function (input) {
      assert.strictEqual(new HTMLProcessor().processContent(input), input.split('\n').join(os.EOL));
    });
    assert.deepStrictEqual(new Parser().getBlocks('plain'), []);
  });

  it('supports template escaping, evaluation, custom delimiters, and literal replacement characters', function () {
    var value = "$& $$ $` $'";
    var processor = new HTMLProcessor({ data: { value: value } });
    assert.strictEqual(processor.processContent(block('template', '<%= value %>')), value);
    assert.strictEqual(processor.template('<%- value %>', { value: '<b>&' }), '&lt;b&gt;&amp;');
    assert.strictEqual(processor.template('<% print(value) %>', { value: 'hello' }), 'hello');
    assert.strictEqual(processor.template('{{ value }}', { value: 'custom' }, { interpolate: /{{([\s\S]+?)}}/g }), 'custom');
  });

  it('uses includeBase for includes and explicit inline assets without a source path', function () {
    fs.writeFileSync(path.join(dir, 'part.html'), '<p>included</p>\n');
    fs.writeFileSync(path.join(dir, 'app.js'), 'alert(1);');
    fs.writeFileSync(path.join(dir, 'app.css'), 'body {}');
    var processor = new HTMLProcessor({ includeBase: dir });
    assert.strictEqual(processor.processContent(block('include part.html', 'old')), '<p>included</p>');
    assert.strictEqual(processor.processContent(block('js inline app.js', 'old')), '<script>' + os.EOL + 'alert(1);</script>');
    assert.strictEqual(processor.processContent(block('css inline scoped app.css', 'old')), '<style scoped>' + os.EOL + 'body {}</style>');
    assert.throws(function () { processor.processContent(block('js inline missing.js', 'old')); }, /ENOENT/);
  });

  it('inlines multiple assets in source order', function () {
    fs.writeFileSync(path.join(dir, 'one.js'), 'one;');
    fs.writeFileSync(path.join(dir, 'two.js'), 'two;');
    var processor = new HTMLProcessor({ includeBase: dir });
    assert.strictEqual(processor.processContent(block('js inline', '<script src="one.js"></script>\n<script src="two.js"></script>')), '<script>' + os.EOL + 'one;' + os.EOL + 'two;</script>');
  });

  it('lists assets across multiple files on one processor', async function () {
    var processor = new HTMLProcessor({ list: path.join(dir, 'assets.list') });
    var streams = [];
    ['one', 'two'].forEach(function (name) {
      processor.processContent(block('js app.js', '<script src="' + name + '.js"></script>'), name + '.html');
      streams.push(finished(processor.parser.listFile));
    });
    await Promise.all(streams);
    var lines = fs.readFileSync(path.join(dir, 'assets.list'), 'utf8').trim().split('\n').sort();
    assert.deepStrictEqual(lines, ['one.html:one.js', 'two.html:two.js']);
  });

  it('lists recursive assets and continues with later parent blocks', async function () {
    fs.writeFileSync(path.join(dir, 'child.html'), block('js child.min.js', '<script src="child.js"></script>'));
    var processor = new HTMLProcessor({ recursive: true, includeBase: dir, list: path.join(dir, 'assets.list') });
    var input = block('include child.html', 'old') + '\n' + block('css parent.min.css', '<link href="parent.css">');
    assert.strictEqual(processor.processContent(input, 'parent.html'), '<script src="child.min.js"></script>' + os.EOL + '<link rel="stylesheet" href="parent.min.css">');
    await finished(processor.parser.listFile);
    assert.strictEqual(fs.readFileSync(path.join(dir, 'assets.list'), 'utf8'), 'parent.html:parent.css\n' + path.join(dir, 'child.html') + ':child.js\n');
  });

  it('closes the list after a processing error', async function () {
    var processor = new HTMLProcessor({ list: path.join(dir, 'assets.list'), includeBase: dir });
    assert.throws(function () { processor.processContent(block('js inline missing.js', 'old')); }, /ENOENT/);
    await finished(processor.parser.listFile);
  });

  it('reports directory creation errors with the original error code', function () {
    var file = path.join(dir, 'file');
    fs.writeFileSync(file, 'occupied');
    assert.throws(function () { utils.mkdir(path.join(file, 'child'), 0o700); }, function (error) {
      return error.code === 'ENOTDIR' && /Unable to create directory/.test(error.message);
    });
    utils.mkdir(path.join(dir, 'explicit-mode'), 0o700);
    assert.ok(fs.statSync(path.join(dir, 'explicit-mode')).isDirectory());
  });

  it('writes default output and creates nested output and list directories', async function () {
    fs.writeFileSync(path.join(dir, 'input.html'), '<p>plain</p>');
    var oldCwd = process.cwd();
    try {
      process.chdir(dir);
      run({ src: ['input.html'] });
      assert.strictEqual(fs.readFileSync('input.processed.html', 'utf8'), '<p>plain</p>');
      var processor = run({ src: ['input.html'], dest: 'out/nested/output.html' }, { list: 'lists/nested/assets.list' });
      await finished(processor.parser.listFile);
      assert.strictEqual(fs.readFileSync('out/nested/output.html', 'utf8'), '<p>plain</p>');
    } finally { process.chdir(oldCwd); }
  });
});

describe('command-line interface', function () {
  var dir;
  var cli = path.resolve(__dirname, '../bin/htmlprocessor');
  function command(args) {
    return spawnSync(process.execPath, [cli].concat(args), { cwd: dir, encoding: 'utf8' });
  }
  beforeEach(function () { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'htmlprocessor-cli-')); });
  afterEach(function () { fs.rmSync(dir, { recursive: true, force: true }); });

  ['-h', '--help'].forEach(function (flag) {
    it('shows help with ' + flag, function () {
      var result = command([flag]);
      assert.strictEqual(result.status, 0, result.stderr);
      assert.match(result.stdout, /Usage: htmlprocessor/);
    });
  });
  ['-v', '--version'].forEach(function (flag) {
    it('shows the package version with ' + flag, function () {
      var result = command([flag]);
      assert.strictEqual(result.status, 0, result.stderr);
      assert.strictEqual(result.stdout.trim(), require('../package.json').version);
    });
  });

  [['-r', '-i', '-o'], ['--recursive', '--include-base', '--output']].forEach(function (flags) {
    it('uses a recursive flag before the input file: ' + flags[0], function () {
      fs.writeFileSync(path.join(dir, 'input.html'), block('include child.html', 'old'));
      fs.writeFileSync(path.join(dir, 'child.html'), block('js app.js', 'old'));
      var result = command([flags[0], 'input.html', flags[1], dir, flags[2], 'nested/output.html']);
      assert.strictEqual(result.status, 0, result.stderr);
      assert.strictEqual(fs.readFileSync(path.join(dir, 'nested/output.html'), 'utf8'), '<script src="app.js"></script>');
    });
  });

  [['-d', '-e', '-c', '-l', '-s'], ['--data', '--env', '--comment-marker', '--list', '--strip']].forEach(function (flags) {
    it('uses data, environment, marker, list, and strip options: ' + flags[0], function () {
      fs.writeFileSync(path.join(dir, 'data.json'), JSON.stringify({ message: 'hello' }));
      fs.writeFileSync(path.join(dir, 'input.html'), block('template:dist', '<%= message %> <%= environment %>', 'process') + '\n' + block('js:dev dev.js', '<script src="keep.js"></script>', 'process'));
      var result = command(['input.html', flags[0], 'data.json', flags[1], 'dist', flags[2], 'process', flags[3], 'assets.list', flags[4]]);
      assert.strictEqual(result.status, 0, result.stderr);
      assert.strictEqual(fs.readFileSync(path.join(dir, 'input.processed.html'), 'utf8'), 'hello dist' + os.EOL + '<script src="keep.js"></script>');
      assert.strictEqual(fs.readFileSync(path.join(dir, 'assets.list'), 'utf8'), 'input.html:keep.js\n');
    });
  });

  it('loads a custom block type', function () {
    fs.writeFileSync(path.join(dir, 'custom.js'), "module.exports = function (processor) { processor.registerBlockType('custom', function (content, block, line) { return content.replace(line, 'custom output'); }); };\n");
    fs.writeFileSync(path.join(dir, 'input.html'), block('custom', 'old'));
    var result = command(['input.html', '--custom-block-type', 'custom.js']);
    assert.strictEqual(result.status, 0, result.stderr);
    assert.strictEqual(fs.readFileSync(path.join(dir, 'input.processed.html'), 'utf8'), 'custom output');
  });

  it('rejects an unknown option', function () {
    var result = command(['--unknown']);
    assert.notStrictEqual(result.status, 0);
    assert.match(result.stderr, /Unknown option: --unknown/);
  });
});
