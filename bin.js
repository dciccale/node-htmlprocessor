#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var pkg = require('./package.json');
var utils = require('./lib/utils');
var HTMLProcessor = require('./lib/htmlprocessor');
var args = process.argv.slice(2);
var options = {};

while (args.length > 0) {
  var v = args.shift();

  switch (v) {
    case '-d':
    case '--data':
      options.data = require(path.join(__dirname, args.shift()));
      break;
    case '-e':
    case '--env':
      options.environment = args.shift();
      break;
    case '-c':
    case '--comment-marker':
      options.commentMarker = args.shift();
      break;
    case '-i':
    case '--include-base':
      options.includeBase = args.shift();
      break;
    case '-r':
    case '--recursive':
      options.recursive = args.shift();
      break;
    case '-s':
    case '--strip':
      options.strip = args.shift();
      break;
    case '-v':
    case '--version':
      console.log(pkg.version);
      process.exit(1);
      break;
    case '-o':
    case '--output':
      options.output = args.shift();
      break;
    case '-h':
    case '--help':
      console.log('show help');
      break;
    default:
      if (!options.files) {
        options.files = [];
      }
      if (v && v.indexOf('-') === 0) {
        throw ('Unknown option: ' + v);
      }
      options.files.push(v);
  }
}

var html = new HTMLProcessor(options);

if (options.output) {
  if (path.extname(options.output)) {
    utils.mkdir(path.dirname(options.output));
  } else {
    utils.mkdir(options.output);
  }
}

var getOutputPath = function (filepath) {
  var dest = options.output;
  var ext;

  if (!dest) {
    ext = path.extname(filepath);
    dest = path.basename(filepath, ext) + '.processed' + ext;
  } else if (!path.extname(dest)) {
    dest = path.join(dest, filepath);
  }

  return dest;
};

options.files.forEach(function (filepath) {
  var content = html.process(filepath);
  var dest = getOutputPath(filepath);

  fs.writeFile(dest, content, function (err) {
    if (err) {
      throw err;
    }

    console.log('File', '"' + dest + '"', 'created.');
  });
});
