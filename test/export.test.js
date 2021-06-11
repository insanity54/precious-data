const preciousData = require('../index');
const toBeType = require('jest-tobetype');
expect.extend(toBeType)

describe('precious-data exports', () => {
  it('should export an object containg cards and version properties', () => {
    expect(preciousData).toHaveProperty('version');
    expect(preciousData).toHaveProperty('cards');
  })
  it('should have a cards property that is an Array', () => {
    expect(preciousData.cards).toBeType('array');
  })
  it('should have version property which is a string', () => {
    expect(preciousData.version).toBeType('string');
  })
  it('should have a version property matching the package version', () => {
    const version = require('../package.json').version;
    expect(preciousData.version).toEqual(version);
  })
  it('should have cards property which contains HMK 01-001', async () => {
    const cards = preciousData.cards
    const hmk = cards.find(c => c.number === '01-001' && c.setAbbr === 'HMK' )
    expect(hmk).toBeTruthy();
  })
})