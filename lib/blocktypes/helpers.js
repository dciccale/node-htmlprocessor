'use strict';

var path = require('path');
var utils = require('../utils');

module.exports = {
  obtainAssets: obtainAssets
};

function obtainAssets(assetPathRegEx, block, html, baseDir) {
  var assets = [];
  var assetpath, fileContent, match;

  if (block.asset) {
    assetpath = path.join(baseDir, block.asset);
    fileContent = utils.read(assetpath);

    return [fileContent];
  }

  // Ignore disabled tags without joining active tags on separate lines.
  html = html.replace(/<!--[\s\S]*?-->/g, function (comment) {
    return comment.replace(/[^\r\n]/g, '');
  });

  while ((match = assetPathRegEx.exec(html)) !== null) {
    assetpath = path.join(baseDir, match[1]);
    fileContent = utils.read(assetpath);

    assets.push(fileContent);
  }

  return assets;
}
