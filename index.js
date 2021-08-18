
const path = require('path');
const globby = require('globby');
const fs = require('fs');

const exp = {
	cards: collectCards(),
	sets: collectSets(),
	version: require('./package.json').version,
	parsers: require('./lib/parsers')
};

function getCardImagePath(cardJsonPath) {
	const directory = path.dirname(cardJsonPath);
	const basename = path.basename(cardJsonPath, '.json');
	return path.join(directory, `${basename}.jpg`);
}

function collectSets() {
	const json = require(path.join(__dirname, 'data', 'setAbbrIndex.json'));
	const setAbbrIndex = JSON.parse(json);
	return setAbbrIndex;
}

function collectCards() {
	const cardPaths = globby.sync(path.join(__dirname, './data/**/*.json'));

	let data = [];

	for (cardPath of cardPaths) {
		if (!cardPath.includes('setAbbrIndex.json')) {
			let d = require(cardPath);
			// add imageData to the json
			d['imagePath'] = getCardImagePath(cardPath)

			// add card data to data object
			data.push(d);
		}
	}

	return data
}


module.exports = exp

