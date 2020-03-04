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
const { version } = require('./misc');
const customHeaders = { 'User-Agent': `precious-data/${version}`, 'Cache-Control': 'no-cache' };
const rootUrl = 'http://p-memories.com';
const cardPageRegex = /p-memories.com\/node\/\d+/;
const setPageRegex = /p-memories.com\/card_product_list_page.+field_title_nid/;
const setAbbrRegex = /product\/(.+)\//;
const imageNameRegex = /\/product\/.+\/(.+_.+-.+.jpg)/;
const releaseNameRegex = /\/product\/.+\/.+_(.+)-.+.jpg/;
const setAbbrIndexPath = path.join(__dirname, '..', 'data', 'setAbbrIndex.json');
const httpAgent = axios.create({
  method: 'get',
  baseURL: rootUrl,
  headers: customHeaders
});


class Ripper {

  /**
   *
   */
  constructor(options) {
    if (typeof options === 'undefined') options = {};
    this.incremental = options.incremental;
    this.url = options.url || undefined;
    this.throttle = options.throttle || 5;
    this.all = options.all || true;
    this.set = options.set || undefined;
    this.number = options.number || undefined;
    this.quiet = options.quiet || false;
  }


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
  buildImagePath (imageUrl) {
    let setAbbr = this.getSetAbbrFromImageUrl(imageUrl);
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
  buildCardDataPath (cardData) {
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
  downloadImage (targetUrl) {
    if (typeof targetUrl === 'object') {
      // we might have got a card data object rather than a string URL
      if (targetUrl.image) return this.downloadImage(targetUrl.image);
      else throw new Error('targetUrl does not contain an image URL!');
    }
    else if (cardPageRegex.test(targetUrl)) {
      // targetUrl is a card page
      return this.ripCardData(targetUrl)
        .then((cardData) => {
          return this.downloadImage(cardData.image);
        });
    } else {
      // targetUrl is a card image
      return httpAgent
      .request({ url: targetUrl, responseType: 'stream' })
      .then((res) => {
        // ensure dir exists
        let imagePath = this.buildImagePath(targetUrl);
        debug(`writing image to ${imagePath}`);
        return fsp.mkdir(path.dirname(imagePath), { recursive: true }).then(() => {
          res.data.pipe(fs.createWriteStream(imagePath));
          return imagePath;
        })
      })
    }
  }

  normalizeUrl (url) {
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
  ripSetData (setUrl, dataAcc) {
    debug(`ripping set data from ${setUrl}`);
    setUrl = this.normalizeUrl(setUrl);
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
        let nextText = $('ul.pager > li:nth-last-child(2)').text();
        let nextPageUrl = $('ul.pager > li:nth-last-child(2) > a').attr('href');
        if (nextText === 'Next ›') {
          debug(`there is a next page. ripping ${nextPageUrl}`)
          return this.ripSetData(nextPageUrl, dataAcc);
        } else {
          debug('there are no further pages.')
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
   * @param {String} cardUrl - The URL to the card set
   * @returns {Promise}      - A promise that returns an array if resolved
   *                           or an error if rejected
   * @resolve {Object}       - An object containing card data such as title,
   *                           description, rarity, type, AP, DP, image URL, etc.
   * @rejects {Error}        - An error which states the cause
   */
  ripCardData (cardUrl) {
    return httpAgent
      .request({ url: this.normalizeUrl(cardUrl) })
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
        data.url = this.normalizeUrl(cardUrl);
        data.setAbbr = setAbbrRegex.exec(data.image)[1];
        return data;
      })
  }

  /**
   * writeCardData
   *
   * Accepts an object containing card data, and creates a JSON string
   * which is written to the appropriate location on disk.
   * To prevent the ripper from destroying local english translations,
   * writes merge JSON data files rather than blindly overwriting.
   *
   * @param {Object} cardData - the card data
   * @returns {Promise}       - A promise that returns an array if resolved
   *                            or an error if rejected
   * @resolve {String}        - The abs location on disk where the JSON was saved.
   * @rejects {Error}         - An error which states the cause
   */
  writeCardData (newCardData) {
    let cardDataPath = this.buildCardDataPath(newCardData);
    return fsp.mkdir(path.dirname(cardDataPath), { recursive: true }).then(() => {
      let existingData = {};
      try {
        existingData = require(cardDataPath);
      } catch (e) {
        debug(`${newCardData.number} has no existing data.`);
      }
      let mergedData = Object.assign({}, existingData, newCardData);
      return fsp.writeFile(
        cardDataPath, JSON.stringify(mergedData),
        { encoding: 'utf-8' }
      ).then(() => {
        return cardDataPath;
      })
    });
  }


  /**
   * getSetUrls
   *
   * accepts no parameters and returns a list of all set URLs found on p-memories
   * website.
   *
   * @returns {Promise}     - A promise that returns an array if resolved
   *                          or an error if rejected
   * @resolve {Array}       - An array containing set URLs
   * @rejects {Error}       - An error which states the cause
   */
  getSetUrls () {
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


  /**
   * ripAll
   *
   * accepts no parameters and downloads all card data and card images
   * found p-memories.com.
   *
   * @returns {Promise}     - A promise that returns a number if resolved
   *                          or an error if rejected
   * @resolve {Number}      - The number of card data ripped from p-memories
   * @rejects {Error}       - An error which states the cause
   */
  ripAll () {
    // getSetUrls => setUrls
    // for each setUrl, ripSetData. => cardUrls
    // for each cardUrl, ripCardData. => cardData
    // for each cardData, writeCardData => jsonFilePath
    // for each cardData, downloadImage => imagePath
    let dataCounter, imageCounter = 0;
    console.log('ripping all sets');
    return this.getSetUrls().then((setUrls) => {
      return Promise.mapSeries(setUrls, (setUrl) => {
        debug(`ripping set data ${setUrl}`);
        return this.ripSetData(setUrl).then((cardUrls) => {
          return Promise.mapSeries(cardUrls, (cardUrl) => {
          debug(`ripping card data ${cardUrl}`);
            return this.ripCardData(cardUrl).then((cardData) => {
              return this.conditionallyDownload(cardData).then((writeResult) => {
                if (writeResult[0]) dataCounter++;
                if (writeResult[1]) imageCounter++;
              })
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


  /**
   * conditionallyDownload
   *
   * Download the card data and image file only if it doesn't already exist
   * locally.
   *
   * @param {Object} cardData  - The cardData
   * @returns {Promise}        - A promise that returns a number if resolved
   *                             or an error if rejected
   * @resolve {Array}         - An array containing result of this.downloadImage
   *                            and this.writeCardData.
   * @rejects {Error}          - An error which states the cause
   */
  conditionallyDownload (cardData) {

    let localDataExists = this.isLocalData(cardData);
    if (localDataExists)
    return checkCardExistence(cardData).then((cardData))
    let imageWriteP = this.downloadImage(cardData);
    let dataWriteP = this.writeCardData(cardData);
    return Promise.all([imageWriteP, dataWriteP]);
  }

  /**
   * ripUrl
   *
   * Rip a resource. Used by the CLI.
   * url could be one of several resources.
   *
   *   * Card URL  (defers to ripCardData)
   *   * Set URL   (defers to ripSetData)
   *   * undefined (defers to ripAll)
   *
   * @param {String} url       - The URL to rip
   * @param {Boolean} incremental - If true, data and images are downloaded
   *                                only if they do not already exist on disk.
   * @returns {Promise}        - A promise that returns a number if resolved
   *                             or an error if rejected
   * @resolve {Number}         - The number of card data ripped
   * @rejects {Error}          - An error which states the cause
   */
  ripUrl (url, incremental) {
    let urlType = this.identifyUrl(url);
    if (urlType === 'card') {
      return this.ripCardData(url);
    } else if (urlType === 'set') {
      return this.ripSetData(url).then((cardUrls) => {
        return Promise.mapSeries(cardUrls, (cardUrl) => {
          console.log(`ripping card data ${cardUrl}`);
          return this.ripCardData(cardUrl).then((cardData) => {
            let imageWriteP = this.downloadImage(cardData);
            let dataWriteP = this.writeCardData(cardData);
            return Promise.all([imageWriteP, dataWriteP]);
          });
        });
      });
    } else {
      return ripAll();
    }
  }

  /**
   * identifyUrl
   *
   * Identify the type of URL the user is sending us. Can be either:
   *
   *   * card URL
   *   * Set URL
   *   * undefined
   *
   * @param {String} url       - the URL to identify
   * @returns {String} urlType - either, "card", or "set"
   */
   identifyUrl (url) {
    if (cardPageRegex.test(url)) {
      return 'card';
    }
    else if (setPageRegex.test(url)) {
      return 'set';
    }
    else {
      return 'unknown'
    }
  }




  /**
   * rip
   *
   * Rip card data
   *
   * Determines the correct method to use to rip card data based on input.
   * Defers to more specific functions for data rippage.
   *
   * @param {Object} options   - The URL to identify
   * @returns {Promise}        - A promise that returns a string if resolved
   *                             or an error if rejected
   * @resolve {String}         - A report of ripped card data
   * @rejects {Error}          - An error which states the cause
   */
  rip (options) {
    // throttle the upcoming requests based on the option received
    throttleRequests(httpAgent, (1000 * this.throttle));

    // Determine what the user wants
    if (this.url) {
      console.log(`Ripping ${this.url}`);
      return this.ripUrl(this.url);
    }

    else if (this.set){
      console.log(`Ripping set ${this.set}`);
      if (this.incremental === true) console.log('incremental mode ON');
      else console.log('incremental mode OFF');
      return this.getSetUrlFromSetAbbr(this.set).then((setUrl) => {
        return this.ripUrl(setUrl);
      });
    }
    else {
      console.error('Rip parameters are indeterminate');
      return Promise.reject('Rip parameters are indeterminate');
    }

  }

  /**
   * getSetUrlFromSetAbbr
   *
   * taking a set abbreviation as it's sole parameter, return a setURL
   * of the card set.
   *
   * @param {String} setAbbr       - The set abbreviation
   * @param {Number} attemptNumber - the number of times getSetUrlFromSetAbbr has
   *                                 tried. Used to limit recursive calls
   * @returns {String}             - A p-memories.com card set URL
   */
  getSetUrlFromSetAbbr (setAbbr, attemptNumber) {
    // 0) check database of mappings from card abbreviations to card set URLs
    // 1) get a sample card from each set in p-memories
    // 2) get the set abbreviation from the card image
    // 3) form a database of mappings from card abbreviations => card set URLs
    if (typeof attemptNumber === 'undefined') attemptNumber = 0;
    attemptNumber += 1;
    let setAbbrIndex;
    try {
      setAbbrIndex = require(setAbbrIndexPath);
      let matchingPair = setAbbrIndex.find((pair) => {
        return pair.setAbbr === setAbbr;
      })
      if (typeof matchingPair === 'undefined') return Promise.reject(
        'matchingPair not found. Check spelling or rebuild setAbbrIndex ($ ./p-data.js index)'
      )
      return Promise.resolve(matchingPair.setUrl);
    }
    catch (e) {
      if (attemptNumber < 2) {
        console.log('Rebuilding Set Abbreviation Index. This may take up to 10 minutes...')
        return this.createSetAbbreviationIndex().then(() => {
          return this.getSetUrlFromSetAbbr(setAbbr, attemptNumber);
        })
      } else {
        return Promise.reject(
          `could not createSetAbbreviationIndex after ${attemptNumber} attempts.`
        )
      }
    }
  };

  /**
   * getImageUrlFromEachSet
   *
   * taking a set abbreviation as it's sole parameter, return a setURL
   * of the card set.
   *
   * @returns {Array}         - A p-memories.com card set URL
   */
  getImageUrlFromEachSet () {
    return this.getSetUrls().then((setUrls) => {
      return Promise.mapSeries(setUrls, (setUrl) => {
        return Promise.props({
          setUrl: this.normalizeUrl(setUrl),
          sampleCardUrl: this.getFirstCardImageUrl(setUrl)
        })
      })
    })
  }


  /**
   * createSetAbbreviationIndex
   *
   * Create a mapping of set abbreviations to set urls.
   * This map is used to get set URLs from a set Abbreviation.
   *
   * @example
   *   [
   *     {
   *       "setAbbr": "SSSS",
   *       "setUrl": "http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on"
   *     },
   *     ...
   *  ]
   *
   * @returns {Array}         - An array of setAbbr/setUrl pairs
   */
  createSetAbbreviationIndex () {
    return this.getImageUrlFromEachSet().then((imageUrls) => {
      return Promise.map(imageUrls, (imageUrl) => {
        let { sampleCardUrl, setUrl } = imageUrl
        return Promise.props({
          setAbbr: this.getSetAbbrFromImageUrl(sampleCardUrl),
          setUrl: setUrl
        })
      }).then((index) => {
        return fsp.writeFile(
          path.join(__dirname, '..', 'data', 'setAbbrIndex.json'),
          JSON.stringify(index)
        )
      })
    });
  }

  /**
   * getSetAbbrFromImageUrl
   *
   * Determines the set abbreviation given a card image URL.
   *
   * @param {String} imageUrl  - A p-memories card image URL.
   * @returns {String}         - A p-memories set abbreviation.
   */
  getSetAbbrFromImageUrl (imageUrl) {
    debug(`getSetAbbrFromImageUrl() using ${imageUrl} as input`)
    return setAbbrRegex.exec(imageUrl)[1];
  }

  /**
   * getFirstCardImageUrl
   *
   * Accepts a set URL as parameter and returns the URL of the first card in that set.
   *
   * @param {String} setUrl - the URL to the card set
   * @returns {Promise}     - A promise that returns an string if resolved
   *                          or an error if rejected
   * @resolve {String}      - An image URL of the first card in the set
   * @rejects {Error}       - An error which states the cause
   */
  getFirstCardImageUrl (setUrl) {
    debug(`ripping set data from ${setUrl}`);
    setUrl = this.normalizeUrl(setUrl);
    return httpAgent
      .request({ url: setUrl })
      .then((res) => {
        const $ = cheerio.load(res.data);
        if (typeof dataAcc === 'undefined') dataAcc = [];
        let imageSrc = $('td:nth-child(2) a').attr('src');
        return this.normalizeUrl(imageSrc);
      })
    }
}

module.exports = Ripper;


// {
//   rip,
//   ripUrl,
//   ripAll,
//   getSetUrls,
//   ripSetData,
//   ripCardData,
//   writeCardData,
//   buildImagePath,
//   buildCardDataPath,
//   downloadImage,
//   normalizeUrl,
//   identifyUrl,
//   getSetUrlFromSetAbbr,
//   getSetAbbrFromImageUrl,
//   getFirstCardImageUrl,
//   getImageUrlFromEachSet,
//   createSetAbbreviationIndex
// }
