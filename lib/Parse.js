
const debug = require('debug')('precious-data');
const Card = require('./Card');
const CardSet = require('./CardSet');
const cheerio = require('cheerio');
const { normalizeUrl, parseCardId } = require('./parsers');
const { productSetAbbrRegex } = require('./constants');
const PM = require('./PMemoriesCom.js');


class Parse {
    constructor (fetch, store) {
        this.fetch = fetch;
        this.store = store;
    }


    /**
     * getCards
     * 
     * finds any and all cards that exist in a given html document
     * or array of html documents
     * and returns them in an array of Card objects
     * 
     * @param {(String|Array<String>)} html   - html from a set page
     * @return {Array<Card>}
     */
    getCards (html) {
        if (typeof html === 'undefined') throw new Error('Parse#getCards requires html as parameter, but parameter was undefined.');
        if (typeof html !== 'object') html = [html];

        /**
         * handles parsing when the page is a cardset-- contains many cards
         */
        const cardSetPageHandler = (html, $, cards) => {
            const cardElements = $('tbody tr');
            debug(`there are ${cardElements.length} card elements`)
            for (const cardEl of cardElements) {
                const number = $(cardEl).find('td:nth-child(2) a').text();
                const image = normalizeUrl($(cardEl).find('a:nth-of-type(1)').attr('src'));
                debug(`image:${image}`)

                const {
                    num,
                    release,
                    id
                } = parseCardId(image);
                const setAbbr = (typeof image === 'undefined') ? null : productSetAbbrRegex.exec(image)[1];

                const card = new Card(this.fetch, this, this.store, {
                    rarity: $(cardEl).find('td:nth-child(1) span').text(),
                    url: normalizeUrl($(cardEl).find('td:nth-child(2) a').attr('href')),
                    image: image,
                    name: $(cardEl).find('td:nth-child(6) span').text(),
                    number: number,
                    cost: $(cardEl).find('td:nth-child(3) span').text(),
                    source: $(cardEl).find('td:nth-child(4) span').text(),
                    type: $(cardEl).find('td:nth-child(5) span').text(),
                    color: $(cardEl).find('td:nth-child(7) span').text(),
                    characteristic: $(cardEl).find('td:nth-child(8) span').text(),
                    ap: $(cardEl).find('td:nth-child(9) span').text(),
                    dp: $(cardEl).find('td:nth-child(10) span').text(),
                    text: $(cardEl).find('td:nth-child(11) span').text(),
                    setAbbr: setAbbr,
                    num: num,
                    release: release,
                    id: id
                });
                cards.push(card);
            }
        }

        /**
         * handles parsiing when the page is a card-- contains one card
         */
        const cardPageHandler = (html, $, cards) => {
            let data = {};

            /** Data gathered from the card data table on the webpage */
            data.number = $('.cardDetail > dl:nth-child(1) > dd:nth-child(2)').text();
            data.rarity = $('.cardDetail > dl:nth-child(2) > dd:nth-child(2)').text();
            data.setName = $('.cardDetail > dl:nth-child(3) > dd:nth-child(2)').text();
            data.name = $('.cardDetail > dl:nth-child(4) > dd:nth-child(2)').text();
            data.type = $('.cardDetail > dl:nth-child(5) > dd:nth-child(2)').text();
            data.cost = $('.cardDetail > dl:nth-child(6) > dd:nth-child(2)').text();
            data.source = $('.cardDetail > dl:nth-child(7) > dd:nth-child(2)').text();
            data.color = $('.cardDetail > dl:nth-child(8) > dd:nth-child(2)').text();
            data.characteristic = $('.cardDetail > dl:nth-child(9) > dd:nth-child(2)').text();
            data.ap = $('.cardDetail > dl:nth-child(10) > dd:nth-child(2)').text();
            data.dp = $('.cardDetail > dl:nth-child(11) > dd:nth-child(2)').text();
            data.parallel = $('.cardDetail > dl:nth-child(12) > dd:nth-child(2)').text();
            data.text = $('.cardDetail > dl:nth-child(13) > dd:nth-child(2)').text();
            data.flavor = $('.cardDetail > dl:nth-child(14) > dd:nth-child(2)').text();

            /** Data that I think is good which isn't explicitly in the page */
            data.image = normalizeUrl($('.Images_card > img:nth-child(1)').attr('src'))
            data.url = `http://p-memories.com/node/${$('body').attr('id').split('-').pop()}`;

            data.setAbbr = (typeof data.image === 'undefined') ? null : productSetAbbrRegex.exec(data.image)[1];
            let {
                num,
                release,
                id
            } = parseCardId(data.image);
            data.num = num;
            data.release = release;
            data.id = id;

            const card = new Card(this.fetch, this, this.store, data)
            cards.push(card);
        }


        let cards = [];

        for (const h of html) {
            const $ = cheerio.load(h);

            // detect cardSet page or card page
            const cardDetail = $('.cardDetail');

            if (cardDetail.length) cardPageHandler.call(this, html, $, cards);
            else cardSetPageHandler.call(this, html, $, cards);
        }

        return cards;
    }


