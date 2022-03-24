const test = require('ava');
const td = require('testdouble');
const { expect } = require('chai');
const Ripper = require('../lib/ripper.js');
const path = require('path');
const Promise = require('bluebird');
const axios = require('axios');
const { Readable } = require('stream');
const { setupRecorder } = require('nock-record');
// const fs = require('fs');
// const fsp = fs.promises;

axios.defaults.adapter = require('axios/lib/adapters/http');

const setAbbrIndexPath = path.join(__dirname, '..', 'data', 'setAbbrIndex.json');
const setAbbrIndexFixturePath = path.join(__dirname, '..', 'fixtures', 'setAbbrIndex.json');
const setAbbrIndexFixture = require(setAbbrIndexFixturePath);
const hmk01001DataPath = path.join(__dirname, '..', 'data', 'HMK', '01', 'HMK_01-001.json');
const hmk01001FixturePath = path.join(__dirname, '..', 'fixtures', 'HMK_01-001.json');
const hmk01001Fixture = require(hmk01001FixturePath);

const setUrlsFixture = [
  // mocking links for HMK, SSSS, and GPFN sets
  'http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on',
  'http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on',
  'http://p-memories.com/card_product_list_page?field_title_nid=931488-%E3%82%AC%E3%83%BC%E3%83%AB%E3%82%BA%EF%BC%86%E3%83%91%E3%83%B3%E3%83%84%E3%82%A1%E3%83%BC%E3%80%80%E6%9C%80%E7%B5%82%E7%AB%A0&s_flg=on'
]

const record = setupRecorder({ mode: 'record' });

console.log("NOTE.\nWhen running this test suite for the first time, nock fixtures are created which can take a long time.\nRun with env var DEBUG=\"precious-data\" to see progress.\nRun tests a second time to make use of the fixtures.")



test.beforeEach(async (t) => {
  // t.context.ripper = td.instance(Ripper);
  t.context.ripper = new Ripper({});
  
  // td.when(t.context.ripper.buildSetAbbrIndex()).thenResolve([{
  //   setAbbr: 'HMK',
  //   setUrl: 'https://example.com/hmk'
  // }])

  // td.when(t.context.ripper.getSets()).thenResolve([{
  //   "setAbbr":"HMK",
  //   "setUrl":"http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on"
  // }])

  console.log('the following is this');
  console.log(this);
  console.log('the following is t.context.ripper');
  console.log(t.context.ripper);
  
});


test('getCardUrlsFromSetPage should accept a card number and setUrl and resolve an object with cardUrl and cardImageUrl', async (t) =>  {
  const { completeRecording, assertScopesFinished } = await record("getCardUrlsFromSetPage");
  const card = await t.context.ripper.getCardUrlsFromSetPage('01-050', 'http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on')
  completeRecording();
  assertScopesFinished();
  expect(card).to.be.an('object');
  expect(card).toHaveProperty('cardUrl', 'http://p-memories.com/node/926840');
  expect(card).toHaveProperty('cardImageUrl', 'http://p-memories.com/images/product/SSSS/SSSS_01-050.jpg');
});

test("lookupCardUrl should throw an error if not receiving a parameter", function (t) {
  return expect(t.context.ripper.lookupCardUrl).to.throw(/Got undefined/);
});
test("should throw an error if receiving an empty string", (t) => {
  const that = this;
  return expect(function () {
    that.ripper.lookupCardUrl('')
  }).to.throw(/Got an empty string/)
});
test('should resolve { cardUrl, cardImageUrl } when given a card ID', async (t) => {
  const { completeRecording, assertScopesFinished } = await record("lookupCardUrl1");
  const card = await t.context.ripper.lookupCardUrl('SSSS_01-001');
  completeRecording();
  assertScopesFinished();
  expect(card).toHaveProperty('cardUrl', 'http://p-memories.com/node/926791')
  expect(card).toHaveProperty('cardImageUrl', 'http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg')
})


