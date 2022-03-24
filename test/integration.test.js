const test = require('ava');
const Store = require('../lib/Store');
const Fetch = require('../lib/Fetch');
const Parse = require('../lib/Parse');
const Card = require('../lib/Card');
const CardSet = require('../lib/CardSet');
const PMemoriesCom = require('../lib/PMemoriesCom');
const { expect } = require('chai');

test('lookup a card image', async () => {
    const fetch = new Fetch();
    const parse = new Parse();
    const store = new Store();
    await store.init();

    const card = await store.findCard({
        num: '001',
        release: '01',
        setAbbr: 'HMK'
    });

    console.log(card);

    expect(card).to.be.instanceof(Card);
    expect(card).to.have.property('url', 'http://p-memories.com/node/383031');
    expect(card).to.have.property('image', 'http://p-memories.com/images/product/HMK/HMK_01-001.jpg');
});



test('learn of all the sets', async () => {
    const pm = new PMemoriesCom();
    const parse = new Parse();
    const fetch = new Fetch();
    const html = await fetch.fetchBodies(pm.setsPage);
    const sets = parse.getCardSets(html);
    expect(sets).to.be.an('array');
    expect(sets[0]).to.be.instanceof(CardSet);
    expect(sets[0]).to.have.property('cards');
});

test('rip all the sets', async () => {
    const pm = new PMemoriesCom();
    const parse = new Parse();
    const fetch = new Fetch();
    const html = await fetch.fetchBodies(pm.setsPage);
    const sets = parse.getCardSets(html);
    const setsDatas = game.getAllCards();
    expect(sets[0].cards).to.be.an('array');
    expect(sets[0].cards[0]).to.be.instanceof(Card);
    expect(sets[0].cards[0].setAbbr).to.be.a('string');
    expect(sets[0].cards[0].setAbbr.length).to.be.above(2)
    console.log(sets[0]);
});


test('lookup a set', async (t) => {
    const pm = new PMemoriesCom();
    const parse = new Parse();
    const fetch = new Fetch();
    const store = new Store();
    await store.init();
    const html = await fetch.fetchBodies(pm.setsPage);
    const sets = parse.getCardSets(html);
    const hmk = await store.find
})



// test('rip a set with one page', async () => {
//     const parse = new Parse();
//     const fetch = new Fetch();
//     const pm = new PMemoriesCom();
//     const html = await fetch.fetchBodies(pm.setsPage);

//     expect(set).to.be.instanceof(Set);
//     expect(set).to.have.property('cards');
//     expect(set.cards).to.have.lengthOf(1);
// })

// test('rip a set with many pages', async () => {
//     const fetch = new Fetch();
//     const parse = new Parse();
//     const pm = new PMemoriesCom();
//     const setsHtml = await fetch.fetchBodies(pm.setsPage);
//     // const setUrls = await pm.getCardSetUrls('HMK');
//     const sets = parse.getCardSets(setsHtml);
//     expect(sets).to.be.an('array');
//     expect(sets).to.haveLength(2);
//     // const setPageHtmls = await fetch.fetchBodies(setUrls);
//     // const cards = parse.getCards(setPageHtmls);
//     expect(cards).to.be.an('array');
//     expect(cards[0]).to.be.instanceof(Cards);
// })




