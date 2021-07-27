
// dependencies
const Promise = require('bluebird');
const cheerio = require('cheerio');

// constants
const cardIdRegex = /([\w\d-]+)(?:_| )(([\w\d]+)-([\d]+)([\w\d]*))/;


function normalizeUrl (url) {
  if (typeof url === 'undefined') {
    return url
  } else {
    if (url.startsWith(rootUrl)) {
      return url;
    } else {
      return `${rootUrl}${url}`;
    }
  }
}


/**
 * splitTextList
 *
 * converts a {String} list such as '' to an array, using comma as delimiter
 *
 * @param {String} textList
 * @returns {Array} list
 */
 function splitTextList(textList) {
   if (typeof textList === 'undefined') return [];
   if (textList === '') return [];
   return textList.split('、')
 }


/**
 * parseCardDataFromHtml
 *
 * @param {String} html     - the html to parse
 * @returns {Promise}       - A promise which resolves with an object if successful
 *                            or an error if failed
 * @resolve {Object}        - An object containing card data such as title,
 *                            description, rarity, type, AP, DP, image URL, etc.
 * @rejects {Error}         - An error which states the cause
 */
 function parseCardDataFromHtml(html) {
   return new Promise((resolve, reject) => {
     if (typeof html === 'undefined') throw new Error('First parameter required. Got undefined')

     const $ = cheerio.load(html);
     let data = {};

     /** Data gathered from the card data table on the webpage */
     data.number = $('.cardDetail > dl:nth-child(1) > dd:nth-child(2)').text();
     data.rarity = $('.cardDetail > dl:nth-child(2) > dd:nth-child(2)').text();
     data.setName = $('.cardDetail > dl:nth-child(3) > dd:nth-child(2)').text();
     data.name = $('.cardDetail > dl:nth-child(4) > dd:nth-child(2)').text();
     data.type = $('.cardDetail > dl:nth-child(5) > dd:nth-child(2)').text();
     data.cost = $('.cardDetail > dl:nth-child(6) > dd:nth-child(2)').text();
     data.source = $('.cardDetail > dl:nth-child(7) > dd:nth-child(2)').text();
     data.color = $('.cardDetail > dl:nth-child(8) > dd:nth-child(2)').text();
     data.characteristic = splitTextList($('.cardDetail > dl:nth-child(9) > dd:nth-child(2)').text());
     data.ap = $('.cardDetail > dl:nth-child(10) > dd:nth-child(2)').text();
     data.dp = $('.cardDetail > dl:nth-child(11) > dd:nth-child(2)').text();
     data.parallel = $('.cardDetail > dl:nth-child(12) > dd:nth-child(2)').text();
     data.text = $('.cardDetail > dl:nth-child(13) > dd:nth-child(2)').text();
     data.flavor = $('.cardDetail > dl:nth-child(14) > dd:nth-child(2)').text();

     /** Data that I think is good which isn't explicitly in the page */
     data.image = normalizeUrl($('.Images_card > img:nth-child(1)').attr('src'))
     data.url = `http://p-memories.com/node/${$('body').attr('id').split('-').pop()}`;
     data.setAbbr = setAbbrRegex.exec(data.image)[1];
     let {
       num,
       release,
       id
     } = this.parseCardId(data.image);
     data.num = num;
     data.release = release;
     data.id = id;
     resolve(data)
   })
 }


/**
 * parseCardId
 *
 * parses the card ID and returns an object containing
 *   * setAbbr
 *   * release
 *   * number
 *   * num
 *   * id
 *   * variation
 *
 * @param {String} cardId
 * @returns {Promise} - A promise that returns an object if resolved
 *                          or an error if rejected
 * @resolve {Object}
 * @rejects {Error}
 */
function parseCardId(cardId) {
  if (typeof cardId === 'undefined') throw new Error('first parameter to parsecardId must be a card ID. Got undefined.')
  let parseError = new Error(`cardId is not valid. CardId must be in the format, "<setAbbr> <release>-<num>". Got: ${cardId}`);
  let r = cardIdRegex.exec(cardId);
  if (!r) throw parseError;
  let setAbbr = r[1];
  let number = r[2];
  let release = r[3];
  let num = r[4];
  let variation = r[5];
  let id = `${setAbbr} ${release}-${num}${variation}`;
  if (
    typeof number === 'undefined' ||
    typeof setAbbr === 'undefined' ||
    typeof num === 'undefined' ||
    typeof release === 'undefined' ||
    typeof id === 'undefined' ||
    typeof variation === 'undefined'
  ) {
    throw parseError
  } else {
    return {
      setAbbr,
      number,
      release,
      num,
      id,
      variation
    }
  }
}


module.exports = {
  parseCardId,
  parseCardDataFromHtml,
  splitTextList,
  normalizeUrl,
}
