const Store = require('../lib/Store.js')
const Card = require('../lib/Card.js')
const { expect } = require('chai')
const test = require('ava')

test.beforeEach(async (t) => {
  t.context.store = new Store();
  await t.context.store.init();
});


test('findOne', (t) => {
  const card = t.context.store.findOne({
    release: '01',
    setAbbr: 'HMK',
    num: '001'
  });
  expect(card).to.have.property('url', 'http://p-memories.com/node/383031');
  expect(card).to.be.instanceof(Card);
});


// test('find', (t) => {
//   const cards = t.context.store.find({
//     num: '001'
//   });
//   expect(cards)
//   for (const c of cards) {
//     expect(c).to.be.instanceof(Card);
//   }
// })


test('loadCards', async (t) => {
  const cards = await t.context.store.loadCards();
  expect(cards).to.be.an('array');
  expect(cards.length).to.be.above(500);
})

test('save', async (t) => {
  const card = new Card(null, null, null, {
    release: '01',
    setAbbr: 'HMK',
    num: '001'
  });
  const result = await t.context.store.save(card);
  expect(result).to.be.instanceof(Card);
  expect(result).to.have.property('num', '001');
});