test("isValidPMemoriesUrl should return true when receiving p-memories.com url as param", (t) => {
    let valid = t.context.ripper.isValidPMemoriesUrl('http://p-memories.com/node/926791');
    expect(valid).to.be.true
});
test("isValidPMemoriesUrl should return true when receiving www.p-memories url as param", (t) => {
    let valid = t.context.ripper.isValidPMemoriesUrl('http://www.p-memories.com/node/926791');
    expect(valid).to.be.true
});
test("isValidPMemoriesUrl should return false when receiving a foreign url as param", (t) => {
  let invalid = t.context.ripper.isValidPMemoriesUrl('http://google.com');
  expect(invalid).to.be.false
});
test("isValidPMemoriesUrl should return false when receiving a card ID", (t) => {
  let invalid = t.context.ripper.isValidPMemoriesUrl('SSSS_01-001');
  expect(invalid).to.be.false
});


test('getSets', async (t) =>  {
  const { completeRecording, assertScopesFinished } = await record("getSets");
  const sets = await t.context.ripper.getSets();
  completeRecording();
  assertScopesFinished();

  console.log(sets)

  expect(sets).to.deep.include({
    setUrl: 'http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on',
    setName: 'SSSS.GRIDMAN',
    setAbbr: 'SSSS'
  });
});

test('getSetNames should resolve a list of {String} setNames', async (t) => {
  const { completeRecording, assertScopesFinished } = await record("getSetNames1");
  const names = await t.context.ripper.getSetNames()
  completeRecording();
  assertScopesFinished();
  expect(names).to.equal(expect.arrayContaining([
    'SSSS.GRIDMAN',
    '初音ミク',
    'ハロー！！きんいろモザイク'
  ]))
});

test('getSetUrls should return a list of all set URLs found on p-memories.com', async (t) => {
  const { completeRecording, assertScopesFinished } = await record("getSetUrls");
  const setList = await t.context.ripper.getSetUrls()
  completeRecording();
  assertScopesFinished();
  expect(setList).to.be.instanceOf(Array)
  expect(setList.length).to.equal(3) // normally this is 94+, but in testing we're mocking the network request so we only see length of 3
  expect(setList[0]).to.equal(expect.stringMatching(/http:\/\/p-memories.com\/card_product_list_page\?/))
  expect(setList).to.equal(expect.arrayContaining(setUrlsFixture));
});




test('ripSetData should accept a setAbbr as input', async (t) => {
  const { completeRecording, assertScopesFinished, scopes } = await record("ripSetData6");
  const data = await t.context.ripper.ripSetData('HMK');
  debug('scopes following vvv')
  debug(scopes)
  expect(data).to.beArray();
  expect(data[0]).toHaveProperty('cardImageUrl');
  expect(data[0]).toHaveProperty('cardUrl');
  completeRecording();
  assertScopesFinished();
});
test('ripSetData should accept a setURL as parameter and return a promise', async (t) => {
  const { completeRecording, assertScopesFinished } = await record("ripSetData1");
  const imagePromise = t.context.ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on');
  await expect(imagePromise).resolves.toStrictEqual(expect.anything())
  completeRecording();
  assertScopesFinished();
});
test("ripSetData should throw if not receiving a setURL as param", (t) => {
  try {
    t.context.ripper.ripSetData();
  } catch (e) {
    expect(e).to.match(/param/);
  }
});
test('ripSetData should resolve with an array of objects containing cardUrl and cardImageUrl', async (t) =>  {
    const { completeRecording, assertScopesFinished } = await record("ripSetData2");
    const data = await t.context.ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on')
    completeRecording();
    assertScopesFinished();
    expect(data).to.beArray();
    expect(data.length).to.be(1);
    expect(data[0].cardImageUrl).to.beString();
    expect(data[0].cardUrl).to.beString();
});
test('ripSetData should rip a set which contains more than one page', async (t) =>  {
  const { completeRecording, assertScopesFinished } = await record("ripSetData3");
  const data = await t.context.ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on')
  completeRecording();
  assertScopesFinished();
  expect(data).to.beArray();
  expect(data.length).to.beGreaterThanOrEqual(403);
});

test('ripSetData should cope with a relative p-memories.com URL', async (t) =>  {
  const { completeRecording, assertScopesFinished } = await record("ripSetData4");
  const data = await t.context.ripper.ripSetData('/card_product_list_page?field_title_nid=241831-ClariS&s_flg=on')
  completeRecording();
  assertScopesFinished();
  expect(data).to.be.instanceOf(Array)
  expect(data.length).to.be(1)
});

