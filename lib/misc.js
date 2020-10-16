const path = require('path');

const version = require(path.join(__dirname, '..', 'package.json')).version;

module.exports = {
  version
}
