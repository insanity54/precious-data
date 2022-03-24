const td = require('testdouble');
const Fetch = require('../lib/Fetch.js');
const { expect } = require('chai');
const { setupRecorder } = require('nock-record');
const test = require('ava');
const { Buffer } = require('buffer');

const record = setupRecorder();





test('fetchBodies single url', async function () {
  const fetch = new Fetch();
  const { completeRecording, assertScopesFinished } = await record("fetchBodies1");
  const bodies = await fetch.fetchBodies('http://p-memories.com/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on');
  completeRecording();
  assertScopesFinished();
  expect(bodies).to.be.an('array');
  expect(bodies[0]).to.be.a('string');
  expect(bodies[0]).to.have.string('html');
  expect(bodies[0]).to.have.string('head');
  expect(bodies[0]).to.have.string('title');
  expect(bodies[0]).to.have.string('body');
  expect(bodies[0]).to.have.string('script');
});


test('fetchBodies array of urls', async function () {
  const fetch = new Fetch();
  const { completeRecording, assertScopesFinished } = await record("fetchBodies2");
  const bodies = await fetch.fetchBodies([
    'http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on',
    'http://p-memories.com/card_product_list_page?page=1&field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on'
  ]);
  completeRecording();
  assertScopesFinished();
  expect(bodies).to.be.an('array');
  expect(bodies[0]).to.be.a('string');
  expect(bodies[0]).to.have.string('html');
  expect(bodies[0]).to.have.string('head');
  expect(bodies[0]).to.have.string('title');
  expect(bodies[0]).to.have.string('body');
  expect(bodies[0]).to.have.string('script');
  expect(bodies[1]).to.be.a('string');
  expect(bodies[1]).to.have.string('html');
  expect(bodies[1]).to.have.string('head');
  expect(bodies[1]).to.have.string('title');
  expect(bodies[1]).to.have.string('body');
  expect(bodies[1]).to.have.string('script');
});


test('fetchBuffer', async (t) => {
  const fetch = new Fetch();
  const { completeRecording, assertScopesFinished } = await record('fetchBuffer');
  const buffer = await fetch.fetchBuffer('http://p-memories.com/images/product/HMK/HMK_01-001.jpg');
  completeRecording();
  assertScopesFinished();
  expect(buffer).to.be.instanceof(Buffer);
});