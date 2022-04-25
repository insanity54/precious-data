const test = require('ava');
const td = require('testdouble');
const Card = require('../lib/Card.js');
const Fetch = require('../lib/Fetch.js');
const Store = require('../lib/Store.js');
const Parse = require('../lib/Parse.js');
const { expect } = require('chai');
const { setupRecorder } = require('nock-record');
const record = setupRecorder();


test.beforeEach((t) => {
});

test('should have properties', (t) => {
  const card = new Card();
  expect(card).to.have.property('number');   // ex: "01-001"
  expect(card).to.have.property('rarity');
  expect(card).to.have.property('setName');
  expect(card).to.have.property('name');
  expect(card).to.have.property('type');
  expect(card).to.have.property('cost');
  expect(card).to.have.property('source');
  expect(card).to.have.property('color');
  expect(card).to.have.property('characteristic');
  expect(card).to.have.property('ap');
  expect(card).to.have.property('dp');
  expect(card).to.have.property('parallel');
  expect(card).to.have.property('text');
  expect(card).to.have.property('flavor');
  expect(card).to.have.property('image'); // url to the official image
  expect(card).to.have.property('url');   // url to the official card page
  expect(card).to.have.property('setAbbr');
  expect(card).to.have.property('num');      // ex: "001"
  expect(card).to.have.property('release');
  expect(card).to.have.property('id');
});

test('get() should return a data', (t) => {
  const card = new Card();
  expect(card.get('name')).to.equal('');
});


test('rip - we know the card url', async (t) => {
  const { completeRecording, assertScopesFinished } = await record("cardRip1");
  // td.when(
  //     FakeStore.prototype.rip()
  //     .thenReturn(
  //       new Card(fetch, parse, store, {
  //         number: '01-001',
  //         release: '01',
  //         num: '001',
  //         name: '初音ミク'
  //       }))
  const fetch = new Fetch();
  const store = td.instance(Store);
  const parse = new Parse(fetch, store);
  const card = new Card(fetch, parse, store, {
    setAbbr: 'HMK',
    num: '001',
    release: '01',
    url: 'http://p-memories.com/node/383031'
  });
  await card.rip();
  assertScopesFinished();
  completeRecording();
  expect(card).to.have.property('ap', '40');
})


test('rip - we dont have the card url in memory but it is in db', async (t) => {
  const { completeRecording, assertScopesFinished } = await record("cardRip2");
  const fetch = new Fetch();
  const store = td.instance(Store);
  td.when(store.findCard(td.matchers.anything()))
    .thenReturn(
      new Card(null, null, null, {
        setAbbr: 'HMK',
        number: '01-001',
        release: '01',
        num: '001',
        url: 'http://p-memories.com/node/383031'
      })
    )
  const parse = new Parse(fetch, store);
  const card = new Card(fetch, parse, store, {
    setAbbr: 'HMK',
    num: '001',
    release: '01'
  });
  await card.rip();
  assertScopesFinished();
  completeRecording();
  expect(card).to.have.property('url', 'http://p-memories.com/node/383031');
})


test('rip - url neither in memory nor db', async (t) => {
  const { completeRecording, assertScopesFinished } = await record("cardRip3");
  const fetch = new Fetch();
  const store = td.instance(Store);
  td.when(store.findCard(td.matchers.anything()))
    .thenReject(
      new Error('No card found')
    )
  const parse = new Parse(fetch, store);
  const card = new Card(fetch, parse, store, {
    setAbbr: 'HMK',
    num: '001',
    release: '01'
  });
  await card.rip();
  assertScopesFinished();
  completeRecording();
  expect(card).to.have.property('url', 'http://p-memories.com/node/383031');
  expect(card).to.have.property('ap', '40');
})

test('save() should save card to storage', async (t) => {
  const cardSet = new CardSet(this.fetch, this.parse, this.fakeStore, {
    setAbbr: 'HMK'
  });
  await cardSet.save();
});



// test('load() should load card from storage', async (t) => {

// });




test('find - card exists in db', async (t) => {
    const searchParams = {
        setAbbr: 'HMK',
        number: '01-001'
    };
    const { completeRecording, assertScopesFinished } = await record('findCard1');
    const fetch = new Fetch();
    const parse = new Parse(null, null);
    const FakeStore = td.constructor(Store);
    const store = new FakeStore();
    td.when(
      FakeStore.prototype.findCard(
        td.matchers.anything())
      )
      .thenReturn(
        new Card(fetch, parse, store, {
          number: '01-001',
          release: '01',
          num: '001',
          name: '初音ミク'
        }))

    const card = new Card(fetch, parse, store, searchParams);
    await card.find();
    completeRecording();
    assertScopesFinished();
    console.log(card);
    expect(card).to.be.instanceof(Card);
    expect(card).to.have.property('release', '01');
    expect(card).to.have.property('num', '001');
    expect(card).to.have.property('name', '初音ミク');
});


test('find - card does not exist in db', async (t) => {
    const searchParams = {
        setAbbr: 'HMK',
        number: '01-001'
    };
    const { completeRecording, assertScopesFinished } = await record('findCard2');
    const fetch = new Fetch();
    const FakeStore = td.constructor(Store);
    const store = new FakeStore();
    td.when(
      FakeStore.prototype.findCard(
        td.matchers.anything())
      )
      .thenResolve(new Error('Card not found!'));
    const parse = new Parse(fetch, store);
    


    const card = new Card(fetch, parse, store, searchParams);

    // When no card is found,
    // A graceful fallback to ripping official website is expected
    await card.find(); 

    completeRecording();
    assertScopesFinished();
    expect(card).to.be.instanceof(Card);
    expect(card).to.have.property('number', '01-001');
    expect(card).to.have.property('name', '初音　ミク');
});