const test = require('ava');
const Game = require('../lib/Game.js');
const Card = require('../lib/Card.js');
const CardSet = require('../lib/CardSet.js');
const Parse = require('../lib/Parse.js');
const Fetch = require('../lib/Fetch.js');
const Store = require('../lib/Store.js');
const PM = require('../lib/PMemoriesCom');
const { expect } = require('chai');
const { setupRecorder } = require('nock-record');
const record = setupRecorder();


test('ripAllCards', async (t) => {
    t.timeout(1000*60*60*24); // 24 hour timeout.. It probably doesn't take quite this long.
    const pm = new PM();
    const fetch = new Fetch();
    const store = new Store();
    await store.init();
    const parse = new Parse(fetch, store);
    const game = new Game(pm, fetch, parse, store);
    await game.ripAllCards();
    const sampleCard = await store.findCard({
        setAbbr: 'SSSS',
        num: '008',
        release: '01'
    });
    expect(sampleCard).to.be.instanceof(Card);
    expect(sampleCard).to.have.property('setAbbr', 'SSSS');
    expect(sampleCard).to.have.property('num', '008');
    expect(sampleCard).to.have.property('release', '01');
});

test('ripAllCardSets', async (t) => {
    t.timeout(1000*60*3)
    const pm = new PM();
    const fetch = new Fetch();
    const store = new Store();
    await store.init();
    const parse = new Parse(fetch, store);
    const game = new Game(pm, fetch, parse, store);
    await game.ripAllCardSets();
    const sampleCardSet = await store.findCardSet({
        setAbbr: 'SSSS'
    })
    expect(sampleCardSet).to.be.instanceof(CardSet)
})

test('loadCards', async (t) => {
    const pm = new PM();
    const fetch = new Fetch();
    const store = new Store();
    await store.init();
    const parse = new Parse(fetch, store);
    const game = new Game(pm, fetch, parse, store);
    const cards = await game.loadCards();
    expect(cards[0]).to.be.instanceof(Card);
    expect(cards).to.be.an('array');
    expect(cards.length).to.be.above(500);
})
