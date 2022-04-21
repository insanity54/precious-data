const test = require('ava');
const { setupRecorder } = require('nock-record');
const record = setupRecorder();
const { expect } = require('chai');
const PMemoriesCom = require('../lib/PMemoriesCom');
const Fetch = require('../lib/Fetch');
const Parse = require('../lib/Parse');
const Card = require('../lib/Card');


test('search', async (t) => {
  const { completeRecording, assertScopesFinished } = record('search');
  const parse = new Parse();
  const fetch = new Fetch();
  const pm = new PMemoriesCom(fetch, parse);
  const cardParams = {
    setAbbr: 'GP',
    number: '01-050'
  };
  const card = new Card(fetch, parse, null, cardParams);
  const result = await pm.search(card);

  expect(result).to.be.an.instanceof(Card);
  expect(result).to.have.property('url', 'http://p-memories.com/node/375689');


});
