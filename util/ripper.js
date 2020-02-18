// Rip P-Memories card data and card images from P-Memories official website.

// card list seen at http://p-memories.com/card_product_list_page


// Example image
// http://p-memories.com/images/product/HMK/HMK_01-001.jpg

// Example card page
// http://p-memories.com/node/383031


const axios = require('axios');
const cheerio = require('cheerio');
const Promise = require('bluebird');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const debug = require('debug')('precious-data');
const rootUrl = 'http://p-memories.com';


const buildImagePath = (imageUrl) => {
  // input: http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg
  // output: @/data/SSSS/SSSS_01-001.jpg
  return path.join(__dirname, '..', 'data', imageUrl.substr(imageUrl.indexOf('product/')+7));
}

const buildCardDataPath = (cardData) => {
  // input: { "set": "HMK", "number": "01-001", ... }
  // output: @/data/HMK/01/HMK_01-001.json
  let set = cardData.set;
  let number = cardData.number;
  let release = cardData.number.substr(0, cardData.number.indexOf('-'));
  return path.join(__dirname, '..', 'data', set, release, `${set}_${number}.json`);
}

const downloadImage = (imageUrl) => {
  return axios({
    method: 'get',
    url: imageUrl,
    responseType: 'stream'
  })
  .then((res) => {
    // ensure dir exists
    let imagePath = buildImagePath(imageUrl);
    return fsp.mkdir(path.dirname(imagePath), { recursive: true }).then(() => {
      res.data.pipe(fs.createWriteStream(imagePath));
      return imagePath;
    })
  })
  .then(() => {

  })
}

const normalizeUrl = (url) => {
  if (url.startsWith(rootUrl)) {
    return url;
  } else {
    return `${rootUrl}${url}`;
  }
}


// collect set's images and card data.
const ripSetData = (setUrl, dataAcc) => {
  debug(`ripping set data from ${setUrl}`);
  setUrl = normalizeUrl(setUrl);
  return axios
    .get(setUrl)
    .then((res) => {
      const $ = cheerio.load(res.data);
      if (typeof dataAcc === 'undefined') dataAcc = [];
      let cardA = $('td:nth-child(2) a');
      cardA.each((i, el) => {
        dataAcc.push($(el).attr('href'));
      });
      // if there is a next page, get data from that page as well.
      // ul.pager > li:nth-child(3) > a:nth-child(1)
      let nextText = $('ul.pager > li:nth-last-child(2)').text();
      let nextPageUrl = $('ul.pager > li:nth-last-child(2) > a').attr('href');
      if (nextText === 'Next ›') {
        return ripSetData(nextPageUrl, dataAcc);
      } else {
        return dataAcc;
      }
    })
}

const ripCardData = (cardUrl) => {
  return axios
    .get(cardUrl)
    .then((res) => {
      const $ = cheerio.load(res.data);
      let data = {};
      data.number = $('.cardDetail > dl:nth-child(1) > dd:nth-child(2)').text();
      data.rarity = $('.cardDetail > dl:nth-child(2) > dd:nth-child(2)').text();
      data.set = $('.cardDetail > dl:nth-child(3) > dd:nth-child(2)').text();
      data.name = $('.cardDetail > dl:nth-child(4) > dd:nth-child(2)').text();
      data.type = $('.cardDetail > dl:nth-child(5) > dd:nth-child(2)').text();
      data.usageCost = $('.cardDetail > dl:nth-child(6) > dd:nth-child(2)').text();
      data.outbreakCost = $('.cardDetail > dl:nth-child(7) > dd:nth-child(2)').text();
      data.color = $('.cardDetail > dl:nth-child(8) > dd:nth-child(2)').text();
      data.characteristic = $('.cardDetail > dl:nth-child(9) > dd:nth-child(2)').text();
      data.ap = $('.cardDetail > dl:nth-child(10) > dd:nth-child(2)').text();
      data.dp = $('.cardDetail > dl:nth-child(11) > dd:nth-child(2)').text();
      data.parallel = $('.cardDetail > dl:nth-child(12) > dd:nth-child(2)').text();
      data.text = $('.cardDetail > dl:nth-child(13) > dd:nth-child(2)').text();
      data.flavor = $('.cardDetail > dl:nth-child(14) > dd:nth-child(2)').text();
      data.image = $('.Images_card > img:nth-child(1)').attr('src');
      data.image = `${rootUrl}${data.image}`;
      return data;
    })
}

const writeCardData = (cardData) => {
  let cardDataPath = buildCardDataPath(cardData);
  return fsp.mkdir(path.dirname(cardDataPath), { recursive: true }).then(() => {
    return fsp.writeFile(cardDataPath, JSON.stringify(cardData), { encoding: 'utf-8' });
  });
}

const ripAll = () => {
  return axios
  .get(`${rootUrl}/card_product_list_page`)
  .then((res) => {
    const $ = cheerio.load(res.data);
    let products = [];
    let ul = $('ul.productlist a');
    ul.each(function (i, el) {
      products.push($(this).attr('href'));
    });
    return products;
  })
  .then((products) => {
    return new Promise.each((resolve, reject) => {

    })
  })
}


module.exports = {
  ripAll,
  ripCardData,
  ripSetData,
  writeCardData,
  buildImagePath,
  buildCardDataPath,
  downloadImage,
  normalizeUrl
}
