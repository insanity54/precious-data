const path = require('path');
const td = require('testdouble')
const { expect } = require('chai');

const setAbbrIndexPath = path.join(__dirname, '..', 'data', 'setAbbrIndex.json');
const setAbbrIndexFixturePath = path.join(__dirname, '..', 'fixtures', 'setAbbrIndex.json');
const setAbbrIndexFixture = require(setAbbrIndexFixturePath);


// td.when(require(setAbbrIndexPath)).thenReturn(JSON.stringify(setAbbrIndexFixture))


const preciousData = require('../index');

module.exports = {
  'should export an object containg cards, version, sets, parsers, and query': function () {
    expect(preciousData).to.have.property('version');
    expect(preciousData).to.have.property('parsers');
    expect(preciousData).to.have.property('query');
  },
  'should have version property which is a string': function () {
    expect(preciousData.version).to.be.a('string');
  },
  'should have a version property matching the package version': function () {
    const version = require('../package.json').version;
    expect(preciousData.version).to.be.a(version);
  }
}