const chai = require("chai");
const assert = chai.assert;
const chaiAsPromised = require("chai-as-promised");
const Ripper = require('../util/ripper');
const fs = require('fs');
const path = require('path');
chai.use(chaiAsPromised);

let ripper
beforeEach(function () {
  ripper = new Ripper();
})

describe('P-Memories Ripper Library', function() {
  describe('getCardUrlsFromSetPage', function () {
    this.timeout(30000);
    it('should accept a card number and setUrl and resolve an object with cardUrl and cardImageUrl', function () {
      return ripper.getCardUrlsFromSetPage('01-050', 'http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on').then((card) => {
        assert.isObject(card);
        assert.equal(card.cardUrl, 'http://p-memories.com/node/926840');
        assert.equal(card.cardImageUrl, 'http://p-memories.com/images/product/SSSS/SSSS_01-050.jpg');
      })
    })
  })

  describe('lookupCardUrl', function () {
    this.timeout(30000);
    it('should resolve { cardUrl, cardImageUrl } when given a card ID', function () {
      return ripper.lookupCardUrl('SSSS_01-001').then((card) => {
        assert.isObject(card);
        assert.equal(card.cardUrl, 'http://p-memories.com/node/926791');
        assert.equal(card.cardImageUrl, 'http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg');
      })
    })
  });

  describe('isValidPMemoriesUrl', function () {
    it('should return true when receiving p-memories.com url as param', function () {
      let valid = ripper.isValidPMemoriesUrl('http://p-memories.com/node/926791');
      assert.isTrue(valid);
    });
    it('should return false when receiving a foreign url as param', function () {
      let invalid = ripper.isValidPMemoriesUrl('http://google.com');
      assert.isFalse(invalid);
    });
    it('should return false when receiving a card ID', function () {
      let invalid = ripper.isValidPMemoriesUrl('SSSS_01-001')
      assert.isFalse(invalid);
    })
  });

  describe('isLocalData', function () {
    it('should return a promise with true for a card that exists on disk', async function () {
      let cardData = require('../fixtures/HMK_01-001.json');
      let isLocalData = await ripper.isLocalData(cardData);
      assert.isTrue(isLocalData);
    });
    it('should return a promise with false for a card that does not exist on disk', async function () {
      let cardData = require('../fixtures/BBQ_OZ-541.json');
      let isLocalData = await ripper.isLocalData(cardData);
      assert.isFalse(isLocalData);
    });
  });

  describe('parseCardId', function () {

    /**
    for Rubular testing:

/images/product/PM_HS/PM_HS_01-002.jpg
PM_HS_03-008
http://p-memories.com/images/product/GPFN/GPFN_01-030a.jpg
SSSS_P-001
http://p-memories.com/images/product/HMK/HMK_01-001.jpg
/images/product/PM_K-ON_Part2/PM_K-ON_Part2_02-048.jpg

     */
    it('should return an object with setAbbr, release, number, and num', function () {
      let p = ripper.parseCardId('HMK_01-001');
      assert.equal(p.setAbbr, 'HMK');
      assert.equal(p.release, '01');
      assert.equal(p.number, '01-001');
      assert.equal(p.num, '001');
      assert.equal(p.id, 'HMK_01-001');
      assert.equal(p.variation, '');
    });

    it('should accept a relative image URL as param', function () {
      let p = ripper.parseCardId('/images/product/YYY2/YYY2_02-001.jpg');
      assert.equal(p.setAbbr, 'YYY2');
      assert.equal(p.release, '02');
      assert.equal(p.number, '02-001');
      assert.equal(p.num, '001');
      assert.equal(p.id, 'YYY2_02-001');
      assert.equal(p.variation, '');
    });

    it('should accept an image URL as param', function () {
      let p = ripper.parseCardId('http://p-memories.com/images/product/HMK/HMK_01-001.jpg');
      assert.equal(p.setAbbr, 'HMK');
      assert.equal(p.release, '01');
      assert.equal(p.number, '01-001');
      assert.equal(p.num, '001');
      assert.equal(p.id, 'HMK_01-001');
      assert.equal(p.variation, '');
    });

    it('should reject when the card ID is not valid', function () {
      assert.throws(ripper.parseCardId.bind(ripper, 'tacobell'), /not valid/);
    });

    it('should handle a card ID with a letter as the release', function () {
      let p = ripper.parseCardId('SSSS_P-001');
      assert.equal(p.setAbbr, 'SSSS');
      assert.equal(p.release, 'P');
      assert.equal(p.number, 'P-001');
      assert.equal(p.num, '001');
      assert.equal(p.id, 'SSSS_P-001');
      assert.equal(p.variation, '');
    });

    it('should handle a card ID with a letter variation at the end', function () {
      let p = ripper.parseCardId('http://p-memories.com/images/product/GPFN/GPFN_01-030a.jpg');
      assert.equal(p.setAbbr, 'GPFN');
      assert.equal(p.release, '01');
      assert.equal(p.number, '01-030a');
      assert.equal(p.num, '030');
      assert.equal(p.id, 'GPFN_01-030a');
      assert.equal(p.variation, 'a');
    })

    it('should handle a card ID an underscore in the setAbbr', function () {
      let p = ripper.parseCardId('PM_HS_03-008');
      assert.equal(p.setAbbr, 'PM_HS');
      assert.equal(p.release, '03');
      assert.equal(p.number, '03-008');
      assert.equal(p.num, '008');
      assert.equal(p.id, 'PM_HS_03-008');
      assert.equal(p.variation, '');
    });

    it('should handle a cardID with underscores and a relative URL', function () {
      let p = ripper.parseCardId('/images/product/PM_HS/PM_HS_01-002.jpg');
      assert.equal(p.setAbbr, 'PM_HS')
      assert.equal(p.release, '01')
      assert.equal(p.number, '01-002')
      assert.equal(p.num, '002')
      assert.equal(p.id, 'PM_HS_01-002')
      assert.equal(p.variation, '')
    })

    it('should handle a cardID with multiple underscores in the set name', function () {
      let p = ripper.parseCardId('/images/product/PM_K-ON_Part2/PM_K-ON_Part2_02-048.jpg');
      assert.equal(p.setAbbr, 'PM_K-ON_Part2')
      assert.equal(p.release, '02')
      assert.equal(p.number, '02-048')
      assert.equal(p.num, '048')
      assert.equal(p.id, 'PM_K-ON_Part2_02-048')
      assert.equal(p.variation, '')
    });

    it('should handle GPFN_P-004a', function () {
      let p = ripper.parseCardId('GPFN_P-004a');
      assert.equal(p.setAbbr, 'GPFN')
      assert.equal(p.release, 'P')
      assert.equal(p.number, 'P-004a')
      assert.equal(p.num, '004')
      assert.equal(p.id, 'GPFN_P-004a')
      assert.equal(p.variation, 'a')
    });
  });

  describe('getSetUrls', function () {
    this.timeout(30000);
    it('should return a list of all set URLs found on p-memories.com', function () {
      return ripper.getSetUrls().then((setList) => {
        assert.isArray(setList);
        assert.isAtLeast(setList.length, 94);
        assert.includeMembers(
          setList,
          [
            '/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on',
            '/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on',
            '/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on'
          ]
        );
      });
    });
  });


  describe('normalizeUrl', function () {
    it('should take a partial URL and make it a full URL.', function () {
      let url = ripper.normalizeUrl('/card_product_list_page?page=1&field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on');
      assert.equal(url, 'http://p-memories.com/card_product_list_page?page=1&field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on')
    });
  });

  describe('ripSetData', function () {
    it('should return an array of objects containing cardUrl and cardImageUrl', function () {
      // @TODO this is an integration test and it doesn't belong with unit tests
      this.timeout(30000)
      return ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on')
        .then((data) => {
          assert.isArray(data);
          assert.lengthOf(data, 1);
          assert.isString(data[0].cardImageUrl);
          assert.isString(data[0].cardUrl);
        })
    });

    xit('should rip a set which contains more than one page', function () {
      // @TODO this is an integration test and it doesn't belong with unit tests
      this.timeout(60000)
      return ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on')
        .then((data) => {
          assert.isArray(data);
          assert.lengthOf(data, 403);
        })
    });

    xit('should cope with a relative p-memories.com URL', function () {
      // @TODO this is an integration test and it doesn't belong with unit tests
      this.timeout(30000)
      return ripper.ripSetData('/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on')
        .then((data) => {
          assert.isArray(data);
          assert.lengthOf(data, 1);
        })
    });

    xit('should download madoka release 03', function () {
      this.timeout(30000);
      return ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=313372-%E5%8A%87%E5%A0%B4%E7%89%88+%E9%AD%94%E6%B3%95%E5%B0%91%E5%A5%B3%E3%81%BE%E3%81%A9%E3%81%8B%E2%98%86%E3%83%9E%E3%82%AE%E3%82%AB&s_flg=on')
        .then((data) => {
          assert.isArray(data);
          assert.isAbove(data.length, 1);
        })
    })
  });

  describe('isLocalCard', function () {
    it('should return a promise resolving true if the card exists on disk', function () {
      return ripper.isLocalCard('HMK_01-001').then((realCardOnDisk) => {
        assert.isTrue(realCardOnDisk);
      })
    });

    it('should return a promise resolving false if the card does not exist on disk', function () {
      return ripper.isLocalCard('TTQ_05-003').then((fakeCardNotOnDisk) => {
        assert.isFalse(fakeCardNotOnDisk);
      })
    });

    it('should handle relative image urls as parameter', function () {
      return ripper.isLocalCard('/images/product/PM_HS/PM_HS_01-002.jpg').then((realCardOnDisk) => {
        assert.isTrue(realCardOnDisk);
      });
    });

    it('should handle absolute image urls as parameter', function () {
      return ripper.isLocalCard('http://p-memories.com/images/product/HMK/HMK_01-001.jpg').then((realCardOnDisk) => {
        assert.isTrue(realCardOnDisk);
      });
    });
  })

  describe('ripCardById', function () {
    this.timeout(30000);
    it('should accept a card ID as param and rip the card to disk', function () {
      return ripper.ripCardById('ERMG_01-001').then((writeResult) => {
        assert.isObject(writeResult);
        assert.isStirng(writeResult.imagePath);
        assert.isStirng(writeResult.dataPath);
      })
    })
  })

  describe('ripCardData', function () {
    this.timeout(30000);
    it('Should get card data from a card URL', function () {
      return ripper
      .ripCardData('http://p-memories.com/node/926791')
      .then((data) => {
        assert.isObject(data);
        assert.equal(data.number, '01-001');
        assert.equal(data.rarity, 'SR');
        assert.equal(data.setName, 'SSSS.GRIDMAN');
        assert.equal(data.name, '響 裕太');
        assert.equal(data.type, 'キャラクター');
        assert.equal(data.usageCost, '6');
        assert.equal(data.outbreakCost, '3');
        assert.equal(data.color, '赤');
        assert.equal(data.characteristic, '制服');
        assert.equal(data.ap, '-');
        assert.equal(data.dp, '-');
        assert.equal(data.parallel, '');
        assert.equal(data.text, 'このカードが登場した場合、手札から名称に「グリッドマン」を含むキャラ1枚を場に出すことができる。[メイン/自分]:《休》名称に「グリッドマン」を含む自分のキャラ1枚は、ターン終了時まで+20/+20を得る。その場合、カードを1枚引く。');
        assert.equal(data.flavor, 'グリッドマン…。オレと一緒に戦ってくれ！');
        assert.equal(data.url, 'http://p-memories.com/node/926791');
        assert.equal(data.image, 'http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg');
        assert.equal(data.setAbbr, 'SSSS');
        assert.equal(data.id, 'SSSS_01-001');
        assert.equal(data.num, '001');
        assert.equal(data.release, '01');
      })
    });

    it('should accept a card ID as first param', function () {
      return ripper.ripCardData('MZK_01-001').then((data) => {
        assert.isObject(data);
        assert.equal(data.number, '01-001');
        assert.equal(data.url, 'http://p-memories.com/node/942168');
        assert.equal(data.image, 'http://p-memories.com/images/product/MZK/MZK_01-001.jpg');
      })
    });

    it('should accept a second parameter, a cardImageUrl, which will be used to determine whether or not to make a network request to rip card data.', function () {
      return ripper
      .ripCardData('http://p-memories.com/node/932341', '/images/product/GPFN/GPFN_01-030a.jpg')
      .then((data) => {
        assert.isObject(data);
        assert.equal(data.number, '01-030a');
        assert.equal(data.url, 'http://p-memories.com/node/932341');
        assert.equal(data.id, 'GPFN_01-030a');
      })
    });

    it('should return a promise which rejects with an error if receiving a URL to a card which has already been downloaded', function () {
      let targetCardPath = path.join(__dirname, '..', 'data', 'HMK', '01', 'HMK_01-001.json')
      let creationTimeBefore = fs.statSync(targetCardPath).mtimeMs;
      let cd = ripper.ripCardData('http://p-memories.com/node/383031', 'http://p-memories.com/images/product/HMK/HMK_01-001.jpg');
      return assert.isRejected(cd, /EEXIST/);
    });

    it('should cope with a relative P-memories URL', function () {
      return ripper.ripCardData('/node/926791')
        .then((data) => {
          assert.isObject(data);
          assert.equal(data.number, '01-001');
          assert.equal(data.url, 'http://p-memories.com/node/926791');
        })
    });

  });

  describe('writeCardData', function () {
    it('should create a JSON file in the appropriate folder', function () {
      let cardData = require('../fixtures/HMK_01-001.json');
      return ripper
        .writeCardData(cardData)
        .then((res) => {
          let cardDataResult = require('../data/HMK/01/HMK_01-001.json');
          assert.equal(cardDataResult.name, '初音 ミク');
          assert.match(res, /\/data\/HMK\/01\/HMK_01-001.json/);
        })
    });

    it('should not overwrite locally modified JSON files.', function () {
      let cardData = require('../fixtures/HMK_01-001.json');
      return ripper
        .writeCardData(cardData)
        .then((res) => {
          let cardDataResult = require('../data/HMK/01/HMK_01-001.json');
          assert.equal(cardDataResult.nameEn, 'Hatsune Miku');
          assert.equal(cardDataResult.setNameEn, 'Hatsune Miku');
          assert.match(res, /\/data\/HMK\/01\/HMK_01-001.json/);
        })
    });
  });

  describe('downloadImage', function () {
    this.timeout(30000);
    let correctImagePath = path.join(
      __dirname,
      '..',
      'data',
      'SSSS',
      '01',
      'SSSS_01-001.jpg'
    );
    it('Should accept a card URL and download the card image and write it to the correct folder', function () {
      let cardUrl = 'http://p-memories.com/node/926791';
      return ripper
        .downloadImage(cardUrl)
        .then((imagePath) => {
          assert.isString(imagePath);
          assert.equal(imagePath, correctImagePath);
        });
    });
    it('Should download a card image and place it in the correct folder', function () {
      let imageUrl = 'http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg';
      return ripper
        .downloadImage(imageUrl)
        .then((imagePath) => {
          assert.isString(imagePath);
          assert.equal(imagePath, correctImagePath);
        });
    });
    it('should accept a card data object, download the image specified within, and place it in the correct folder', function () {
      let cardData = require(path.join(__dirname, '..', 'fixtures', 'SSSS_01-001.json'));
      return ripper
        .downloadImage(cardData)
        .then((imagePath) => {
          assert.isString(imagePath);
          assert.equal(imagePath, correctImagePath);
        })
    })
  });

  describe('buildImagePath', function () {
    it('should build an image path given an image URL', function () {
      // input: http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg
      // output: ../SSSS/SSSS_01-001.jpg
      let path = ripper.buildImagePath('http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg');
      assert.match(path, /\/data\/SSSS\/01\/SSSS_01-001.jpg/);
    });
  });

  describe('buildCardDataPath', function () {
    it('should build a card data path given a card JSON data file', function () {
      let path = ripper.buildCardDataPath(require('../fixtures/HMK_01-001.json'));
      assert.match(path, /\/data\/HMK\/01\/HMK_01-001.json/);
    });
  });

  describe('identifyUrl', function () {
    it('should return the string, "card" when fed a card URL', function () {
      let urlType = ripper.identifyUrl('http://p-memories.com/node/906300');
      assert.equal(urlType, 'card');
    });
    it('should return the string, "set" when fed a card URL', function () {
      let urlType = ripper.identifyUrl('http://p-memories.com/card_product_list_page?field_title_nid=845152-NEW+GAME%21');
      assert.equal(urlType, 'set');
    });
    it('should return the String, "unknown" when fed an empty URL', function () {
      let urlType = ripper.identifyUrl('');
      assert.equal(urlType, 'unknown');
    });
    it('should return the String, "unknown" when fed a foreign URL', function () {
      let urlType = ripper.identifyUrl('https://www.youtube.com/watch?v=JQlkfkvR9A0');
      assert.equal(urlType, 'unknown');
    });
  });

  describe('getSetUrlFromSetAbbr', function () {
    it('Should return the correct URL for SSSS.GRIDMAN', function () {
      return ripper.getSetUrlFromSetAbbr('SSSS')
        .then((url) => {
          assert.equal(url, 'http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on')
        })
    });
    it('Should return the correct URL for ookami', function () {
      return ripper.getSetUrlFromSetAbbr('ookami')
        .then((url) => {
          assert.equal(url, 'http://p-memories.com/card_product_list_page?field_title_nid=4539-%E3%82%AA%E3%82%AA%E3%82%AB%E3%83%9F%E3%81%95%E3%82%93%E3%81%A8%E4%B8%83%E4%BA%BA%E3%81%AE%E4%BB%B2%E9%96%93%E3%81%9F%E3%81%A1&s_flg=on');
        })
    });

    it('Should return an error if an unknown set is requested', function () {
      return ripper.getSetUrlFromSetAbbr('tacobell')
        .catch((e) => {
          assert.match(e, /matchingPair not found/);
        })
    });
  })

  describe('getSetAbbrFromImageUrl', function () {
    it('Should return SSSS when receiving param http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg', function () {
      let setAbbr = ripper.getSetAbbrFromImageUrl('http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg');
      assert.equal(setAbbr, 'SSSS');
    })
  });

  describe('getFirstCardImageUrl', function () {
    it('Should accept a set URL and return the image URL for the first card in the set', function () {
      this.timeout(10000);
      return ripper.getFirstCardImageUrl('http://p-memories.com/card_product_list_page?field_title_nid=31466-%E9%9B%BB%E6%B3%A2%E5%A5%B3%E3%81%A8%E9%9D%92%E6%98%A5%E7%94%B7&s_flg=on')
        .then((imageUrl) => {
          assert.equal(imageUrl, 'http://p-memories.com/images/product/DNP/DNP_01-001.jpg');
        })
    })
  });

  describe('getImageUrlFromEachSet', function () {
    it('Should accept no parameters and return an array of objects with sampleCardUrl and setUrl k/v', function () {
      this.timeout(1000*60*10);
      return ripper.getImageUrlFromEachSet()
        .then((imageUrls) => {
          let indexPath = path.join(__dirname, '..', 'data', 'setAbbrIndex.json');
          assert.isArray(imageUrls);
          assert.lengthOf(imageUrls, 94);
          assert.isObject(imageUrls[0]);
          assert.isString(imageUrls[0].setUrl);
          assert.isString(imageUrls[0].sampleCardUrl);
          assert.includeMembers(imageUrls, ['http://p-memories.com/images/product/DNP/DNP_01-001.jpg']);
        });
    });
  });

  describe('createSetAbbreviationIndex', function () {
    it('should create setAbbrIndex.json in the data folder', function () {
      this.timeout(1000*60*10);
      return ripper.createSetAbbreviationIndex()
        .then((imageUrls) => {
          let indexPath = path.join(__dirname, '..', 'data', 'setAbbrIndex.json');
          let setAbbrIndex = require(indexPath);
          assert.isArray(setAbbrIndex);
          assert.isString(setAbbrIndex[0].setUrl);
          assert.isString(setAbbrIndex[0].setAbbr);
          assert.deepInclude(setAbbrIndex, {
            setUrl: 'http://p-memories.com/images/product/DNP/DNP_01-001.jpg',
            setAbbr: 'ika'
          });
        });
    })
  })

  describe('saveCardData', function () {
    it('Should save json file and download card image.', function () {
      let cardData = require('../fixtures/HMK_01-001.json');
      let beforeStats = fs.statSync(path.join(__dirname, '..', 'data', 'HMK', '01', 'HMK_01-001.jpg'));
      return ripper
        .saveCardData(cardData)
        .then((writeResult) => {
          assert.isString(writeResult[1]);
          let afterStats = fs.statSync(writeResult[1]);
          assert.isAbove(afterStats.mtimeMs, beforeStats.mtimeMs);
        })
    });
  })


});
