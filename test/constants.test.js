
const {
  cardIdRegex,
  setAbbrRegex,
  setlessCardIdRegex,
} = require('../lib/constants')

const fs = require('fs');
const path = require('path');
const fixturesPath = path.join(__dirname, '..', 'fixtures')

const setAbbrIndexFixture = require('../fixtures/setAbbrIndex.json');

module.exports = {
  'cardIdRegex': {
    "should not match a setless card id such as '03-011'": function () {
      const regexResult = cardIdRegex.exec('03-011');
      expect(regexResult).toBeNull();
    }
  },
  'setAbbrRegex': {
    'should match HMK': function () {
        expect(setAbbrRegex.exec('HMK')).not.toBeNull();
    },
    'should match OREIMO': function () {
        expect(setAbbrRegex.exec('OREIMO')).not.toBeNull();
    },
    'should match BKM': function () {
        expect(setAbbrRegex.exec('BKM')).not.toBeNull();
    },
    'should match SSSS': function () {
        expect(setAbbrRegex.exec('SSSS')).not.toBeNull();
    },
    'should match ookami': function () {
        expect(setAbbrRegex.exec('ookami')).not.toBeNull();
    },
    'should match MG2': function () {
        expect(setAbbrRegex.exec('MG2')).not.toBeNull();
    },
    "should match 'HMK_01-001'": function () {
      const match = setAbbrRegex.exec('HMK_01-001')
      expect(match).not.toBeNull();
      expect(match[1]).toEqual('HMK');
    },
    "should match 'HMK 01-001'": function () {
      const match = setAbbrRegex.exec('HMK 01-001')
      expect(match).not.toBeNull();
      expect(match[1]).toEqual('HMK');
    },
    "should match 'OREIMO 01-001'": function () {
      const match = setAbbrRegex.exec('OREIMO 02-001')
      expect(match).not.toBeNull();
      expect(match[1]).toEqual('OREIMO');
    },
    "should match 'KON3 03-056a'": function () {
      const match = setAbbrRegex.exec('KON3 03-056a')
      expect(match).not.toBeNull();
      expect(match[1]).toEqual('KON3');
    },
    // xit("should find HMK in 'http://p-memories.com/images/product/HMK/HMK_01-001.jpg'": function () {
    //   const match = setAbbrRegex.exec('http://p-memories.com/images/product/HMK/HMK_01-001.jpg')
    //   expect(match).not.toBeNull();
    //   expect(match[1]).toEqual('HMK')
    // },

    // expected negative matches are as follows

    "should not match '03-001'": function () {
      expect(setAbbrRegex.exec('03-001')).toBeNull();
    },
    "should not match 'XO-003'": function () {
      expect(setAbbrRegex.exec('XO-003')).toBeNull();
    },
    "should not match '05-065a'": function () {
      expect(setAbbrRegex.exec('05-065a')).toBeNull();
    },
  },
  'setlessCardIdRegex': {
    "should match '03-011'": function () {
        expect(setlessCardIdRegex.exec('03-001')).not.toBeNull();
    },
    "should match '01-001'": function () {
        expect(setlessCardIdRegex.exec('01-001')).not.toBeNull();
    },
    "should match '05-065a' (parallel cards)": function () {
        expect(setlessCardIdRegex.exec('05-065a')).not.toBeNull();
    },
    "should match 'XO-003' (joke cards)": function () {
        expect(setlessCardIdRegex.exec('XO-003')).not.toBeNull();
    }
  }
}