    /**
     * getCardSets
     * 
     * Find any and all set data from a given html document or documents.
     * probably only suitable for running against /card_product_list_page
     * 
     * Set data consists of 
     *   - setUrl
     *   - setAbbr
     *   - setName
     *   - sampleCardUrl (maybe?)
     * 
     * @param {(String|Array<String>)} html   - html document or documents
     * @return {Array<CardSet>}
     */
    getCardSets (html) {
        if (typeof html === 'undefined') throw new Error('Parse#getCardSets requires html as parameter, but parameter was undefined.');
        if (typeof html !== 'object') html = [html];

        const getCardSetsFromPage = (h) => {
            const $ = cheerio.load(h);
            let products = [];
            let uls = $('ul.productlist a');
            for (const el of uls) {
                let setUrl = normalizeUrl($(el).attr('href'));
                let setName = $(el).text();
                // let setAbbr = await that.getSetAbbrFromSetUrl(setUrl); // requires an HTTP request which is out of scope of Parse lib
                products.push({
                    setUrl: setUrl,
                    setName: setName,
                    // setAbbr: setAbbr
                });
            }
            return products;
        }

        let sets = [];
        for (const h of html) {
            const setsOnPage = getCardSetsFromPage(h);
            for (const s of setsOnPage) {
                sets.push(new CardSet(this.fetch, this, this.store, s));
            }
        }
        return sets;
    }


    /**
     * getCardSetUrls
     * 
     * Gets the page URLs of all the card set pages found in the html
     * This info is found using the numbered pager at the bottom of a card set page
     * 
     * This method is useful for passing onto fetch.fetchBodies
     * In order to rip every card in a set
     * 
     * @param {String} html
     * @return {Array<String>} urls
     */
    getCardSetUrls (html) {
        if (typeof html === 'undefined') throw new Error('Parse#getCardSetUrls requires html as parameter, but parameter was undefined.');
        if (typeof html !== 'object') html = [html];

        let pages = [];
        for (const h of html) {
            const $ = cheerio.load(h);
            const pager = $('ul.pager > li > a');
            for (const page of pager) {
                const pUrl = $(page).attr('href');
                const pText = $(page).text();
                if (/\d/.test(pText)) pages.push(normalizeUrl(pUrl));
            }
        }
        return pages;
    }


    /**
     * getCardSetAbbr
     * 
     * gets the set abbreviation
     * 
     * accepts html of a card page because we derive setAbbr from card image paths
     * 
     * @param {String} html
     * @return {String} setAbbr
     * 
     */ 
    getCardSetAbbr (html) {
        const $ = cheerio.load(html);
        const imageUrlRaw = $('.mainMiddle_in > table:nth-child(4) > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(2) > span:nth-child(1) > a:nth-child(1)').attr('src');
        const imageUrl = normalizeUrl(imageUrlRaw);
        const setAbbr = (typeof imageUrl === 'undefined') ? null : productSetAbbrRegex.exec(imageUrl)[1];
        return setAbbr;
    }



    /**
     * getCardFromSearchResults
     * 
     * Given html from the product search, gets a matching Card
     * 
     * @param {Card} card    - the card we want to find
     * @param {String} html
     * @return {Card}        - the card (same as input param) which has been updated with data from the website
     * 
     */
    getCardFromSearchResults (card, html) {
        const $ = cheerio.load(html);
        const rows = $('tbody tr');
        let matchingRow;
        for (const row of rows) {
            const imageSrc = $(row).find('td:nth-of-type(2) > span > a').attr('src');
            const officialSetAbbr = productSetAbbrRegex.exec(imageSrc)[1];
            const niceSetAbbr = PM.getNiceSetAbbr(officialSetAbbr);
            if (
                officialSetAbbr === card.setAbbr ||
                niceSetAbbr === card.setAbbr
            ) matchingRow = row;
        }

        if (typeof matchingRow === 'undefined') throw new Error('No matching card was found.');


        const number = $(matchingRow).find('td:nth-child(2) a').text();
        const image = normalizeUrl($(matchingRow).find('a:nth-of-type(1)').attr('src'));
        const {
            num,
            release,
            id
        } = parseCardId(image);
        const setAbbr = (typeof image === 'undefined') ? null : productSetAbbrRegex.exec(image)[1];
        const foundCard = new Card(this.fetch, this, this.store, {
            rarity: $(matchingRow).find('td:nth-child(1) span').text(),
            url: normalizeUrl($(matchingRow).find('td:nth-child(2) a').attr('href')),
            image: image,
            name: $(matchingRow).find('td:nth-child(6) span').text(),
            number: number,
            cost: $(matchingRow).find('td:nth-child(3) span').text(),
            source: $(matchingRow).find('td:nth-child(4) span').text(),
            type: $(matchingRow).find('td:nth-child(5) span').text(),
            color: $(matchingRow).find('td:nth-child(7) span').text(),
            characteristic: $(matchingRow).find('td:nth-child(8) span').text(),
            ap: $(matchingRow).find('td:nth-child(9) span').text(),
            dp: $(matchingRow).find('td:nth-child(10) span').text(),
            text: $(matchingRow).find('td:nth-child(11) span').text(),
            setAbbr: setAbbr,
            num: num,
            release: release,
            id: id
        });

        card.mergeProperties(foundCard)
        return card;
    }

}

module.exports = Parse;