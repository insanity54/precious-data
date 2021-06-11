
const globby = require('globby');

const exp = {
	cards: collectCards(),
	version: require('./package.json').version
};

function collectCards() {
	const cardPaths = globby.sync('./data/**/*.json')

	let data = [];

	for (cardPath of cardPaths) {
		if (!cardPath.includes('setAbbrIndex.json')) {
			const d = require(cardPath);
			data.push(d);
		}
	}

	return data
}



module.exports = exp