test('ripSetData should download madoka release 03', async (t) =>  {
  const { completeRecording, assertScopesFinished } = await record("ripSetData5");
  const setData = await t.context.ripper.ripSetData('http://p-memories.com/card_product_list_page?field_title_nid=313372-%E5%8A%87%E5%A0%B4%E7%89%88+%E9%AD%94%E6%B3%95%E5%B0%91%E5%A5%B3%E3%81%BE%E3%81%A9%E3%81%8B%E2%98%86%E3%83%9E%E3%82%AE%E3%82%AB&s_flg=on')
  completeRecording();
  assertScopesFinished();
  expect(setData).to.be.instanceOf(Array);
  expect(setData.length).to.beGreaterThan(1);
});



test("ripCardData Should throw an error if not receiving any param", (t) => {
  const that = this;
  return expect(function () {
    that.ripper.ripCardData()
  }).to.throw(/Got undefined/)
});
test('ripCardData Should throw an error if receiving an empty string', async (t) =>  {
  try {
    await t.context.ripper.ripCardData('')
  } catch (e) {
    expect(e).to.match(/Got an empty string/) 
  }
});
test('ripCardData Should accept a card URL and resolve to card data', async (t) =>  {
    const { completeRecording, assertScopesFinished } = await record("ripCardData1");
    const data = await t.context.ripper.ripCardData('http://p-memories.com/node/926791')
    completeRecording();
    assertScopesFinished();
    expect(typeof data).to.be('object');
    expect(data.number).to.equal('01-001');
    expect(data.rarity).to.equal('SR');
    expect(data.setName).to.equal('SSSS.GRIDMAN');
    expect(data.name).to.equal('響 裕太');
    expect(data.type).to.equal('キャラクター');
    expect(data.cost).to.equal('6');
    expect(data.source).to.equal('3');
    expect(data.color).to.equal('赤');
    expect(data.characteristic).to.equal(['制服']);
    expect(data.ap).to.equal('-');
    expect(data.dp).to.equal('-');
    expect(data.parallel).to.equal('');
    expect(data.text).to.equal(
      'このカードが登場した場合、手札から名称に「グリッドマン」を含むキャラ1枚を場に出すことができる。[メイン/自分]:《休》名称に「グリッドマン」を含む自分のキャラ1枚は、ターン終了時まで+20/+20を得る。その場合、カードを1枚引く。'
    );
    expect(data.flavor).to.equal('グリッドマン…。オレと一緒に戦ってくれ！');
    expect(data.url).to.equal('http://p-memories.com/node/926791');
    expect(data.image).to.equal('http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg');
    expect(data.setAbbr).to.equal('SSSS');
    expect(data.id).to.equal('SSSS 01-001');
    expect(data.num).to.equal('001');
    expect(data.release).to.equal('01');
});

test('ripCardData should accept a card ID as first param', async (t) =>  {
  const { completeRecording, assertScopesFinished } = await record("ripCardData2");
  const data = await t.context.ripper.ripCardData('http://p-memories.com/node/926791');
  completeRecording();
  assertScopesFinished();
  expect(data).to.beObject()
  expect(data).toHaveProperty('number', '01-001')
  expect(data).toHaveProperty('url', 'http://p-memories.com/node/926791')
  expect(data).toHaveProperty('image', 'http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg')
});

test('ripCardData should accept a second parameter, a cardImageUrl, which will be used to determine whether or not to make a network request to rip card data.', async (t) =>  {
  // https://github.com/insanity54/precious-data/issues/4
  const { completeRecording, assertScopesFinished } = await record("ripCardData3");
  const imageStream = await t.context.ripper.ripCardData('http://p-memories.com/node/932341', '/images/product/GPFN/GPFN_01-030a.jpg')
  completeRecording();
  assertScopesFinished();
  expect(typeof data).to.be('object');
  expect(data.number).to.equal('01-030a');
  expect(data.url).to.equal('http://p-memories.com/node/932341');
  expect(data.id).to.equal('GPFN 01-030a');
});


