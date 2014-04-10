'use strict';

var utils = require('../lib/utils');
var index = require('../index');

module.exports = {
  dev: function (test) {
    test.expect(1);

    index({
        src: ['test/fixtures/index.html'],
        dest: 'test/fixtures/dev/index.processed.html'
      },
      {
        data: {
          message: 'This is dev target'
        },
        environment: 'dev'
      }
    );

    var actual = utils.read('test/fixtures/dev/index.processed.html');
    var expected = utils.read('test/expected/dev/index.html');
    test.equal(actual, expected, 'should process and output an html file as defined by the build special comments for dev target');

    test.done();
  },

  dist: function (test) {
    test.expect(1);

    index({
        src: ['test/fixtures/index.html'],
        dest: 'test/fixtures/dist/index.processed.html'
      },
      {
        data: {
          message: 'This is dist target'
        },
        environment: 'dist'
      }
    );

    var actual = utils.read('test/fixtures/dist/index.processed.html');
    var expected = utils.read('test/expected/dist/index.html');
    test.equal(actual, expected, 'should process and output an html file as defined by the build special comments for dist target');

    test.done();
  },

  custom: function (test) {
    test.expect(1);

    index({
        src: ['test/fixtures/custom.html'],
        dest: 'test/fixtures/custom/custom.processed.html'
      },
      {
        data: {
          message: 'This has custom delimiters for the template'
        },
        environment: 'dist',
        templateSettings: {
          interpolate: /{{([\s\S]+?)}}/g
        }
      }
    );

    var actual = utils.read('test/fixtures/custom/custom.processed.html');
    var expected = utils.read('test/expected/custom/custom.html');
    test.equal(actual, expected, 'should be able to process a template with custom delimiters');

    test.done();
  },

  marker: function (test) {
    test.expect(1);

    index({
        src: ['test/fixtures/custom.html'],
        dest: 'test/fixtures/custom/custom.processed.html'
      },
      {
        data: {
          message: 'This uses a custom comment marker',
        },
        commentMarker: 'process',
        environment: 'marker'
      }
    );

    var actual = utils.read('test/fixtures/commentMarker/commentMarker.processed.html');
    var expected = utils.read('test/expected/commentMarker/commentMarker.html');
    test.equal(actual, expected, 'should process and output an html file as defined by the build special comments for marker target');

    test.done();
  },

  strip: function (test) {
    test.expect(1);

    index({
        src: ['test/fixtures/strip.html'],
        dest: 'test/fixtures/strip/strip.processed.html'
      },
      {strip: true}
    );

    var actual = utils.read('test/fixtures/strip/strip.processed.html');
    var expected = utils.read('test/expected/strip/strip.html');
    test.equal(actual, expected, 'should remove build comments for non-targets');

    test.done();
  },

  multiple: function (test) {
    test.expect(3);

    index({
      src: ['test/fixtures/multiple.html'],
      dest: 'test/fixtures/multiple/mult_one.html'
    });

    index({
      src: ['test/fixtures/multiple.html'],
      dest: 'test/fixtures/multiple/mult_two.html'
    });

    index({
      src: ['test/fixtures/multiple.html'],
      dest: 'test/fixtures/multiple/mult_three.html'
    });

    var actual = utils.read('test/fixtures/multiple/mult_one.processed.html');
    var expected = utils.read('test/expected/multiple/mult_one.html');
    test.equal(actual, expected, 'parse comment block defining multiple targets (1)');

    actual = utils.read('test/fixtures/multiple/mult_two.processed.html');
    expected = utils.read('test/expected/multiple/mult_two.html');
    test.equal(actual, expected, 'parse comment block defining multiple targets (2)');

    actual = utils.read('test/fixtures/multiple/mult_three.processed.html');
    expected = utils.read('test/expected/multiple/mult_three.html');
    test.equal(actual, expected, 'parse comment block defining multiple targets (3)');

    test.done();
  },

  include_js: function (test) {
    test.expect(1);

    index({
      src: ['test/fixtures/include.html'],
      dest: 'test/fixtures/include/include.processed.html'
    });

    var actual = utils.read('test/fixtures/include/include.processed.html');
    var expected = utils.read('test/expected/include/include.html');
    test.equal(actual, expected, 'include a js file');

    test.done();
  },

  conditional_ie: function (test) {
    test.expect(1);

    index({
      src: ['test/fixtures/conditional_ie.html'],
      dest: 'test/fixtures/conditional_ie/conditional_ie.processed.html'
    });

    var actual = utils.read('test/fixtures/conditional_ie/conditional_ie.processed.html');
    var expected = utils.read('test/expected/conditional_ie/conditional_ie.html');
    test.equal(actual, expected, 'correctly parse build comments inside conditional ie statement');

    test.done();
  },

  recursive_process: function (test) {
    test.expect(1);

    index({
      src: ['test/fixtures/recursive.html'],
      dest: 'test/fixtures/recursive/recursive.processed.html'
    }, {
      recursive: true
    });

    var actual = utils.read('test/fixtures/recursive/recursive.processed.html');
    var expected = utils.read('test/expected/recursive/recursive.html');
    test.equal(actual, expected, 'recursively process included files');

    test.done();
  },

  custom_blocktype: function (test) {
    test.expect(1);

    index({
      src: ['test/fixtures/custom_blocktype.html'],
      dest: 'test/fixtures/custom_blocktype/custom_blocktype.processed.html'
    }, {
      customBlockTypes: ['test/fixtures/custom_blocktype.js']
    });

    var actual = utils.read('test/fixtures/custom_blocktype/custom_blocktype.processed.html');
    var expected = utils.read('test/expected/custom_blocktype/custom_blocktype.html');
    test.equal(actual, expected, 'define custom block types');

    test.done();
  }
};
