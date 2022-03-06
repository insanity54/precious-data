const path = require('path');
const td = require('testdouble')
const chai = require('chai');

const setAbbrIndexPath = path.join(__dirname, '..', 'data', 'setAbbrIndex.json');
const setAbbrIndexFixturePath = path.join(__dirname, '..', 'fixtures', 'setAbbrIndex.json');
const setAbbrIndexFixture = require(setAbbrIndexFixturePath);


// td.when(require(setAbbrIndexPath)).thenReturn(JSON.stringify(setAbbrIndexFixture))


expect.extend(toBeType)
const preciousData = require('../index');

describe('precious-data exports', () => {
  it('should export an object containg cards, version, sets, parsers, and query', () => {
    expect(preciousData).toHaveProperty('version');
    expect(preciousData).toHaveProperty('parsers');
    expect(preciousData).toHaveProperty('query');
  })
  it('should have version property which is a string', () => {
    expect(preciousData.version).toBeType('string');
  })
  it('should have a version property matching the package version', () => {
    const version = require('../package.json').version;
    expect(preciousData.version).toEqual(version);
  })
})