test('should cope with a relative P-memories URL', async (t) =>  {
    const { completeRecording, assertScopesFinished } = await record("ripCardData5");
    const data = await t.context.ripper.ripCardData('/node/926791')
    completeRecording();
    assertScopesFinished();
    expect(typeof data).to.be('object');
    expect(data.number).to.equal('01-001');
    expect(data.url).to.equal('http://p-memories.com/node/926791');
});



test('downloadImage Should accept a card image URL, image and resolve with a Readable stream', async (t) =>  {

  const { completeRecording, assertScopesFinished } = await record("downloadImage1");
  const imageStream = await t.context.ripper.downloadImage('http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg');

  // put the stream into flowing mode and save the file (straight to /dev/null is fine)
  // so nock actually records the stream's contents
  await new Promise((resolve, reject) => {
    imageStream.pipe(fs.createWriteStream('/dev/null'))
    imageStream.on('end', resolve);
    imageStream.on('error', reject);
  });


  // Complete the recording, allow for Nock to write fixtures
  completeRecording();

  // Optional; assert that all recorded fixtures have been called
  assertScopesFinished();

  // Perform your own assertions
  expect(imageStream).to.be.instanceOf(Readable)

});
test('downloadImage Should accept a card URL, download the card image and resolve with a Readable stream', async (t) =>  {
    const { completeRecording, assertScopesFinished } = await record("downloadImage2");
    const imageStream = await t.context.ripper.downloadImage('http://p-memories.com/node/926791');
    // put the stream into flowing mode and save the file (straight to /dev/null is fine)
    // so nock actually records the stream's contents
    await new Promise((resolve, reject) => {
      imageStream.pipe(fs.createWriteStream('/dev/null'))
      imageStream.on('end', resolve);
      imageStream.on('error', reject);
    })
    completeRecording();
    assertScopesFinished();
    expect(imageStream).to.be.instanceOf(Readable);
});
test('downloadImage should accept a card data object, download the image specified within, and resolve with a Readable stream', async (t) =>  {
  let cardData = require(path.join(__dirname, '..', 'fixtures', 'HMK_01-001.json'));
  const { completeRecording, assertScopesFinished } = await record("downloadImage3");
  const imageStream = await t.context.ripper.downloadImage(cardData);
  // put the stream into flowing mode and save the file (straight to /dev/null is fine)
  // so nock actually records the stream's contents
  await new Promise((resolve, reject) => {
    imageStream.pipe(fs.createWriteStream('/dev/null'))
    imageStream.on('end', resolve);
    imageStream.on('error', reject);
  })
  completeRecording();
  assertScopesFinished();
  expect(imageStream).to.be.instanceOf(Readable);
});


test("buildImagePath should build an image path given an image URL", (t) => {
  // input: http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg
  // output: ../SSSS/SSSS_01-001.jpg
  let path = t.context.ripper.buildImagePath('http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg');
  expect(path).to.match(/\/data\/SSSS\/01\/SSSS_01-001.jpg/);
});

test("buildCardDataPath should build a card data path given a card JSON data file", (t) => {
  let path = t.context.ripper.buildCardDataPath(require('../fixtures/HMK_01-001.json'));
  expect(path).to.match(/\/data\/HMK\/01\/HMK_01-001.json/);
});

test("identifyUrl should return the string, 'card' when fed a card URL", (t) => {
  let urlType = t.context.ripper.identifyUrl('http://p-memories.com/node/906300');
  expect(urlType).to.equal('card');
});
test("identifyUrl should return the string, 'set' when fed a card URL", (t) => {
  let urlType = t.context.ripper.identifyUrl('http://p-memories.com/card_product_list_page?field_title_nid=845152-NEW+GAME%21');
  expect(urlType).to.equal('set');
});
test("identifyUrl should return the String, 'unknown' when fed an empty URL", (t) => {
  let urlType = t.context.ripper.identifyUrl('');
  expect(urlType).to.equal('unknown');
});
test("identifyUrl should return the String, 'unknown' when fed a foreign URL", (t) => {
    let urlType = t.context.ripper.identifyUrl('https://www.youtube.com/watch?v=JQlkfkvR9A0');
    expect(urlType).to.equal('unknown');
});



