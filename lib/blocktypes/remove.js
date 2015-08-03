'use strict';

module.exports = remove;

function remove(content, block, blockLine, blockContent) {
  // Replace blockLine with surrounding new line symbols with empty string
  return content.split(this.linefeed + blockLine + this.linefeed).join('');
}
