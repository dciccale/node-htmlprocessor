'use strict';

var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');
var HTMLProcessor = require('..');

describe('repeated includes', function () {
  var dir;

  function block(type, body) {
    return '<!-- build:' + type + ' -->\n' + (body || '') + '\n<!-- /build -->';
  }

  function render(values, asset) {
    return values.map(function (value) {
      return block('template', '<% my_var=' + JSON.stringify(value) + ' %>') + '\n' +
        block('include ' + (asset || 'template.html'));
    }).join('\n');
  }

  beforeEach(function () {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'htmlprocessor-includes-'));
    fs.writeFileSync(path.join(dir, 'template.html'), block('template', '<p><%= my_var %></p>') + '\n');
  });

  afterEach(function () {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  ['\n', '\r\n'].forEach(function (linefeed) {
    it('uses the current variables for each identical recursive include with ' + JSON.stringify(linefeed), function () {
      var processor = new HTMLProcessor({ recursive: true, includeBase: dir, data: { my_var: '' } });
      var input = render(['foo', 'bar', 'baz']).replace(/\n/g, linefeed);
      var expected = ['', '<p>foo</p>', '', '<p>bar</p>', '', '<p>baz</p>'].join(os.EOL);
      assert.strictEqual(processor.processContent(input), expected);
    });
  });

  it('uses current variables through nested recursive includes', function () {
    fs.writeFileSync(path.join(dir, 'wrapper.html'), '<section>\n' + block('include template.html') + '\n</section>\n');
    var processor = new HTMLProcessor({ recursive: true, includeBase: dir, data: { my_var: '' } });
    var expected = ['', '<section>', '<p>foo</p>', '</section>', '', '<section>', '<p>bar</p>', '</section>'].join(os.EOL);
    assert.strictEqual(processor.processContent(render(['foo', 'bar'], 'wrapper.html')), expected);
  });

  it('preserves literal replacement characters and indentation in repeated includes', function () {
    var literal = "$& $$ $` $'";
    fs.writeFileSync(path.join(dir, 'literal.html'), literal + '\n');
    var processor = new HTMLProcessor({ includeBase: dir });
    var include = '  <!-- build:include literal.html -->\n  <!-- /build -->';
    assert.strictEqual(processor.processContent(include + '\n' + include),
      '  ' + literal + os.EOL + '  ' + literal);
  });

  it('keeps template blocks unchanged when recursive processing is disabled', function () {
    var processor = new HTMLProcessor({ includeBase: dir, data: { my_var: '' } });
    var template = block('template', '<p><%= my_var %></p>').split('\n').join(os.EOL);
    assert.strictEqual(processor.processContent(render(['foo', 'bar'])),
      os.EOL + template + os.EOL + os.EOL + template);
  });
});