test('getSetAbbrIndex should return a promise', async (t) =>  {
  const { completeRecording } = await record("getSetAbbrIndex1");
  const promise = t.context.ripper.getSetAbbrIndex({ useCache: false });
  expect(promise).to.be.instanceOf(Promise);
  await promise
  completeRecording();
});
test('getSetAbbrIndex should reach out to p-memories.com and create an index which maps set abbreviations to set URLs', async (t) =>  {
  const { completeRecording, assertScopesFinished } = await record("getSetAbbrIndex2");
  let index = await t.context.ripper.getSetAbbrIndex({ useCache: false });
  completeRecording();
  assertScopesFinished();
  expect(index).toContainEqual({
    setAbbr: 'HMK',
    setUrl: 'http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on'
  })
});
// 'should fetch a setAbbrIndex from cache, or reach out to buildSetAbbrIndex() if the cache is empty', async (t) =>  {
//   const { completeRecording, assertScopesFinished } = await record("getSetAbbrIndex3");
//   let index = await t.context.ripper.getSetAbbrIndex({ useCache: true });
//   completeRecording();
//   assertScopesFinished();
//   expect(index)
// });

test('loadSetAbbrIndex should resolve with an array of objects containing setAbbr and setUrl keys', async (t) =>  {
  let index = await t.context.ripper.loadSetAbbrIndex()
  expect(index).to.be.equal({
    setAbbr: 'HMK',
    setUrl: 'http://p-memories.com/card_product_list_page?field_title_nid=280695-%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF&s_flg=on'
  })
});

// test("should reject with an Error if setAbbrIndex.json does not exist", (t) => {
//   // @todo this is an evergreen test
//   td.when(t.context.ripper.loadSetAbbrIndex()).thenReject(Error('ENOENT: no such file or directory'))
//   let index = t.context.ripper.loadSetAbbrIndex()
//   return expect(index).to.throw(/ENOENT/)
// });

test("getSetSuggestion Should accept an {Array} setAbbrIndex and {String} setAbbr", (t) => {
  let suggestions = t.context.ripper.getSetSuggestion(setAbbrIndexFixture, 'oreimo')
});
test("getSetSuggestion Should throw if not receiving required params", (t) => {
  expect(function () {
    t.context.ripper.getSetSuggestion()
  }).to.throw()
});
test("getSetSuggestion Should return an {Array} of suggestions", (t) => {
  let suggestions = t.context.ripper.getSetSuggestion(setAbbrIndexFixture, 'OREIMO')
  expect(suggestions.length).to.be.greaterThanOrEqual(2)
  // expect('Today is sunny').to.contain.oneOf(['sunny', 'cloudy'])
  expect(suggestions).to.include.members(['oreimo', 'ORE2'])
});

test('getSetUrlFromSetAbbr Should return a promise', async (t) =>  {
  const { completeRecording, assertScopesFinished } = await record("getSetUrlFromSetAbbr1");
  let promise = t.context.ripper.getSetUrlFromSetAbbr('HMK')
  expect(promise).to.be.instanceOf(Promise);
  let url = await promise
  completeRecording();
  assertScopesFinished();
});
test('getSetUrlFromSetAbbrShould reject with an error which makes a suggestion when the user submits a set that doesnt exist', async (t) =>  {
  const { completeRecording, assertScopesFinished } = await record("getSetUrlFromSetAbbr3");
  expect(t.context.ripper.getSetUrlFromSetAbbr('OREIMO')).to.throw(/Did you mean/);
  completeRecording();
  assertScopesFinished();
});
test('getSetUrlFromSetAbbr Should return the correct URL for SSSS.GRIDMAN', async (t) =>  {
  const { completeRecording, assertScopesFinished } = await record("getSetUrlFromSetAbbr4");
  const url = await t.context.ripper.getSetUrlFromSetAbbr('SSSS')
  completeRecording();
  assertScopesFinished();
  expect(url).to.equal(
    'http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on'
  )
});
test('getSetUrlFromSetAbbr Should return the correct URL for ookami', async (t) =>  {
  return t.context.ripper.getSetUrlFromSetAbbr('ookami')
    .then((url) => {
      expect(url).to.equal(
        'http://p-memories.com/card_product_list_page?field_title_nid=4539-%E3%82%AA%E3%82%AA%E3%82%AB%E3%83%9F%E3%81%95%E3%82%93%E3%81%A8%E4%B8%83%E4%BA%BA%E3%81%AE%E4%BB%B2%E9%96%93%E3%81%9F%E3%81%A1&s_flg=on'
      );
    });
});

