'use strict';

var path = require('path');
var utils = require('../utils');

module.exports = include;

function include(content, block, blockLine, blockContent, filepath) {
  var base = this.options.includeBase || path.dirname(filepath);
  var assetpath = path.join(base, block.asset);
  var l = blockLine.length;
  var fileContent, i;

  if (utils.exists(assetpath)) {

    // Recursively process included files
    if (this.options.recursive) {
      fileContent = this.process(assetpath);

    } else {
      fileContent = utils.read(assetpath);
    }

    // Add indentation and remove any last new line
    fileContent = block.indent + fileContent.replace(/(\r\n|\n)$/, '');

    while ((i = content.indexOf(blockLine)) !== -1) {
      content = content.substring(0, i) + fileContent + content.substring(i + l);
    }
  }

  return content;
}
