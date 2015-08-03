/*
 * node-htmlprocessor
 * https://github.com/dciccale/node-htmlprocessor
 *
 * Copyright (c) 2013-2015 Denis Ciccale (@tdecs)
 * Licensed under the MIT license.
 * https://github.com/dciccale/node-htmlprocessor/blob/master/LICENSE-MIT
 */

'use strict';

module.exports = {
  css: require('./css'),
  js: require('./js'),
  attr: require('./attr'),
  remove: require('./remove'),
  template: require('./template'),
  include: require('./include')
};
