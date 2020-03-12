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
  describe('parseCardId', function () {
    it('should return an object with setAbbr, release, number, and num', function () {
      let p = ripper.parseCardId('HMK_01-001');
      assert.equal(p.setAbbr, 'HMK');
      assert.equal(p.release, '01');
      assert.equal(p.number, '01-001');
      assert.equal(p.num, '001');
      assert.equal(p.id, 'HMK_01-001');
    });

    it('should accept an image URL as param', function () {
      let p = ripper.parseCardId('http://p-memories.com/images/product/HMK/HMK_01-001.jpg');
      assert.equal(p.setAbbr, 'HMK');
      assert.equal(p.release, '01');
      assert.equal(p.number, '01-001');
      assert.equal(p.num, '001');
      assert.equal(p.id, 'HMK_01-001');
    });

    it('should reject when the card ID is not valid', function () {
      assert.throws(ripper.parseCardId.bind(ripper, 'tacobell'), /not valid/);
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
    it('should return a list of card URLs', function () {
      this.timeout(30000)
      return ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on')
        .then((data) => {
          assert.isArray(data);
          assert.lengthOf(data, 1);
        })
    });

    it('should rip a set which contains more than one page', function () {
      this.timeout(30000)
      return ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on')
        .then((data) => {
          assert.isArray(data);
          assert.lengthOf(data, 403);
        })
    });

    it('should cope with a relative p-memories.com URL', function () {
      this.timeout(30000)
      return ripper.ripSetData('/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on')
        .then((data) => {
          assert.isArray(data);
          assert.lengthOf(data, 1);
        })
    });

    it('should download madoka release 03', function () {
      this.timeout(30000);
      return ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=313372-%E5%8A%87%E5%A0%B4%E7%89%88+%E9%AD%94%E6%B3%95%E5%B0%91%E5%A5%B3%E3%81%BE%E3%81%A9%E3%81%8B%E2%98%86%E3%83%9E%E3%82%AE%E3%82%AB&s_flg=on')
        .then((data) => {
          assert.isArray(data);
          assert.isAbove(data.length, 1);
        })
    })
  });

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

  describe('conditionallyDownload', function () {
    it('Should not download in incremental mode if image exists locally.', function () {
      let cardData = require('../fixtures/HMK_01-001.json');
      let beforeStats = fs.statSync(path.join(__dirname, '..', 'data', 'HMK', '01', 'HMK_01-001.jpg'));
      return ripper
        .conditionallyDownload(cardData)
        .then((imagePath) => {
          let afterStats = fs.statSync(imagePath);
          console.log(`imagePath: ${imagePath} before:${beforeStats.mtimeMs} after: ${afterStats.mtimeMs}`)
          assert.equal(afterStats.mtimeMs, beforeStats.mtimeMs);
        })
    });
  })


});
