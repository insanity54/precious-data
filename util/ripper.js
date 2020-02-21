// Rip P-Memories card data and card images from P-Memories official website.

// card list seen at http://p-memories.com/card_product_list_page


// Example image
// http://p-memories.com/images/product/HMK/HMK_01-001.jpg

// Example card page
// http://p-memories.com/node/383031


const axios = require('axios');
const cheerio = require('cheerio');
const debug = require('debug')('precious-data');
const throttleRequests = require('./throttleRequests');
const Promise = require('bluebird');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

// constants
const version = require(path.join(__dirname, '..', 'package.json')).version;
const customHeaders = {'User-Agent': `precious-data/${version}`, 'Cache-Control': 'no-cache' };
const rootUrl = 'http://p-memories.com';
const cardPageRegex = /p-memories.com\/node\/\d+/;
const setAbbrRegex = /product\/(.+)\//;
const imageNameRegex = /\/product\/.+\/(.+_.+-.+.jpg)/;
const releaseNameRegex = /\/product\/.+\/.+_(.+)-.+.jpg/;
const httpAgent = axios.create({
  method: 'get',
  baseURL: rootUrl,
  headers: customHeaders
});
throttleRequests(httpAgent, 5000);


/**
 * buildImagePath
 *
 * Accepts an image URL as it's parameter and returns
 * a string of the perfect path on disk where the image should be saved.
 * The perfect path includes set abbreviation (ex: HMK,)
 * release number (ex: 01) and image name. (ex: HMK_01-001.json.)
 *
 * @example
 *   buildImagePath('http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg')
 *   => "@/data/SSSS/01/SSSS_01-001.jpg" (where @ is this project root.)
 *
 * @param {String} imageUrl - the URL to the image.
 * @returns {Promise}       - A promise that returns an array if resolved
 *                            or an error if rejected.
 * @resolve {String}        - An absolute path on disk.
 * @rejects {Error}         - An error which states the cause.
 */
const buildImagePath = (imageUrl) => {
  let setAbbr = setAbbrRegex.exec(imageUrl)[1];
  let imageName = imageNameRegex.exec(imageUrl)[1];
  let releaseName = releaseNameRegex.exec(imageUrl)[1];
  debug(`setAbbr:${setAbbr}, imageName:${imageName}, releaseName:${releaseName}`);
  return path.join(__dirname, '..', 'data', setAbbr, releaseName, imageName);
}

/**
 * buildCardDataPath
 *
 * Accepts a card URL as it's parameter and returns a string of the
 * perfect path on disk where the card data JSON should be saved.
 * The perfect path includes set abbreviation (ex: HMK,)
 * release number (ex: 01) and image name. (ex: HMK_01-001.json.)
 *
 * @example buildCardDataPath({"set": "HMK", "number": "01-001", ... })
 *          => "@/data/HMK/01/HMK_01-001.json" (where @ is project root)
 *
 * @param {String} cardUrl  - the URL to the card page on p-memories website.
 * @returns {Promise}       - A promise that returns a string if resolved
 *                            or an error if rejected.
 * @resolve {String}        - An absolute path on disk.
 * @rejects {Error}         - An error which states the cause.
 */
const buildCardDataPath = (cardData) => {
  let setAbbr = cardData.setAbbr;
  let number = cardData.number;
  let release = cardData.number.substr(0, cardData.number.indexOf('-'));
  return path.join(__dirname, '..', 'data', setAbbr, release, `${setAbbr}_${number}.json`);
}

/**
 * downloadImage
 *
 * Accepts a card image URL OR card URL as it's parameter and returns
 * a string of the path on disk where the image was saved.
 *
 * @param {String} targetUrl - the URL to the image or card page
 * @returns {Promise}       - A promise that returns an array if resolved
 *                            or an error if rejected.
 * @resolve {String}        - A string which tells where the image was saved.
 * @rejects {Error}         - An error which states the cause.
 */
const downloadImage = (targetUrl) => {
  if (typeof targetUrl === 'object') {
    // we might have got a card data object rather than a string URL
    if (targetUrl.image) return downloadImage(targetUrl.image);
    else throw new Error('targetUrl does not contain an image URL!');
  }
  else if (cardPageRegex.test(targetUrl)) {
    // targetUrl is a card page
    return ripCardData(targetUrl)
      .then((cardData) => {
        return downloadImage(cardData.image);
      });
  } else {
    // targetUrl is a card image
    if (targetUrl)
    return httpAgent
    .request({ url: targetUrl, responseType: 'stream' })
    .then((res) => {
      // ensure dir exists
      let imagePath = buildImagePath(targetUrl);
      debug(`writing image to ${imagePath}`);
      return fsp.mkdir(path.dirname(imagePath), { recursive: true }).then(() => {
        res.data.pipe(fs.createWriteStream(imagePath));
        return imagePath;
      })
    })
  }
}

const normalizeUrl = (url) => {
  if (url.startsWith(rootUrl)) {
    return url;
  } else {
    return `${rootUrl}${url}`;
  }
}


