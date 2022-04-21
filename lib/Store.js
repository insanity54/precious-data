const path = require('path');
const { dbPath } = require('./constants.js');
const fsp = require('fs').promises;
const debug = require('debug')('precious-data');
const db = require('better-sqlite3');
const Card = require('./Card.js');

const dbDir = path.dirname(dbPath);


class Store {
    constructor() {
        this.db = db(dbPath);
    }

    async init () {
        try {
          await fsp.mkdir(dbDir);
        } catch (e) {
          if (e?.code !== 'EEXIST') {
            console.error(`problem while creating database folder. ${e}`);
            process.exit();
          }
        }

        debug('create cards table if not already created');
        const createCardsStatement = this.db.prepare(
            `CREATE TABLE IF NOT EXISTS cards (
                number TEXT,
                rarity TEXT,
                setName TEXT,
                name TEXT,
                type TEXT,
                cost TEXT,
                source TEXT,
                color TEXT,
                characteristic TEXT,
                ap TEXT,
                dp TEXT,
                parallel TEXT,
                text TEXT,
                flavor TEXT,
                image TEXT,
                url TEXT UNIQUE,
                setAbbr TEXT,
                num TEXT,
                release TEXT,
                id TEXT,
                imageBlob BLOB
            )`
        );
        await createCardsStatement.run();


        const createCardSetsStatement = this.db.prepare(
            `CREATE TABLE IF NOT EXISTS cardSets (
                setName TEXT UNIQUE,
                setAbbr TEXT UNIQUE,
                setUrl TEXT UNIQUE
            )`
        )
        await createCardSetsStatement.run();
    }

    async saveCard (card) {
        await this.db;
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO cards VALUES(
                $number,
                $rarity,
                $setName,
                $name,
                $type,
                $cost,
                $source, 
                $color, 
                $characteristic, 
                $ap, 
                $dp, 
                $parallel, 
                $text, 
                $flavor, 
                $image, 
                $url, 
                $setAbbr, 
                $num, 
                $release, 
                $id,
                $imageBlob
            )`);

        stmt.run({
            number: card.number,
            rarity: card.rarity,
            setName: card.setName,
            name: card.name,
            type: card.type,
            cost: card.cost,
            source: card.source,
            color: card.color,
            characteristic: card.characteristic,
            ap: card.ap,
            dp: card.dp,
            parallel: card.parallel,
            text: card.text,
            flavor: card.flavor,
            image: card.image,
            url: card.url,
            setAbbr: card.setAbbr,
            num: card.num,
            release: card.release,
            id: card.id,
            imageBlob: card.imageBlob
        });
        return card;
    }

    async saveCardSet (cardSet) {
        await this.db;
        const statement = this.db.prepare(`INSERT OR REPLACE INTO cardSets VALUES(?, ?, ?)`);
        await statement.run(
            cardSet.setName,
            cardSet.setAbbr,
            cardSet.setUrl
        );
        return cardSet;
    }
    

    /**
     * loadCards
     * 
     * load all the cards
     * 
     * @return {Promise}
     * @resolve {Array<Card>}
     */
    async loadCards () {
        await this.db;
        const statement = this.db.prepare('SELECT * FROM cards');
        const cards = await statement.all();
        return cards;
    }

    async findCard (query) {
        await this.db;
        const statement = this.db.prepare('SELECT * FROM cards WHERE setAbbr = (?) AND number = (?)');
        const {setAbbr, number} = query;
        debug(`  [q] Store#findCard looking for setAbbr:${setAbbr}, number:${number}`);
        const result = statement.get(setAbbr, number);
        if (typeof result === 'undefined') throw new Error('Card not found!');
        const card = new Card(null, null, this, result);
        return card;
    }

    async findCardSet (query) {
        if (typeof query === 'undefined') throw new Error('Store#query must receive {object} query argument, but it was undefined');
        await this.db;
        const statement = this.db.prepare(`SELECT * FROM cardSet WHERE setAbbr = (?)`);
        const result = statement.run(query.setAbbr);
        const cardSet = new CardSet(null, null, this, result);
        return cardSet;
    }

}

module.exports = Store;