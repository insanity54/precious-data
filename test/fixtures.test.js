const test = require('ava');
const nock = require('nock');
const td = require('testdouble');
const Fetch = require('../lib/Fetch.js');
const { expect } = require('chai');
const { setupRecorder } = require('nock-record');


test.beforeEach((t) => {
    t.context.record = setupRecorder();
})


test('fixtures -- should download a copy of ClariS set page', async function (t) {
  const fetch = new Fetch();
  const { completeRecording, assertScopesFinished } = await t.context.record("setPageSingle");
  const body = await fetch.fetchBody('http://p-memories.com/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on');
  completeRecording();
  assertScopesFinished();
  expect(body).to.be.a('string');
  expect(body).to.have.string('html');
  expect(body).to.have.string('head');
  expect(body).to.have.string('title');
  expect(body).to.have.string('body');
  expect(body).to.have.string('script');

})