/**
 * ripSetData
 *
 * Accepts a set URL as parameter and returns a list of card URLs
 * which belong in the set.
 *
 * @param {String} setUrl - the URL to the card set
 * @param {Array} dataAcc - array accumulator which contains the list of card
 *                          URLs. Used for recursive calls of this function
 *                          during ripping of multi-page sets.
 * @returns {Promise}     - A promise that returns an array if resolved
 *                          or an error if rejected
 * @resolve {Array}       - A list of card URLs contained in this set.
 * @rejects {Error}       - An error which states the cause
 */
const ripSetData = (setUrl, dataAcc) => {
  debug(`ripping set data from ${setUrl}`);
  setUrl = normalizeUrl(setUrl);
  return httpAgent
    .request({ url: setUrl })
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

/**
 * ripCardData
 *
 * accepts a card URL as it's parameter and returns an object containing card
 * data and card image URL.
 *
 * @param {String} cardUrl - the URL to the card set
 * @returns {Promise}     - A promise that returns an array if resolved
 *                          or an error if rejected
 * @resolve {Object}      - An object containing card data such as title,
 *                          description, rarity, type, AP, DP, image URL, etc.
 * @rejects {Error}       - An error which states the cause
 */
const ripCardData = (cardUrl) => {
  return httpAgent
    .request({ url: normalizeUrl(cardUrl) })
    .then((res) => {
      const $ = cheerio.load(res.data);
      let data = {};

      /** Data gathered from the card data table on the webpage */
      data.number = $('.cardDetail > dl:nth-child(1) > dd:nth-child(2)').text();
      data.rarity = $('.cardDetail > dl:nth-child(2) > dd:nth-child(2)').text();
      data.setName = $('.cardDetail > dl:nth-child(3) > dd:nth-child(2)').text();
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

      /** Data that I think is good which isn't specifically in the page */
      data.image = $('.Images_card > img:nth-child(1)').attr('src');
      data.image = `${rootUrl}${data.image}`;
      data.url = normalizeUrl(cardUrl);
      data.setAbbr = setAbbrRegex.exec(data.image)[1];
      return data;
    })
}

/**
 * writeCardData
 *
 * Accepts an object containing card data, and creates a JSON string
 * which is written to the appropriate location on disk.
 *
 * @param {Object} cardData - the card data
 * @returns {Promise}       - A promise that returns an array if resolved
 *                            or an error if rejected
 * @resolve {String}        - The abs location on disk where the JSON was saved.
 * @rejects {Error}         - An error which states the cause
 */
const writeCardData = (cardData) => {
  let cardDataPath = buildCardDataPath(cardData);
  return fsp.mkdir(path.dirname(cardDataPath), { recursive: true }).then(() => {
    return fsp.writeFile(
      cardDataPath, JSON.stringify(cardData),
      { encoding: 'utf-8' }
    ).then(() => {
      return cardDataPath;
    })
  });
}


/**
 * ripAllSets
 *
 * accepts no parameters and returns a list of set URLs found on p-memories
 * website.
 *
 * @returns {Promise}     - A promise that returns an array if resolved
 *                          or an error if rejected
 * @resolve {Array}       - An array containing set URLs
 * @rejects {Error}       - An error which states the cause
 */
const ripAllSets = () => {
  return httpAgent
    .request({ url: '/card_product_list_page' })
    .then((res) => {
      const $ = cheerio.load(res.data);
      let products = [];
      let ul = $('ul.productlist a');
      ul.each(function (i, el) {
        products.push($(this).attr('href'));
      });
      return products;
    })
    .catch(e => {
      console.error(e);
    })
}


// ripAllSets => setUrls
// for each setUrl, ripSetData. => cardUrls
// for each cardUrl, ripCardData. => cardData
// for each cardData, writeCardData => jsonFilePath
// for each cardData, downloadImage => imagePath

/**
 * ripperoni
 *
 * accepts no parameters and downloads all card data and card images
 * found p-memories.com.
 *
 * @returns {Promise}     - A promise that returns a number if resolved
 *                          or an error if rejected
 * @resolve {Number}      - The number of card data ripped from p-memories
 * @rejects {Error}       - An error which states the cause
 */
const ripperoni = () => {
  let dataCounter, imageCounter = 0;
  debug('ripping all sets');
  return ripAllSets().then((setUrls) => {
    return Promise.mapSeries(setUrls, (setUrl) => {
      debug(`ripping set data ${setUrl}`);
      return ripSetData(setUrl).then((cardUrls) => {
        return Promise.mapSeries(cardUrls, (cardUrl) => {
        debug(`ripping card data ${cardUrl}`);
          return ripCardData(cardUrl).then((cardData) => {
            let imageWriteP = downloadImage(cardData);
            let dataWriteP = writeCardData(cardData);
            return Promise.all([imageWriteP, dataWriteP]);
          }).then((writeResult) => {
            if (writeResult[0]) dataCounter++;
            if (writeResult[1]) imageCounter++;
          })
        })
      })
    })
  }).catch((e) => {
    console.error(e);
  }).then(() => {
    console.log(`done. card data: ${dataCounter}. images: ${imageCounter}`);
    return (dataCounter);
  })
}

module.exports = {
  ripperoni,
  ripAllSets,
  ripSetData,
  ripCardData,
  writeCardData,
  buildImagePath,
  buildCardDataPath,
  downloadImage,
  normalizeUrl
}
