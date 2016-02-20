'use strict';

var path = require('path');
var helpers = require('./helpers');
var srcRegEx = /.*src=[\'"]([^\'"]*)[\'"].*/gi;
var crypto = require('crypto');
var fs = require('fs');

module.exports = js;

function js(content, block, blockLine, blockContent, filepath) {
  var scripts = [];
  var replacement;
  var assetContent;
  var baseDir = this.options.includeBase || path.dirname(filepath);
  var md5sum;
  var newName;

  if (block.checksum) {
    assetContent = obtainScripts(block, blockContent, baseDir)[0];
    md5sum = crypto.createHash('md5').update(assetContent).digest('hex');
    newName = block.asset.replace(/((\.min)?\.js)$/, '.' + md5sum.substr(0, 8) + '$1');
    fs.renameSync(path.join(baseDir, block.asset), path.join(baseDir, newName));
    block.asset = newName;
  } else if (block.inline) {
    scripts = obtainScripts(block, blockContent, baseDir);
    replacement = block.indent + '<script>' + this.linefeed +
                  scripts.join(this.linefeed) +
                  block.indent + '</script>';

    return content.split(blockLine).join(replacement);
  }

  return content.replace(blockLine, block.indent + '<script src="' + block.asset + '"><\/script>');
}

function obtainScripts(block, html, baseDir) {
  return helpers.obtainAssets(srcRegEx, block, html, baseDir);
}
