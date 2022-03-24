const td = require('testdouble');
const Card = require('../lib/Card');
const CardSet = require('../lib/CardSet.js');
const Fetch = require('../lib/Fetch.js');
const Parse = require('../lib/Parse.js');
const Store = require('../lib/Store.js');
const { expect } = require('chai');
const test = require('ava');
const { setupRecorder } = require('nock-record');
const record = setupRecorder();


test.beforeEach(async (t) => {
  t.context.fetch = new Fetch(); 
  t.context.parse = new Parse();
  t.context.store = new Store();
  t.context.fakeStore = td.instance(Store);
})


  
test('get() should return the setAbbr', (t) => {
  const cardSet = new CardSet(this.fetch, this.parse, this.store, {
    setAbbr: 'HMK'
  });
  const setAbbr = cardSet.get('setAbbr');
  expect(setAbbr).to.equal('HMK');
});

test('should return an array of cards', (t) => {
  const cardSet = new CardSet(this.fetch, this.parse, this.store, {
    setAbbr: 'HMK',
    cards: [
      new Card(this.fetch, this.parse, this.store, { setAbbr: 'HMK' }),
      new Card(this.fetch, this.parse, this.store, { setAbbr: 'HMK' })
    ]
  });
  expect(cardSet.get('cards')[0]).to.be.an.instanceOf(Card);
});

test('save() should save cardSet to storage', async (t) => {
  const cardSet = new CardSet(this.fetch, this.parse, this.fakeStore, {
    setAbbr: 'HMK'
  });
  await cardSet.save();
});


test('should reach out to p-memories and get all the cards', async (t) => {
  const cardSet = new CardSet(t.context.fetch, t.context.parse, t.context.store, {
    setUrl: 'http://p-memories.com/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on'
  });
  await t.context.cardSet.rip();
  expect(t.context.cardSet.cards.length).to.be.above(50);
});


test('getUrls', async (t) => {
  const cardSet = new CardSet(t.context.fetch, t.context.parse, t.context.store, {
    setUrl: 'http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on'
  });
  const urls = await cardSet.getUrls();
  for (const u of urls) {
    expect(u).to.match(/^http/, 'must be a complete URL')
  }
  expect(urls).to.be.an('array');
  expect(urls).to.have.length(2);
});


test('getCardSetAbbr', async (t) => {
  const { completeRecording, assertScopesFinished } = await record("getCardSetAbbr");
  const cardSet = new CardSet(t.context.fetch, t.context.parse, t.context.store, {
    setUrl: 'http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on'
  });
  const setAbbr = await cardSet.getCardSetAbbr();
  completeRecording();
  assertScopesFinished();
  expect(setAbbr).to.equal('HMK');
})