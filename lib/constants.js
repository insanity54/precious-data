const path = require('path');


const rootUrl = 'http://p-memories.com';
const urlRegex = /(?:http(?:s?):\/\/)?p-memories\.com/;
const relativeUrlRegex = /\/node\/\d+/;
const cardPageRegex = /p-memories.com\/node\/\d+/;
const setPageRegex = /p-memories.com\/card_product_list_page.+field_title_nid/;
const setAbbrRegex = /product\/(.+)\//;
const imageNameRegex = /\/product\/.+\/(.+_.+-.+.jpg)/;
const releaseNameRegex = /\/product\/.+\/.+_(.+)-.+.jpg/;
const dataDir = path.join(__dirname, '..', 'data');
const setAbbrIndexPath = path.join(__dirname, '..', 'data', 'setAbbrIndex.json');
const cardIdRegex = /([\w\d-]+)(?:_| )(([\w\d]+)-([\d]+)([\w\d]*))/;



module.exports = {
	rootUrl,
	urlRegex,
	relativeUrlRegex,
	cardPageRegex,
	setPageRegex,
	setAbbrRegex,
	imageNameRegex,
	releaseNameRegex,
	dataDir,
	setAbbrIndexPath,
	cardIdRegex
}