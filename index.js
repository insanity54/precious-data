
const path = require('path');
const globby = require('globby');
const fs = require('fs');

module.exports = {
	version: require('./package.json').version,
	parsers: require('./lib/parsers'),
	query: require('./lib/query')
};



