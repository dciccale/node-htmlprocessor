'use strict';

var fs = require('fs');
var assert = require('assert');
var utils = require('../lib/utils');
var htmlprocessor = require('../index');

describe('dev', function () {
  it('should process and output an html file as defined by the build special comments for dev target', function (done) {
    htmlprocessor({
      src: ['test/fixtures/index.html'],
      dest: 'test/fixtures/dev/index.processed.html'
    }, {
      data: {
        message: 'This is dev target'
      },
      environment: 'dev'
    });

    var actual = utils.read('test/fixtures/dev/index.processed.html');
    var expected = utils.read('test/expected/dev/index.html');
    assert.equal(actual, expected);
    done();
  });
});

describe('dist', function () {
  it('should process and output an html file as defined by the build special comments for dist target', function (done) {
    htmlprocessor({
      src: ['test/fixtures/index.html'],
      dest: 'test/fixtures/dist/index.processed.html'
    }, {
      data: {
        message: 'This is dist target'
      },
      environment: 'dist'
    });

    var actual = utils.read('test/fixtures/dist/index.processed.html');
    var expected = utils.read('test/expected/dist/index.html');
    assert.equal(actual, expected);

    done();
  });

  it('should output the processed file to the specified directory', function (done) {
    htmlprocessor({
      src: ['test/fixtures/index.html'],
      dest: 'test/fixtures/dist'
    }, {
      data: {
        message: 'This is dist target'
      },
      environment: 'dist'
    });

    var actual = utils.read('test/fixtures/dist/index.html');
    var expected = utils.read('test/expected/dist/index.html');
    assert.equal(actual, expected);

    done();
  });

  it('should output the processed file to same directory if no dest specified', function (done) {
    htmlprocessor({
      src: ['test/fixtures/index.html']
    }, {
      data: {
        message: 'This is dist target'
      },
      environment: 'dist'
    });

    var actual = utils.read('test/fixtures/dist/index.html');
    var expected = utils.read('test/fixtures/dist/index.processed.html');
    assert.equal(actual, expected);

    done();
  });
});

describe('custom', function () {
  it('should be able to process a template with custom delimiters', function (done) {
    htmlprocessor({
      src: ['test/fixtures/custom.html'],
      dest: 'test/fixtures/custom/custom.processed.html'
    }, {
      data: {
        message: 'This has custom delimiters for the template'
      },
      environment: 'dist',
      templateSettings: {
        interpolate: /{{([\s\S]+?)}}/g
      }
    });

    var actual = utils.read('test/fixtures/custom/custom.processed.html');
    var expected = utils.read('test/expected/custom/custom.html');
    assert.equal(actual, expected);

    done();
  });
});

describe('marker', function () {

  it('should process and output an html file as defined by the build special comments for marker target', function (done) {
    htmlprocessor({
      src: ['test/fixtures/commentMarker.html'],
      dest: 'test/fixtures/commentMarker/commentMarker.processed.html'
    }, {
      data: {
        message: 'This uses a custom comment marker',
      },
      commentMarker: 'process',
      environment: 'marker'
    });

    var actual = utils.read('test/fixtures/commentMarker/commentMarker.processed.html');
    var expected = utils.read('test/expected/commentMarker/commentMarker.html');
    assert.equal(actual, expected);

    done();
  });
});

describe('strip', function () {

  it('should remove build comments for non-targets', function (done) {
    htmlprocessor({
      src: ['test/fixtures/strip.html'],
      dest: 'test/fixtures/strip/strip.processed.html'
    }, {
      strip: true
    });

    var actual = utils.read('test/fixtures/strip/strip.processed.html');
    var expected = utils.read('test/expected/strip/strip.html');
    assert.equal(actual, expected);

    done();
  });
});

