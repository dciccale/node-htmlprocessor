'use strict';

var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');
var HTMLProcessor = require('..');

[
  { type: 'css', tag: 'style', attr: 'href', first: 'body { color: red; }\n', second: 'body { color: blue; }\n' },
  { type: 'js', tag: 'script', attr: 'src', first: 'window.first = true;\n', second: 'window.second = true;\n' }
].forEach(function (asset) {
  describe('inline ' + asset.type + ' with HTML comments', function () {
    var dir;
    var processor;

    function reference(name) {
      var url = name + '.' + asset.type;
      return asset.type === 'css' ? '<link rel="stylesheet" href="' + url + '">' :
        '<script src="' + url + '"></script>';
    }

    function process(body, explicitAsset) {
      return processor.processContent('<!-- phtml:' + asset.type + ' inline' +
        (explicitAsset ? ' ' + explicitAsset : '') + ' -->\n' + body + '\n<!-- /phtml -->');
    }

    function expected(contents) {
      return '<' + asset.tag + '>' + os.EOL + contents + '</' + asset.tag + '>';
    }

    beforeEach(function () {
      dir = fs.mkdtempSync(path.join(os.tmpdir(), 'htmlprocessor-comments-'));
      fs.writeFileSync(path.join(dir, 'first.' + asset.type), asset.first);
      fs.writeFileSync(path.join(dir, 'second.' + asset.type), asset.second);
      fs.writeFileSync(path.join(dir, 'disabled.' + asset.type), 'DISABLED ASSET');
      processor = new HTMLProcessor({ includeBase: dir, commentMarker: 'phtml' });
    });

    afterEach(function () {
      fs.rmSync(dir, { recursive: true, force: true });
    });

    it('ignores a commented-out asset on one line', function () {
      assert.strictEqual(process(reference('first') + '\n<!--' + reference('disabled') + '-->'), expected(asset.first));
    });

    it('ignores assets inside a comment across several lines', function () {
      var body = reference('first') + '\n<!-- disabled assets\n' + reference('disabled') + '\n' +
        reference('missing') + '\n-->\n' + reference('second');
      assert.strictEqual(process(body), expected(asset.first + os.EOL + asset.second));
    });

    it('does not read a missing file referenced inside a comment', function () {
      assert.strictEqual(process(reference('first') + '\n<!--' + reference('missing') + '-->'), expected(asset.first));
    });

    it('keeps active assets in order when a comment contains their separating newline', function () {
      assert.strictEqual(process(reference('first') + '<!--\ndisabled\n-->' + reference('second')),
        expected(asset.first + os.EOL + asset.second));
    });

    it('keeps an active asset beside commented-out assets on the same line', function () {
      var body = '<!--' + reference('missing') + '-->' + reference('first') +
        '<!--' + reference('disabled') + '-->';
      assert.strictEqual(process(body), expected(asset.first));
    });

    it('still reads an explicitly named inline asset', function () {
      assert.strictEqual(process('<!--' + reference('missing') + '-->', 'first.' + asset.type), expected(asset.first));
    });
  });
});
