
const path = require('path');
const fs = require('fs');
const defaultCardBackImageBuffer = fs.readFileSync(
    path.join(
        __dirname,
        '..',
        'fixtures',
        'test-image.jpg'
    )
);
const debug = require('debug')('precious-data')


class Card {
    constructor(fetch, parse, store, params) {
        this.fetch = fetch;
        this.parse = parse;
        this.store = store;
        this.name = params?.name || "";
        this.ap = params?.ap || "";
        this.dp = params?.dp || "";
        this.number = params?.number || "";
        this.rarity = params?.rarity || "";
        this.setName = params?.setName || "";
        this.type = params?.type || "";
        this.cost = params?.cost || "";
        this.source = params?.source || "";
        this.color = params?.color || "";
        this.characteristic = params?.characteristic || "";
        this.parallel = params?.parallel || "";
        this.text = params?.text || "";
        this.flavor = params?.flavor || "";
        this.image = params?.image || "";
        this.url = params?.url || "";
        this.setAbbr = params?.setAbbr || "";
        this.num = params?.num || "";
        this.release = params?.release || "";
        this.id = params?.id || "";
        this.imageBlob = params?.imageBlob || "";
    }

    get (property) {
        if (!this.hasOwnProperty(property)) throw new Error(`Card does not have property ${property}`);
        else return this[property];
    }

    async rip () {
        if (this.url.length === 0) {
            throw new Error('Card is missing url property, which is required for ripping!');
        } else {
            const bodies = await this.fetch.fetchBodies(this.url);
            const cards = this.parse.getCards(bodies[0]);
            this.mergeProperties(cards[0]);
        }

        // setAbbr and number at a minimum are required to find the card on the website
        
    }

    mergeProperties (card) {
        Object.keys(card).forEach((key) => {
            if (key === 'fetch' || key === 'parse' || key === 'store') return;
            this[key] = card[key] || ""
        });
    }

    async find () {
        const card = await this.store.findCard(this);
        this.mergeProperties(card);
    }

    async downloadImage () {
        this.imageBlob = await this.fetch.fetchBuffer(this.image);
    }

    async save () {
        await this.store.saveCard(this);
    }
}

module.exports = Card;