describe('multiple', function () {

  it('parse comment block defining multiple targets (1)', function (done) {
    htmlprocessor({
      src: ['test/fixtures/multiple.html'],
      dest: 'test/fixtures/multiple/mult_one.processed.html'
    }, {
        environment: 'mult_one'
    });

    var actual = utils.read('test/fixtures/multiple/mult_one.processed.html');
    var expected = utils.read('test/expected/multiple/mult_one.html');
    assert.equal(actual, expected, 'parse comment block defining multiple targets (1)');
    done();
  });

  it('parse comment block defining multiple targets (2)', function (done) {
    htmlprocessor({
      src: ['test/fixtures/multiple.html'],
      dest: 'test/fixtures/multiple/mult_two.processed.html'
    }, {
        environment: 'mult_two'
    });

    var actual = utils.read('test/fixtures/multiple/mult_two.processed.html');
    var expected = utils.read('test/expected/multiple/mult_two.html');
    assert.equal(actual, expected);

    done();
  });

  it('parse comment block defining multiple targets (3)', function (done) {
    htmlprocessor({
      src: ['test/fixtures/multiple.html'],
      dest: 'test/fixtures/multiple/mult_three.processed.html'
    }, {
        environment: 'mult_three'
    });

    var actual = utils.read('test/fixtures/multiple/mult_three.processed.html');
    var expected = utils.read('test/expected/multiple/mult_three.html');
    assert.equal(actual, expected);

    done();
  });
});

describe('include_js', function () {
  it('include a js file', function (done) {
    htmlprocessor({
      src: ['test/fixtures/include.html'],
      dest: 'test/fixtures/include/include.processed.html'
    });

    var actual = utils.read('test/fixtures/include/include.processed.html');
    var expected = utils.read('test/expected/include/include.html');
    assert.equal(actual, expected);

    done();
  });

  it('should only include a file if the file exists', function (done) {
    htmlprocessor({
      src: ['test/fixtures/include_no_exist.html'],
      dest: 'test/fixtures/include/include_no_exist.processed.html'
    });

    var actual = utils.read('test/fixtures/include/include_no_exist.processed.html');
    var expected = utils.read('test/expected/include/include_no_exist.html');
    assert.equal(actual, expected);

    done();
  });
});

describe('conditional_ie', function () {
  it('correctly parse build comments inside conditional ie statement', function (done) {
    htmlprocessor({
      src: ['test/fixtures/conditional_ie.html'],
      dest: 'test/fixtures/conditional_ie/conditional_ie.processed.html'
    });

    var actual = utils.read('test/fixtures/conditional_ie/conditional_ie.processed.html');
    var expected = utils.read('test/expected/conditional_ie/conditional_ie.html');
    assert.equal(actual, expected);

    done();
  });
});

describe('recursive_process', function () {
  it('recursively process included files', function (done) {
    htmlprocessor({
      src: ['test/fixtures/recursive.html'],
      dest: 'test/fixtures/recursive/recursive.processed.html'
    }, {
      recursive: true
    });

    var actual = utils.read('test/fixtures/recursive/recursive.processed.html');
    var expected = utils.read('test/expected/recursive/recursive.html');
    assert.equal(actual, expected);

    done();
  });
});

describe('custom_blocktype', function () {
  it('define custom block types', function (done) {
    htmlprocessor({
      src: ['test/fixtures/custom_blocktype.html'],
      dest: 'test/fixtures/custom_blocktype/custom_blocktype.processed.html'
    }, {
      customBlockTypes: ['test/fixtures/custom_blocktype.js']
    });

    var actual = utils.read('test/fixtures/custom_blocktype/custom_blocktype.processed.html');
    var expected = utils.read('test/expected/custom_blocktype/custom_blocktype.html');
    assert.equal(actual, expected);

    done();
  });
});

describe('attr', function () {
  it('modify attributes', function (done) {
    htmlprocessor({
      src: ['test/fixtures/attr.html'],
      dest: 'test/fixtures/attr/attr.processed.html'
    });

    var actual = utils.read('test/fixtures/attr/attr.processed.html');
    var expected = utils.read('test/expected/attr/attr.html');
    assert.equal(actual, expected);

    done();
  });
});

