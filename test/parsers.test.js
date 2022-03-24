
const {
  splitTextList,
  parseCardId,
  parseCardDataFromHtml,
  normalizeUrl,
  parseQuery,
} = require('../lib/parsers')

const fs = require('fs');
const debug = require('debug')('precious-data');
const path = require('path');
const fixturesPath = path.join(__dirname, '..', 'fixtures')


module.exports = {

  "parseQuery": {
    "should accept 'ClariS' and return { setAbbr: 'ClariS', card: '*' }": function () {
      const order = parseQuery('ClariS');
      expect(order).toBeInstanceOf(Object);
      expect(order).toStrictEqual({
        setAbbr: 'ClariS',
        card: '*'
      })
    },
    "should accept 'HMK' and return { setAbbr: 'HMK', card: '*' }": function () {
      const order = parseQuery('HMK');
      expect(order).toBeInstanceOf(Object);
      expect(order).toStrictEqual({
        setAbbr: 'HMK',
        card: '*'
      })
    },
    "should accept 'OREIMO 01-001' and return { setAbbr: 'OREIMO', card: '01-001' }": function () {
      const order = parseQuery('OREIMO 01-001');
      expect(order).toBeInstanceOf(Object);
      expect(order).toStrictEqual({
        setAbbr: 'OREIMO',
        card: '01-001'
      })
    },
    "should accept '03-001' and return { setAbbr: '*', card: '03-001' }": function () {
      const order = parseQuery('03-001');
      expect(order).toBeInstanceOf(Object);
      expect(order).toStrictEqual({
        setAbbr: '*',
        card: '03-001'
      });
    }
  },

  "normalizeUrl": {
    "should take a partial URL and make it a full URL.": function () {
      let url = normalizeUrl('/card_product_list_page?page=1&field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on');
      expect(url).toEqual(
        'http://p-memories.com/card_product_list_page?page=1&field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on'
      );
    }
  },


  "parseCardId": {

    /**
      test strings for Rubular/regexr testing:

      /images/product/PM_HS/PM_HS_01-002.jpg
      PM_HS_03-008
      http://p-memories.com/images/product/GPFN/GPFN_01-030a.jpg
      SSSS_P-001
      http://p-memories.com/images/product/HMK/HMK_01-001.jpg
      /images/product/PM_K-ON_Part2/PM_K-ON_Part2_02-048.jpg
      KON 01-068

     */
    "should throw if receiving no parameter": function () {
      return expect(() => {
        parseCardId()
      }).toThrow(/Got undefined/)
    },
    
    "should throw an error if receiving a string that does match the required format": function () {
      return expect(() => {
        parseCardId('taco bell')
      }).toThrow(/cardId is not valid/);
    },
    
    'should return an object with setAbbr, release, number, and num': function() {
        let p = parseCardId('HMK_01-001');
        expect(p.setAbbr).toEqual('HMK');
        expect(p.release).toEqual('01');
        expect(p.number).toEqual('01-001');
        expect(p.num).toEqual('001');
        expect(p.id).toEqual('HMK 01-001');
        expect(p.variation).toEqual('');
    },

    "should accept a relative image URL as param": function () {
      let p = parseCardId('/images/product/YYY2/YYY2_02-001.jpg');
      expect(p.setAbbr).toEqual('YYY2');
      expect(p.release).toEqual('02');
      expect(p.number).toEqual('02-001');
      expect(p.num).toEqual('001');
      expect(p.id).toEqual('YYY2 02-001');
      expect(p.variation).toEqual('');
    },

    "should accept an image URL as param": function () {
      let p = parseCardId('http://p-memories.com/images/product/HMK/HMK_01-001.jpg');
      expect(p.setAbbr).toEqual('HMK');
      expect(p.release).toEqual('01');
      expect(p.number).toEqual('01-001');
      expect(p.num).toEqual('001');
      expect(p.id).toEqual('HMK 01-001');
      expect(p.variation).toEqual('');
    },

    "should reject when the card ID is not valid": function () {
      expect(parseCardId.bind(this, 'tacobell')).toThrow();
    },

    "should handle a card ID with a letter as the release": function () {
      let p = parseCardId('SSSS P-001');
      expect(p.setAbbr).toEqual('SSSS');
      expect(p.release).toEqual('P');
      expect(p.number).toEqual('P-001');
      expect(p.num).toEqual('001');
      expect(p.id).toEqual('SSSS P-001');
      expect(p.variation).toEqual('');
    },

    'should handle a card ID with a letter variation at the end': function () {
      let p = parseCardId('http://p-memories.com/images/product/GPFN/GPFN_01-030a.jpg');
      expect(p.setAbbr).toEqual('GPFN');
      expect(p.release).toEqual('01');
      expect(p.number).toEqual('01-030a');
      expect(p.num).toEqual('030');
      expect(p.id).toEqual('GPFN 01-030a');
      expect(p.variation).toEqual('a');
    },

    "should handle a card ID an underscore in the setAbbr": function () {
      let p = parseCardId('PM_HS_03-008');
      expect(p.setAbbr).toEqual('PM_HS');
      expect(p.release).toEqual('03');
      expect(p.number).toEqual('03-008');
      expect(p.num).toEqual('008');
      expect(p.id).toEqual('PM_HS 03-008');
      expect(p.variation).toEqual('');
    },

    'should handle a cardID with underscores and a relative URL': function () {
      let p = parseCardId('/images/product/PM_HS/PM_HS_01-002.jpg');
      expect(p.setAbbr).toEqual('PM_HS')
      expect(p.release).toEqual('01')
      expect(p.number).toEqual('01-002')
      expect(p.num).toEqual('002')
      expect(p.id).toEqual('PM_HS 01-002')
      expect(p.variation).toEqual('')
    },

    'should handle a cardID with multiple underscores in the set name': function () {
      let p = parseCardId('/images/product/PM_K-ON_Part2/PM_K-ON_Part2_02-048.jpg');
      expect(p.setAbbr).toEqual('PM_K-ON_Part2')
      expect(p.release).toEqual('02')
      expect(p.number).toEqual('02-048')
      expect(p.num).toEqual('048')
      expect(p.id).toEqual('PM_K-ON_Part2 02-048')
      expect(p.variation).toEqual('')
    },

    'should handle a cardID with a space between the setAbbr and the release': function () {
      let p = parseCardId('HMK 02-003')
      expect(p.setAbbr).toEqual('HMK')
    },

    "should handle GPFN P-004a": function () {
      let p = parseCardId('GPFN P-004a')
      expect(p.setAbbr).toEqual('GPFN')
      expect(p.release).toEqual('P')
      expect(p.number).toEqual('P-004a')
      expect(p.num).toEqual('004')
      expect(p.id).toEqual('GPFN P-004a')
      expect(p.variation).toEqual('a')
    },

    "should handle GPFN_P-004a": function () {
      let p = parseCardId('GPFN_P-004a');
      expect(p.setAbbr).toEqual('GPFN')
      expect(p.release).toEqual('P')
      expect(p.number).toEqual('P-004a')
      expect(p.num).toEqual('004')
      expect(p.id).toEqual('GPFN P-004a')
      expect(p.variation).toEqual('a')
    }
  },

  "splitTextList": {
    "should return an empty array if not receiving anything": function () {
      const list = splitTextList()
      expect(list).toStrictEqual([])
    },
    "should return an empty array if receiving an empty string": function () {
      const list = splitTextList('')
      expect(list).toStrictEqual([])
    },
    "should convert a {String} list into an array of strings": function () {
      const list = splitTextList('ヘッドフォン、音楽')
      expect(list).toStrictEqual([
        'ヘッドフォン',
        '音楽'
      ])
    },
  },


  "parseCardDataFromHtml": {
    "should get card data from a {String} html": function () {
      const html = fs.readFileSync(path.join(fixturesPath, 'HMK_01-001.html'), { encoding: 'utf-8' })
      return parseCardDataFromHtml(html)
        .then((data) => {
          debug(data)
          expect(data).toHaveProperty('number', '01-001')
          expect(data).toHaveProperty('rarity', 'SR（サイン）')
          expect(data).toHaveProperty('setName', '初音ミク')
          expect(data).toHaveProperty('name', '初音 ミク')
          expect(data).toHaveProperty('type', 'キャラクター')
          expect(data).toHaveProperty('cost', '4')
          expect(data).toHaveProperty('source', '1')
          expect(data).toHaveProperty('color', '緑')
          expect(data).toHaveProperty('characteristic', ['ヘッドフォン', '音楽'])
          expect(data).toHaveProperty('ap', '40')
          expect(data).toHaveProperty('dp', '30')
          expect(data).toHaveProperty('parallel', '')
          expect(data).toHaveProperty('text', 'このカードが登場した場合、手札から『初音 ミク』のキャラ1枚を場に出すことができる。[アプローチ/両方]:《0》自分の「初音 ミク」2枚を休息状態にする。その場合、自分のキャラ1枚は、ターン終了時まで+10/±0または±0/+10を得る。')
          expect(data).toHaveProperty('flavor', '-')
          expect(data).toHaveProperty('image', 'http://p-memories.com/images/product/HMK/HMK_01-001.jpg')
          expect(data).toHaveProperty('url', 'http://p-memories.com/node/383031')
          expect(data).toHaveProperty('setAbbr', 'HMK')
          expect(data).toHaveProperty('num', '001')
          expect(data).toHaveProperty('release', '01')
          expect(data).toHaveProperty('id', 'HMK 01-001')
        });
    },

    "should reject to throw an error if not receiving any param": function () {
      return expect(parseCardDataFromHtml()).rejects.toThrow('parameter')
    }
  }
}