'use strict';

module.exports = remove;

function remove(content, block, blockLine, blockContent) {
  var safeBlockLine = blockLine.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
  // Remove each block and its adjacent line endings, including at end of file.
  var linefeed = this.linefeed.replace(/\r/g, '\\r').replace(/\n/g, '\\n');
  return content.replace(new RegExp('(?:' + linefeed + ')?' + safeBlockLine +
    '(?:' + linefeed + '|$)', 'g'), '');
}