test('Should return an error if an unknown set is requested', async (t) =>  {
  try {
    await t.context.ripper.getSetUrlFromSetAbbr('tacobell6969');
  } catch (e) {
    expect(e).to.match(/matchingPair not found/);
  }
});


test("getSetAbbrFromImageUrl should throw if not receiving param", (t) => {
  expect(function () {
    t.context.ripper.getSetAbbrFromImageUrl()
  }).to.throw(/undefined/)
});
test("getSetAbbrFromImageUrl Should return SSSS when receiving param http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg", (t) => {
  let setAbbr = t.context.ripper.getSetAbbrFromImageUrl('http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg');
  expect(setAbbr).to.equal('SSSS');
});



test('getFirstCardImageUrl Should accept a set URL and return the image URL for the first card in the set', async (t) => {
  const { completeRecording, assertScopesFinished } = await record("getFirstCardImageUrl1");
  const imageUrl = await t.context.ripper.getFirstCardImageUrl('http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on');
  completeRecording();
  assertScopesFinished();
  expect(imageUrl).to.equal('http://p-memories.com/images/product/SSSS/SSSS_01-001.jpg')
});

test('getFirstCardImageUrl should return normalized URLs', async (t) => {
  const { completeRecording, assertScopesFinished } = await record("getFirstCardImageUrl2");
  const imageUrl = await t.context.ripper.getFirstCardImageUrl('http://p-memories.com/card_product_list_page?field_title_nid=4539-%E3%82%AA%E3%82%AA%E3%82%AB%E3%83%9F%E3%81%95%E3%82%93%E3%81%A8%E4%B8%83%E4%BA%BA%E3%81%AE%E4%BB%B2%E9%96%93%E3%81%9F%E3%81%A1&s_flg=on')
  completeRecording();
  assertScopesFinished();
  expect(imageUrl).to.equal('http://p-memories.com/images/product/ookami/ookami_01-001.jpg')
});


test('getImageUrlFromEachSet Should accept no parameters and return an array of objects with sampleCardUrl and setUrl and setName k/v', async (t) => {
  const { completeRecording, assertScopesFinished } = await record("getImageUrlFromEachSet");
  const imageUrls = await t.context.ripper.getImageUrlFromEachSet()
  completeRecording();
  assertScopesFinished();
  expect(imageUrls).to.beArray()
  expect(imageUrls[0]).to.beObject()
  expect(imageUrls[0].setUrl).to.beString()
  expect(imageUrls[0].sampleCardUrl).to.beString()
});



// afterEach, async (t) => () {
//   await t.context.ripper.stop();
// },

test('buildSetAbbrIndex should return an {Array} setAbbrIndex', async (t) => {
  const { completeRecording, assertScopesFinished } = await record("buildSetAbbrIndex1");
  const setAbbrIndex = await t.context.ripper.buildSetAbbrIndex();
  completeRecording();
  assertScopesFinished();
  expect(setAbbrIndex).to.be.instanceOf(Array);
  expect(setAbbrIndex.length).to.be.above(3); // in the wild this would be much greater than 3. It's 3 here because of the mock on getSetUrls
  expect(setAbbrIndex[0]).to.have.property('setAbbr');
  expect(setAbbrIndex[0]).to.have.property('setUrl');
  expect(setAbbrIndex[0]).to.have.property('setName');
});

// 'should reach out to p-memories.com and build a setAbbrIndex', async (t) =>  {
//   console.log("L>>>>>>>>>>>>>>>>>>>>")
//     const { completeRecording, assertScopesFinished } = await record("buildSetAbbrIndex2");
//     const setAbbrIndex = await t.context.ripper.buildSetAbbrIndex();
//     completeRecording();
//     assertScopesFinished();
//     expect(setAbbrIndex).to.be.instanceOf(Array);
//     expect(setAbbrIndex[0]).toHaveProperty('setAbbr');
//     expect(setAbbrIndex[0]).toHaveProperty('setUrl');
// }





