#!/usr/bin/env node

/*
 * node-htmlprocessor
 * https://github.com/dciccale/node-htmlprocessor
 *
 * Copyright (c) 2013-2014 Denis Ciccale (@tdecs)
 * Licensed under the MIT license.
 * https://github.com/dciccale/node-htmlprocessor/blob/master/LICENSE-MIT
 */

var path = require('path');
var index = require('./index');
var pkg = require('./package.json');
var args = process.argv.slice(2);
var options = {};
var files = [];
var output;

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
      output = args.shift();
      break;
    case '-h':
    case '--help':
      console.log('show help');
      break;
    default:
      if (v && v.indexOf('-') === 0) {
        throw ('Unknown option: ' + v);
      }
      files.push(v);
  }
}

index({src: files, dest: output}, options);