describe('template', function () {
  it('replace template data', function (done) {
    htmlprocessor({
      src: ['test/fixtures/template.html'],
      dest: 'test/fixtures/template/template.processed.html'
    }, {
      data: {
        msg: 'hey',
        test: 'text_$&_text'
      }
    });

    var actual = utils.read('test/fixtures/template/template.processed.html');
    var expected = utils.read('test/expected/template/template.html');
    assert.equal(actual, expected);

    done();
  });
});

describe('remove_no_newline', function () {
  it('should remove block even if no starting new line is present', function (done) {
    htmlprocessor({
      src: ['test/fixtures/remove_no_newline.html'],
      dest: 'test/fixtures/remove/remove_no_newline.processed.html'
    }, {
      environment: 'testa'
    });

    var actual = utils.read('test/fixtures/remove/remove_no_newline.processed.html');
    var expected = utils.read('test/expected/remove/remove_no_newline.html');
    assert.equal(actual, expected);

    done();
  });
});

describe('remove_with_newline', function () {
  it('should remove block also when has a preceding newline', function (done) {
    htmlprocessor({
      src: ['test/fixtures/remove_with_newline.html'],
      dest: 'test/fixtures/remove/remove_with_newline.processed.html'
    }, {
      environment: 'testa'
    });

    var actual = utils.read('test/fixtures/remove/remove_with_newline.processed.html');
    var expected = utils.read('test/expected/remove/remove_with_newline.html');
    assert.equal(actual, expected);

    done();
  });
});

describe('remove_with_unescaped_regex_chars', function () {
  it('should remove block also when the block contains unescaped regular expression special characters', function (done) {
    htmlprocessor({
      src: ['test/fixtures/remove_with_unescaped_regex_chars.html'],
      dest: 'test/fixtures/remove/remove_with_unescaped_regex_chars.processed.html'
    }, {
      environment: 'testa'
    });

    var actual = utils.read('test/fixtures/remove/remove_with_unescaped_regex_chars.processed.html');
    var expected = utils.read('test/expected/remove/remove_with_unescaped_regex_chars.html');
    assert.equal(actual, expected);

    done();
  });
});

describe('remove_mixed_eol', function () {
  it('should remove block also when the block contains mixed EOL', function (done) {
    htmlprocessor({
      src: ['test/fixtures/remove_mixed_eol.html'],
      dest: 'test/fixtures/remove/remove_mixed_eol.processed.html'
    });

    var actual = utils.read('test/fixtures/remove/remove_mixed_eol.processed.html');
    var expected = utils.read('test/expected/remove/remove_mixed_eol.html');
    assert.equal(actual, expected);

    done();
  });
});

describe('inline', function () {
  it('should inline css and js for dist target', function (done) {
    htmlprocessor({
      src: ['test/fixtures/inline.html'],
      dest: 'test/fixtures/inline/inline.processed.html'
    });

    var actual = utils.read('test/fixtures/inline/inline.processed.html');
    var expected = utils.read('test/expected/inline/inline.html');
    assert.equal(actual, expected);

    done();
  });
});

describe('list', function () {
  afterEach(function (done) {
    fs.unlink('test/fixtures/list/replacements.list', done);
  });

  it('should output a file with a list of replacements', function (done) {
    var processor = htmlprocessor({
      src: ['test/fixtures/list.html'],
      dest: 'test/fixtures/list/list.processed.html'
    }, {
      list: 'test/fixtures/list/replacements.list'
    });

    processor.parser.listFile.on('finish', function () {
      var actual = utils.read('test/fixtures/list/replacements.list');
      var expected = utils.read('test/expected/list/replacements.list');

      assert.equal(actual, expected);

      done();
    });
  });
});
