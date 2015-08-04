/*
 * node-htmlprocessor
 * https://github.com/dciccale/node-htmlprocessor
 *
 * Copyright (c) 2013-2015 Denis Ciccale (@tdecs)
 * Licensed under the MIT license.
 * https://github.com/dciccale/node-htmlprocessor/blob/master/LICENSE-MIT
 */

'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('lodash');

module.exports = {
  read: read,
  exists: exists,
  mkdir: mkdir,
  _: _
};

function read(filepath, encoding) {
  var contents;
  if (encoding === null) {
    contents = fs.readFileSync(filepath);
  } else {
    contents = fs.readFileSync(filepath, 'utf-8');
  }
  return contents;
};

function exists(filepath) {
  return filepath && fs.existsSync(filepath);
};

// courtesy of grunt
function mkdir(dirpath, mode) {
  // Set directory mode in a strict-mode-friendly way.
  if (mode == null) {
    mode = parseInt('0777', 8) & (~process.umask());
  }
  dirpath.split(/[\/\\]/g).reduce(function(parts, part) {
    parts += part + '/';
    var subpath = path.resolve(parts);
    if (!exists(subpath)) {
      try {
        fs.mkdirSync(subpath, mode);
      } catch (e) {
        throw util.error('Unable to create directory "' + subpath + '" (Error code: ' + e.code + ').', e);
      }
    }
    return parts;
  }, '');
};
