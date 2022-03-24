
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
        // best case scenario. we have the direct URL
        if (this.url !== '') {
            const bodies = this.fetch.getBodies(this.url);
            const card = this.parse.getCards(bodies[0]);
        }
        // this.fetch.; @todo
    }

    async find () {
        const card = await this.store.findCard(this);
        Object.keys(card).forEach((key) => {
            if (key === 'fetch' || key === 'parse' || key === 'store') return;
            this[key] = card[key] || ""
        });
    }

    async downloadImage () {
        this.imageBlob = await this.fetch.fetchBuffer(this.image);
    }

    async save () {
        await this.store.saveCard(this);
    }
}

module.exports = Card;