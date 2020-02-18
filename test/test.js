const assert = require('chai').assert;
const ripper = require('../util/ripper');
const fs = require('fs');
const express = require('express');
const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'fixtures')));
let fixtureServer;


before((done) => {
  fixtureServer = app.listen(8787, () => {
    done();
  });
})

after((done) => {
  fixtureServer.close();
  done();
})


describe('P-Memories Ripper', function() {

  describe('normalizeUrl', function () {
    it('should take a partial URL and make it a full URL.', function () {
      let url = ripper.normalizeUrl('/card_product_list_page?page=1&field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on');
      assert.equal(url, 'http://p-memories.com/card_product_list_page?page=1&field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on')
    });
  })

  describe('ripSetData', function () {
    it('should get a list of card URLs', function () {
      this.timeout(30000)
      return ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on')
        .then((data) => {
          assert.isArray(data);
          assert.lengthOf(data, 403);
        })
    })
  })

  describe('ripCardData', function () {
    it('Should get card data from a card URL', function () {
      return ripper
      .ripCardData('http://localhost:8787/01-001.html')
      .then((data) => {
        assert.isObject(data);
        assert.equal(data.number, '01-001');
        assert.equal(data.rarity, 'SR');
        assert.equal(data.set, 'SSSS.GRIDMAN');
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
        assert.equal(data.image, 'http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg');
      })
    });
  })

  describe('writeCardData', function () {
    it('should create a JSON file in the appropriate folder', function () {
      let cardData = require('../fixtures/HMK_01-001.json');
      console.log(cardData)
      return ripper
        .writeCardData(cardData)
        .then(() => {
          let cardDataResult = require('../data/HMK/01/HMK_01-001.json');
          assert.equal(cardDataResult.name, '初音 ミク');
        })
    });
  });

  describe('downloadImage', function () {
    it('Should get the card image from the card URL', function () {
      let imageUrl = 'http://localhost:8787/images/product/SSSS/SSSS_01-001.jpg'
      return ripper
        .downloadImage(imageUrl)
        .then(() => {
          assert.isDefined(fs.readFileSync(ripper.buildImagePath(imageUrl), { encoding: 'utf-8' }));
        });
    });
  });

  describe('buildImagePath', function () {
    it('should build an image path given an image URL', function () {
      // input: http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg
      // output: ../SSSS/SSSS_01-001.jpg
      let path = ripper.buildImagePath('http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg');
      assert.match(path, /\/data\/SSSS\/SSSS_01-001.jpg/);
    });
  });

  describe('buildCardDataPath', function () {
    it('should build a card data path given a card JSON data file', function () {
      let path = ripper.buildCardDataPath(require('../fixtures/HMK_01-001.json'));
      assert.match(path, /\/data\/HMK\/01\/HMK_01-001.json/);
    });
  })

});
