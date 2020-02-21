const assert = require('chai').assert;
const ripper = require('../util/ripper');
const fs = require('fs');
const path = require('path');




describe('P-Memories Ripper', function() {
  describe('ripAllSets', function () {
    this.timeout(30000);
    it('should return a list of all set URLs found on p-memories.com', function () {
      return ripper.ripAllSets().then((setList) => {
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
  })

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
  })

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
  })

  describe('ripperoni', function () {
    it('should return a total number of card data ripped from p-memories website', function () {
      this.timeout(1000 * 60 * 60 * 3) // 3 hours
      return ripper.ripperoni()
        .then((count) => {
          assert.isNumber(count);
          assert.isAbove(count, 1000);
        })
    });
  });

});
