const Card = require('./Card.js');


class CardSet {
    constructor(fetch, parse, store, params) {
        this.fetch = fetch;
        this.parse = parse;
        this.store = store;
        this.cards = params.cards || [];
        this.setAbbr = params.setAbbr || '';
        this.setName = params.setName || '';
        this.setUrl = params.setUrl || '';
    }


    get (property) {
        if (!this.hasOwnProperty(property)) throw new Error(`CardSet does not have property ${property}`);
        else return this[property];
    }

    async load () {
        const cardSetResults = await this.store.loadCardSet({
            setAbbr: this.setAbbr,
            setName: this.setName,
            setUrl: this.setUrl
        });
        const cardsResult = await this.store.loadCards({
            setAbbr: this.setAbbr
        });
        for (const card of cardsResult) {
            const cardObject = new Card(this.fetch, this.parse, this.store, card);
            this.cards.push(cardObject);
        }
    }

    async save () {
        await this.store.saveCardSet({
            setAbbr: this.setAbbr,
            setName: this.setName,
            setUrl: this.setUrl
        });
        for (const card of this.cards) {
            this.store.saveCard(card);
        }
    }

    async rip () {
        const body = await this.fetchBody(this.setUrl);
        const data = await this.parseCardSet(body);
        this.setAbbr = data.setAbbr;
        this.setName = data.setName;
    }

    /**
     * getUrls
     * 
     * get the URLs for each page in this card set
     * 
     * @return {Array<String>} urls
     */
    async getUrls () {
        if (this.setUrl === '') throw new Error('CardSet#getUrls requires setUrl in order to know which set to look for, but they were both blank.')
        const bodies = await this.fetch.fetchBodies(this.setUrl);
        const pageUrls = this.parse.getCardSetUrls(bodies[0]).concat(this.setUrl);
        return pageUrls;
    }


    /**
     * getSetAbbr
     * 
     * get the set abbreviation
     * 
     * 
     */
    async getCardSetAbbr () {
        if (this.setUrl === '') throw new Error('CardSet#getSetAbbr requires setUrl in order to know which set to look for, but they were both blank.')
        const bodies = await this.fetch.fetchBodies(this.setUrl);
        const setAbbr = await this.parse.getCardSetAbbr(bodies[0]);
        this.setAbbr = setAbbr;
        return this.setAbbr;
    }
}

module.exports = CardSet;