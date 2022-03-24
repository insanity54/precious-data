const td = require('testdouble');
const Parse = require('../lib/Parse.js');
const Fetch = require('../lib/Fetch.js');
const Card = require('../lib/Card.js');
const { expect } = require('chai');
const test = require('ava');
const nock = require('nock');
const path = require('path');
const { setupRecorder } = require('nock-record');

const record = setupRecorder();

const mikuPage = 'http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on';
const mikuCardPage = 'http://p-memories.com/node/383031';
const clarisPage = 'http://p-memories.com/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on';

test.beforeEach((t) => {
    t.context.fetch = new Fetch();
    t.context.parse = new Parse(t.context.fetch, null);
});

test('getCards - accept CardSet page', async (t) => {
  const { completeRecording, assertScopesFinished } = await record("getCards1");
  const html = await t.context.fetch.fetchBodies(clarisPage);
  completeRecording();
  assertScopesFinished();
  const cards = t.context.parse.getCards(html[0]);
  expect(cards).to.be.an('array');
  expect(cards[0]).to.be.instanceOf(Card);
  console.log(cards[0]['image']);
  expect(cards[0]).to.have.property('image', 'http://p-memories.com/images/product/ClariS/ClariS_P-001.jpg');
  expect(cards[0]).to.have.property('url', 'http://p-memories.com/node/241834');
  expect(cards[0]).to.have.property('ap', '-');
  expect(cards[0]).to.have.property('dp', '-');
  expect(cards[0]).to.have.property('color', '赤');
});

test('getCards - accept Card page', async (t) => {
  const { completeRecording, assertScopesFinished } = await record("getCards3");
  const html = await t.context.fetch.fetchBodies(mikuCardPage);
  completeRecording();
  assertScopesFinished();
  const cards = t.context.parse.getCards(html[0]);
  expect(cards).to.be.an('array');
  expect(cards[0]).to.be.instanceOf(Card);
  console.log(cards[0]['image']);
  expect(cards[0]).to.have.property('image', 'http://p-memories.com/images/product/HMK/HMK_01-001.jpg');
  expect(cards[0]).to.have.property('url', 'http://p-memories.com/node/383031');
  expect(cards[0]).to.have.property('ap', '40');
  expect(cards[0]).to.have.property('dp', '30');
  expect(cards[0]).to.have.property('color', '緑');
})


test('getCards - should accept {Array<String>} of html and return {Array<Card>}', async (t) => {
  const { completeRecording, assertScopesFinished } = await record("getCards2");
  const html = await t.context.fetch.fetchBodies(mikuPage);
  const cards = t.context.parse.getCards(html[0]);
  completeRecording();
  assertScopesFinished();
  expect(cards.length).to.be.above(50);
  expect(cards[0]).to.be.instanceOf(Card);
  expect(cards[0]).to.have.property('ap', '40');
  expect(cards[0]).to.have.property('dp', '30');
  expect(cards[0]).to.have.property('color', '緑');
});


test('getCardSetUrls on a set without a pager', async (t) => {
  const { completeRecording, assertScopesFinished } = await record("getCardSetUrls1");
  const bodies = await t.context.fetch.fetchBodies(clarisPage);
  expect(bodies).to.be.an('array');
  expect(bodies[0]).to.be.a('string');
  completeRecording();
  assertScopesFinished();
  const urls = t.context.parse.getCardSetUrls(bodies[0]);
  expect(urls).to.be.an('array');
  expect(urls).to.have.lengthOf(0); // 0 because Parse#getCardSetUrls gets pages other than the one we're on 
})

test('getCardSetUrls on a set with 2 pages', async (t) => {
  const { completeRecording, assertScopesFinished } = await record("getCardSetUrls2");
  const bodies = await t.context.fetch.fetchBodies(mikuPage);
  expect(bodies).to.be.an('array');
  expect(bodies[0]).to.be.a('string');
  completeRecording();
  assertScopesFinished();
  const urls = t.context.parse.getCardSetUrls(bodies[0]);
  expect(urls).to.be.an('array');
  expect(urls).to.have.lengthOf(1); // 1 because Parse#getCardSetUrls gets pages other than the one we're on
})

test('getCardSetAbbr', async (t) => {
  const { completeRecording, assertScopesFinished } = await record("getCardSetAbbr");
  const bodies = await t.context.fetch.fetchBodies(mikuPage);
  const setAbbr = t.context.parse.getCardSetAbbr(bodies[0]);
  expect(setAbbr).to.equal('HMK');
})