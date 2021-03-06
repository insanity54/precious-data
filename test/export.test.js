const preciousData = require('../index');
const toBeType = require('jest-tobetype');
expect.extend(toBeType)

describe('precious-data exports', () => {
  it('should export an object containg cards, version, and sets properties', () => {
    expect(preciousData).toHaveProperty('version');
    expect(preciousData).toHaveProperty('cards');
    expect(preciousData).toHaveProperty('sets');
  })
  it('should have a cards property that is an Array', () => {
    expect(preciousData.cards).toBeType('array');
  })
  it('should have version property which is a string', () => {
    expect(preciousData.version).toBeType('string');
  })
  it('should have a sets property which is an Array', () => {
    expect(preciousData.sets).toBeType('array');
  })
  it('should have a version property matching the package version', () => {
    const version = require('../package.json').version;
    expect(preciousData.version).toEqual(version);
  })
  it('should have a cards property which contains imagePath', () => {
    expect(preciousData.cards[0]).toHaveProperty('imagePath')
    expect(preciousData.cards[0].imagePath).toMatch(/\/data\/.*\.jpg/)
  })
  it('should have cards property which contains HMK 01-001', async () => {
    const cards = preciousData.cards
    const hmk = cards.find(c => c.number === '01-001' && c.setAbbr === 'HMK' )
    expect(hmk).toBeTruthy();
  })
  it('should have sets property which contains HMK, oreimo, and SSSS', async () => {
    const sets = preciousData.sets
    expect(sets).toContainEqual(
      expect.objectContaining({
        setAbbr: expect.stringMatching('HMK'),
        setUrl: expect.stringMatching('p-memories.com'),
      })
    )
    expect(sets).toContainEqual(
      expect.objectContaining({
        setAbbr: expect.stringMatching('oreimo'),
        setUrl: expect.stringMatching('p-memories.com'),
      })
    )
    expect(sets).toContainEqual(
      expect.objectContaining({
        setAbbr: expect.stringMatching('SSSS'),
        setUrl: expect.stringMatching('p-memories.com'),
      })
    )
  })
})