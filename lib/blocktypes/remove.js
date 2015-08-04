'use strict';

module.exports = remove;

function remove(content, block, blockLine, blockContent) {
  // Replace blockLine with surrounding new line symbols (if present) with empty string
  var linefeedStart = content.match(this.linefeed + blockLine) ? this.linefeed : '';
  return content.split(linefeedStart + blockLine + this.linefeed).join('');
}
