const debug = require('debug')('precious-data');
const EventEmitter = require('events');
const Card = require('./Card.js');

/**
 * Represents the entire Precious Memories game
 * 
 */

class Game {
    constructor(pm, fetch, parse, store) {
        this.pm = pm;
        this.fetch = fetch;
        this.parse = parse;
        this.store = store;
        this.cardSets = [];
        this.ee = new EventEmitter();
    }


    /**
     * ripAllCardSets
     * 
     * learn about all the CardSets in PM
     * and save data to the cardSets table
     * 
     */
    async ripAllCardSets() {
        // targets
        let targetCardSetUrls = [];

        // learn of all the cardSet pages
        const html = await this.fetch.fetchBodies(this.pm.setsPage);
        const cardSets = this.parse.getCardSets(html[0]);
        this.ee.emit('start', { title: 'CardSets', total: cardSets.length })

        for (const [i, cardSet] of cardSets.entries()) {
            // get the first card image so we can derive the setAbbr
            cardSet.setAbbr = await cardSet.getCardSetAbbr();
            await cardSet.save();
            this.ee.emit('progress', { title: cardSet.setName, count: i });
        }

        return this;
    }


    /**
     * ripAllCards
     * 
     * reach out to the internet and download image/text data for each card and each cardSet in the game
     * data is saved to the sql database
     * 
     */
    async ripAllCards() {
        


        // get a huge list of URLs which we are going to scrape
        // 

        // get totals
        //   - cardSets total
        //   - cards total
        //   - cardImages total (same as cards)

        // emit totals

        // begin
        // emit updates
        // console.log('Ripping...')

        // // targets
        // let targetCardSetUrls = [];

        // // learn of all the cardSet pages
        // const html = await this.fetch.fetchBodies(this.pm.setsPage);
        // const cardSets = this.parse.getCardSets(html[0]);
        // this.ee.emit('start', { title: 'CardSets', total: cardSets.length })

        // for (const [i, cardSet] of cardSets.entries()) {
        //     const cardSetUrls = await cardSet.getUrls();
        //     targetCardSetUrls = targetCardSetUrls.concat(cardSetUrls);
        //     this.ee.emit('progress', { title: cardSet.setName, count: i });
        // }

        // // we now know how many cardSet pages we have to work with
        // // (targetCardSetUrls.length)
        // this.ee.emit('start', { total: targetCardSetUrls.length, title: 'CardSets' });


        // // iterate through the pages and
        // //   - rip card data
        // for (const [i, cardSet] of targetCardSetUrls.entries()) {
        //     const bodies = await this.fetch.fetchBodies(cardSet);
        //     const cards = this.parse.getCards(bodies);

        //     for (const card of cards) {
        //         await card.save();
        //         this.ee.emit('progress', { count: i, title: `${card.name} ${card.number}` });
        //     }

        // }


        console.log('downloading cards')
        const cards = await this.loadCards();
        this.ee.emit('start', { title: 'Card Images', total: cards.length });

        // download the card images
        for (const [i, card] of cards.entries()) {
            debug(`  [r] downloading image for card num ${card?.number}`);
            await card.downloadImage();
            debug(`  [r] saving card ${card?.setAbbr} ${card?.number}`);
            await card.save();
            this.ee.emit('progress', { title: `${card.name} ${card.number}`, count: i });
        }

    }


    /**
     * loadCards
     * 
     * load all teh cards in the game
     * 
     * @return {Promise}
     * @resolve {Array<Card>}
     */
    async loadCards() {
        const rawCards = await this.store.loadCards();
        let cards = [];
        for (const rawCard of rawCards) {
            cards.push(new Card(this.fetch, this.parse, this.store, rawCard))
        }
        this.cards = cards;
        return this.cards;
    }



    /**
     * findCard
     * 
     * @param {Object} cardData
     * @return {Promise}
     * @resolve {Card}
     */ 
    async findCard(query) {
        const card = new Card(this.fetch, this.parse, this.store, query);

        try {
            debug('  [q] is card in db?')
            await card.find(); // find in db
            return card;

        } catch (e) {
            console.error(e);
            debug('  [d] Fetching card from website')

            const foundCard = await this.pm.search(card);
            await foundCard.downloadImage();
            await foundCard.save();

            return foundCard;
        }

    }
}

module.exports = Game;