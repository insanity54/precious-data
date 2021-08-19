// Rip P-Memories card data and card images from P-Memories official website.
// card list seen at http://p-memories.com/card_product_list_page


// Example image
// http://p-memories.com/images/product/HMK/HMK_01-001.jpg

// Example card page
// http://p-memories.com/node/383031


const cheerio = require('cheerio');
const debug = require('debug')('precious-data');
const throttleRequests = require('./throttleRequests');
const Promise = require('bluebird');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const Fuse = require('fuse.js');
const { httpAgent } = require('./httpAgent')

const { 
  parseCardDataFromHtml,
  parseCardId,
  splitTextList,
  normalizeUrl,
} = require('./parsers');


const {
  rootUrl,
  urlRegex,
  relativeUrlRegex,
  cardPageRegex,
  setPageRegex,
  setAbbrRegex,
  imageNameRegex,
  releaseNameRegex,
  dataDir,
  setAbbrIndexPath
} = require('./constants');


class Ripper {

  /**
   *
   */
  constructor(options) {
    if (typeof options === 'undefined') options = {};
    this.incremental = options.incremental || false;
    this.url = options.url || undefined;
    this.throttle = options.throttle || 5;
    this.all = options.all || false;
    this.set = options.set || undefined;
    this.number = options.number || undefined;
    this.quiet = options.quiet || false;
    this.dataCounter = 0;
    this.imageCounter = 0;
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
  buildImagePath(imageUrl) {
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
  buildCardDataPath(cardData) {
    let setAbbr = cardData.setAbbr;
    let number = cardData.number;
    let release = cardData.number.substr(0, cardData.number.indexOf('-'));
    return path.join(__dirname, '..', 'data', setAbbr, release, `${setAbbr}_${number}.json`);
  }

  /**
   * downloadImage
   *
   * Downloads an image from the internet and resolves with a buffer of the image.
   * Accepts a card image URL OR card URL as it's parameter.
   *
   * @param {String} targetUrl - the URL to the image or card page
   * @returns {Promise}       - A promise that returns an array if resolved
   *                            or an error if rejected.
   * @resolve {Buffer}        - A buffer of the downloaded image.
   * @rejects {Error}         - An error which states the cause.
   */
  downloadImage(targetUrl) {
    if (typeof targetUrl === 'object') {
      // we might have got a card data object rather than a string URL
      if (targetUrl.image) return this.downloadImage(targetUrl.image);
      else throw new Error('targetUrl does not contain an image URL!');
    } else if (cardPageRegex.test(targetUrl)) {
      // targetUrl is a card page
      return this.ripCardData(targetUrl)
        .then((cardData) => {
          return this.downloadImage(cardData.image);
        });
    } else {
      // targetUrl is a card image
      debug(`downloading ${targetUrl}`)
      return httpAgent
        .request({
          url: targetUrl,
          responseType: 'stream'
        })
        .then((res) => {
          debug('hello world!')
          return res.data;
        })
    }
  }



  /**
   * ripSetData
   *
   * Accepts a set URL as parameter and returns a list of card URLs
   * which belong in the set.
   *
   * @param {String} setUrl   - the URL to the card set
   * @param {Array|undefined}   dataAcc - object accumulator which contains a list of card
   *                            URLs and cardImageUrls.
   *                            Used for recursive calls of this function
   *                            during ripping of multi-page sets.
   * @returns {Promise}       - A promise that returns an Array if resolved
   *                            or an error if rejected
   * @resolve {Array} setData - An array of objects which contain cardUrl and cardImageUrl
   * @rejects {Error}         - An error which states the cause
   */
  ripSetData(setUrl, dataAcc) {
    if (typeof setUrl === 'undefined') {
      return new Promise.reject(new Error('setUrl parameter is required. Got undefined'))
    }
    debug(`ripping set data from ${setUrl}`);
    setUrl = normalizeUrl(setUrl);
    return httpAgent
      .request({
        url: setUrl
      })
      .then((res) => {
        const $ = cheerio.load(res.data);
        if (typeof dataAcc === 'undefined') dataAcc = [];
        let cardA = $('td:nth-child(2) a');
        cardA.each((i, el) => {
          dataAcc.push({
            cardUrl: $(el).attr('href'),
            cardImageUrl: $(el).attr('src')
          })
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
   * isValidPMemoriesUrl
   *
   * Returns true or false depending on whether or not a valid P-memories.com
   * URL was passed as parameter.
   *
   * @param {String} url
   * @returns {Boolean} isValid - true if the url was p-memories.com url, false otherwise.
   */
  isValidPMemoriesUrl(input) {
    if (urlRegex.test(input) || relativeUrlRegex.test(input)) {
      return true;
    } else {
      return false;
    }
  }




  /**
   * ripCardData
   *
   * accepts a card URL as it's parameter and returns an object containing card
   * data and card image URL.
   *
   * @param {String} cardRef - A reference to a specific card. Can be a URL
   *                           or a Card ID
   * @returns {Promise}      - A promise that returns an array if resolved
   *                           or an error if rejected
   * @resolve {Object}       - An object containing card data such as title,
   *                           description, rarity, type, AP, DP, image URL, etc.
   * @rejects {Error}        - An error which states the cause
   */
  ripCardData(cardRef) {
    if (typeof cardRef === 'undefined') throw new Error('First param cardRef is required. Got undefined.')
    if (cardRef === '') throw new Error('First param cardRef is required. Got an empty string.')
    if (!this.isValidPMemoriesUrl(cardRef)) {
      // It's not a valid URL so we must have received a cardId
      return this.lookupCardUrl(cardRef).then((card) => {
        return this.ripCardData(card.cardUrl);
      });
    } else {
      debug(`ripping ${cardRef}`)
      return httpAgent
        .request({
          url: normalizeUrl(cardRef)
        })
        .then((res) => {
          return parseCardDataFromHtml(res.data, cardRef)
        })
    }
  }

  /**
   * lookupCardUrl
   *
   * Accepts a card ID as parameter, and resolves the appropriate cardUrl and
   * cardImageUrl belonging to that card.
   *
   * @param {String} cardId
   * @returns {Promise}       - A promise that returns an object if resolved
   *                            or an error if rejected
   * @resolve {Object} card
   * @resolve {String} card.cardUrl       - the url to the card page.
   *                                        Example: http://p-memories.com/node/926791
   * @resolve {String} card.cardImageUrl  - the image url of the card.
   *                                        Example: http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg
   */
  lookupCardUrl(cardId) {
    if (typeof cardId === 'undefined') throw new Error('First parameter to lookupCardUrl is required. Got undefined.')
    if (cardId === '') throw new Error('First parameter to lookupCardUrl cannot be an empty. Got an empty string.')
    let {
      setAbbr,
      number
    } = parseCardId(cardId);
    if (typeof setAbbr === 'undefined') throw new Error(`setAbbr could not be derived from ${cardId}`);
    return this.getSetUrlFromSetAbbr(setAbbr).then((setUrl) => {
      return this.getCardUrlsFromSetPage(number, setUrl);
    })
  }

  /**
   * getCardUrlsFromSetPage
   *
   * Accepts a cardNumber and setUrl as parameters, and returns
   * an object with cardUrl, and cardImageUrl.
   */
  getCardUrlsFromSetPage(cardNumber, setUrl) {
    return this.ripSetData(setUrl).then((cardList) => {
      let matchingCards = cardList.filter((c) => {
        let p = parseCardId(c.cardImageUrl);
        return (p.number === cardNumber)
      })
      return {
        cardUrl: normalizeUrl(matchingCards[0].cardUrl),
        cardImageUrl: normalizeUrl(matchingCards[0].cardImageUrl)
      }
    })
  }


  /**
   * getSets
   *
   * Gets a list of set names and urls on the p-memories.com
   *
   * @returns {Promise}
   *
   * @rejects {Error}
   * @resolve {Array}       - An array containing objects in the shape
   *                                               { setName, setUrl }
   */
  getSets() {
    return httpAgent
      .request({
        url: '/card_product_list_page'
      })
      .then((res) => {
        const $ = cheerio.load(res.data);
        let products = [];
        let ul = $('ul.productlist a');
        ul.each(function(i, el) {
          let url = normalizeUrl($(this).attr('href'))
          let name = $(this).text()
          products.push({ setUrl: url, setName: name });
        });
        return products;
      })
      .catch(e => {
        console.error(e);
      })
  }


  /**
   * getSetNames
   *
   * accepts no params and returns a list of set names found on p-memories.com
   *
   * @returns {Promise}
   * @resolve {Array}
   * @rejects {Error}
   */
  getSetNames() {
    return this.getSets()
      .then((sets) => {
        return sets.map((set) => set.setName)
      })
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
  getSetUrls() {
    return this.getSets()
      .then((sets) => {
        return sets.map((set) => set.setUrl)
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
  ripAll() {
    // getSetUrls => setUrls
    // for each setUrl, ripSetData. => cardUrls
    // for each cardUrl, ripCardData. => cardData
    // for each cardData, writeCardData => jsonFilePath
    // for each cardData, downloadImage => imagePath
    debug('ripping all sets');
    return this.getSetUrls().then((setUrls) => {
      return Promise.mapSeries(setUrls, (setUrl) => {
        debug(`ripping set data ${setUrl}`);
        return this.ripSetData(setUrl).then((cards) => {
          return Promise.mapSeries(cards, (card) => {
            debug(`ripping card data ${card.cardUrl}`);
            return this.ripCardDataAndSave(card.cardUrl, card.cardImageUrl)
          })
        })
      })
    }).catch((e) => {
      console.error(e);
      console.error('there was an error.');
    }).then(() => {
      debug(`done. card data: ${this.dataCounter}. images: ${this.imageCounter}`);
      return (this.dataCounter);
    })
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
   * @returns {Promise}        - A promise that returns a number if resolved
   *                             or an error if rejected
   * @resolve {Number}         - The number of card data ripped
   * @rejects {Error}          - An error which states the cause
   */
  ripUrl(url) {
    let urlType = this.identifyUrl(url);
    if (urlType === 'card') {
      return this.ripCardData(url);
    } else if (urlType === 'set') {
      return this.ripSetData(url).then((cards) => {
        return Promise.mapSeries(cards, (card) => {
          return this.ripCardDataAndSave(card.cardUrl, card.cardImageUrl);
        });
      });
    } else {
      return ripAll();
    }
  }


  /**
   * saveCardData
   *
   * Download the card data and image file
   *
   * @param {Object} cardData  - The cardData
   * @returns {Promise}        - A promise that returns a number if resolved
   *                             or an error if rejected
   * @resolve {Array}          - An array containing result of this.downloadImage
   *                             and this.writeCardData.
   * @rejects {Error}          - An error which states the cause
   */
  async saveCardData(cardData) {
    let imageWriteP = this.downloadImage(cardData);
    let dataWriteP = this.writeCardData(cardData);
    return Promise.all([imageWriteP, dataWriteP]);
  }

  /**
   * isLocalData
   *
   * Returns a promise of True or False depending on whether or not the
   * card data exists on disk.
   *
   * @param {Object} cardData
   * @returns {Promise}
   * @resolve {Boolean}
   * @rejects {Error}
   */
  isLocalData(cardData) {
    return new Promise((resolve, reject) => {
      let {
        setAbbr,
        release,
        num
      } = cardData;
      let cardDataPath = path.join(dataDir, setAbbr, release, `${setAbbr}_${release}-${num}.json`);
      let dataOnDisk;
      try {
        dataOnDisk = require(cardDataPath);
        resolve(true);
      } catch (e) {
        resolve(false);
      }
    });
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
  identifyUrl(url) {
    if (cardPageRegex.test(url)) {
      return 'card';
    } else if (setPageRegex.test(url)) {
      return 'set';
    } else {
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
   * @returns {Promise}        - A promise that returns a string if resolved
   *                             or an error if rejected
   * @resolve {String}         - A report of ripped card data
   * @rejects {Error}          - An error which states the cause
   */
  rip() {
    // throttle the upcoming requests based on the option received
    throttleRequests(httpAgent, (1000 * this.throttle));

    // Determine what the user wants
    if (this.url) {
      debug(`Ripping ${this.url}`);
      return this.ripUrl(this.url);
    } else if (this.set) {
      debug(`Ripping set ${this.set}`);
      if (this.incremental === true) debug('incremental mode ON');
      else debug('incremental mode OFF');
      return this.getSetUrlFromSetAbbr(this.set).then((setUrl) => {
        return this.ripUrl(setUrl);
      });
    } else if (this.all) {
      debug('Ripping all.');
      return this.ripAll();
    } else if (this.number) {
      debug(`ripping ${this.number}`)
      return this.ripCardDataAndSave(this.number);
    } else {
      console.error('Rip parameters are indeterminate');
      return Promise.reject('Rip parameters are indeterminate');
    }

  }

  /**
   * loadSetAbbrIndex
   *
   * load the Set Abbreviation Index from disk
   *
   * @todo https://github.com/insanity54/precious-data/issues/5
   *
   * @returns {Promise}        - A promise that returns an Array if resolved
   * @resolve {Array}          - The set abbreviation list
   * @rejects {Error}          - An error which states the cause
   */
  loadSetAbbrIndex() {
    return fsp
      .readFile(setAbbrIndexPath, { 'encoding': 'utf8' })
      .then(JSON.parse)
  }

  /**
   * getSetSuggestion
   *
   * @param {Array} setAbbrIndex
   * @param {String} setSuggestion
   * @returns {String|undefined} setSuggestion
   */
   getSetSuggestion(setAbbrIndex, setAbbr) {
     let fuse = new Fuse(setAbbrIndex, {
       keys: ['setAbbr']
     })
     let result = fuse.search(setAbbr)

     if (result.length === 0) return undefined
     let setSuggestion = result.map((r) => {
       return `${r.item.setAbbr}`
     })
     return setSuggestion
   }


  /**
   * getSetUrlFromSetAbbr
   *
   * taking a set abbreviation as it's sole parameter, resolve a setURL
   * of the matching card set.
   *
   * @param {String} setAbbr   - The set abbreviation
   * @returns {Promise}        - A promise that returns a string if resolved
   *                             or an error if rejected
   * @resolve {String}         - A p-memories.com card set URL
   * @rejects {Error}          - An error which states the cause
   */
  getSetUrlFromSetAbbr(setAbbr) {
    return this.loadSetAbbrIndex()
      .then((setAbbrIndex) => {
        debug('the following is the setAbbrIndex')
        debug(setAbbrIndex)

        // reject if the index doesn't exist
        // @todo https://github.com/insanity54/precious-data/issues/5
        if (typeof setAbbrIndex === 'undefined') {
          throw new Error(
            `Set Abbreviation Index does not exist. Please create it using ./p-data.js index`
          )
        }

        // find the matching url.
        // if there is no exact match, make a suggestion.
        let matchingPair = setAbbrIndex.find((pair) => {
          return pair.setAbbr === setAbbr;
        })
        if (typeof matchingPair === 'undefined') {
          let errorMessage = `matchingPair not found. getSetUrlFromSetAbbr() was unable to find a URL which matches "${setAbbr}" `;

          // check to see if there is a set with a similar name
          let setSuggestions = this.getSetSuggestion(setAbbrIndex, setAbbr)
          if (typeof setSuggestions !== 'undefined') {
            errorMessage = errorMessage.concat('Did you mean ')
            errorMessage = errorMessage.concat(setSuggestions.join(' or ')).concat('?\n')
          }

          errorMessage = errorMessage.concat('Check spelling and capitalization or rebuild the Set Abbreviation Index (p-data.js index --help)\n')

          throw new Error(errorMessage)
        } else {
          return matchingPair.setUrl;
        }
      })
  };

  /**
   * getImageUrlFromEachSet
   *
   * Returns an array containing the url of the first card of each set
   * of the card set.
   * @example [
       {
         setUrl: 'http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on',
         sampleCardUrl: 'http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg'
       }
       (...)
     ]
   *
   * @returns {Promise}
   * @resolves {Array}         - A p-memories.com card set URL
   */
  getImageUrlFromEachSet() {
    return this.getSetUrls().then((setUrls) => {
      return Promise.mapSeries(setUrls, (setUrl) => {
        return Promise.props({
          setUrl: setUrl,
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
   * @returns {Promise}
   * @resolves {String}         - An stringified array of setAbbr/setUrl pairs
   */
  createSetAbbreviationIndex() {
    let setAbbrIndexPath = path.join(__dirname, '..', 'data', 'setAbbrIndex.json');
    return this.getImageUrlFromEachSet().then((imageUrls) => {
      return Promise.map(imageUrls, (imageUrl) => {
        debug(`creating setAbbreviationIndex for ${imageUrl}`)
        let {
          sampleCardUrl,
          setUrl
        } = imageUrl
        return Promise.props({
          setAbbr: this.getSetAbbrFromImageUrl(sampleCardUrl),
          setUrl: setUrl
        })
      }).then((index) => {
        return fsp.writeFile(
          setAbbrIndexPath,
          JSON.stringify(index)
        )
        .then(() => setAbbrIndexPath)
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
  getSetAbbrFromImageUrl(imageUrl) {
    if (typeof imageUrl === 'undefined') throw new Error('The imageUrl is required. Got undefined.')
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
  getFirstCardImageUrl(setUrl) {
    debug(`ripping set data from ${setUrl}`);
    setUrl = normalizeUrl(setUrl);
    return httpAgent
      .request({
        url: setUrl
      })
      .then((res) => {
        const $ = cheerio.load(res.data);
        let imageSrc = $('td:nth-child(2) a').attr('src');
        return normalizeUrl(imageSrc);
      })
  }


}

module.exports = Ripper;
