
const {
  cardIdRegex,
  setAbbrRegex,
  setlessCardIdRegex,
} = require('../lib/constants')

const fs = require('fs');
const path = require('path');
const fixturesPath = path.join(__dirname, '..', 'fixtures')

const setAbbrIndexFixture = require('../fixtures/setAbbrIndex.json');

describe('constants', () => {
  describe('cardIdRegex', () => {
    it("should not match a setless card id such as '03-011'", () => {
      const regexResult = cardIdRegex.exec('03-011');
      expect(regexResult).toBeNull();
    })
  })
  describe('setAbbrRegex', () => {
    it('should match HMK', () => {
        expect(setAbbrRegex.exec('HMK')).not.toBeNull();
    })
    it('should match OREIMO', () => {
        expect(setAbbrRegex.exec('OREIMO')).not.toBeNull();
    })
    it('should match BKM', () => {
        expect(setAbbrRegex.exec('BKM')).not.toBeNull();
    })
    it('should match SSSS', () => {
        expect(setAbbrRegex.exec('SSSS')).not.toBeNull();
    })
    it('should match ookami', () => {
        expect(setAbbrRegex.exec('ookami')).not.toBeNull();
    })
    it('should match MG2', () => {
        expect(setAbbrRegex.exec('MG2')).not.toBeNull();
    })
    it("should match 'HMK_01-001'", () => {
      const match = setAbbrRegex.exec('HMK_01-001')
      expect(match).not.toBeNull();
      expect(match[1]).toEqual('HMK');
    })
    it("should match 'HMK 01-001'", () => {
      const match = setAbbrRegex.exec('HMK 01-001')
      expect(match).not.toBeNull();
      expect(match[1]).toEqual('HMK');
    })
    it("should match 'OREIMO 01-001'", () => {
      const match = setAbbrRegex.exec('OREIMO 02-001')
      expect(match).not.toBeNull();
      expect(match[1]).toEqual('OREIMO');
    })
    it("should match 'KON3 03-056a'", () => {
      const match = setAbbrRegex.exec('KON3 03-056a')
      expect(match).not.toBeNull();
      expect(match[1]).toEqual('KON3');
    })
    xit("should find HMK in 'http://p-memories.com/images/product/HMK/HMK_01-001.jpg'", () => {
      const match = setAbbrRegex.exec('http://p-memories.com/images/product/HMK/HMK_01-001.jpg')
      expect(match).not.toBeNull();
      expect(match[1]).toEqual('HMK')
    })

    // expected negative matches are as follows

    it("should not match '03-001'", () => {
      expect(setAbbrRegex.exec('03-001')).toBeNull();
    })
    it("should not match 'XO-003'", () => {
      expect(setAbbrRegex.exec('XO-003')).toBeNull();
    })
    it("should not match '05-065a'", () => {
      expect(setAbbrRegex.exec('05-065a')).toBeNull();
    })
  })
  describe('setlessCardIdRegex', () => {
    it("should match '03-011'", () => {
        expect(setlessCardIdRegex.exec('03-001')).not.toBeNull();
    })
    it("should match '01-001'", () => {
        expect(setlessCardIdRegex.exec('01-001')).not.toBeNull();
    })
    it("should match '05-065a' (parallel cards)", () => {
        expect(setlessCardIdRegex.exec('05-065a')).not.toBeNull();
    })
    it("should match 'XO-003' (joke cards)", () => {
        expect(setlessCardIdRegex.exec('XO-003')).not.toBeNull();
    })
  })
})