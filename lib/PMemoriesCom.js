const setData = require('./setData.json');

class PMemoriesCom {
    constructor(fetch, parse) {
        this.setsPage = '/card_product_list_page';
        this.fetch = fetch;
        this.parse = parse;
    }

    /**
     * getCardSetUrls
     * 
     * Get all the URLs to the p-memories.com pages displaying cards
     * contained within a set
     * 
     * @param {String} setAbbr        - the abbreviated set name
     * @return {Promise}
     * @resolve {Array<String>} pages - array of page urls
     */
    getCardSetUrls(setAbbr) {
        
    }


    /**
     * search
     * 
     * Use the website search to find a card
     * 
     * ex: http://p-memories.com/card_product_list_page?s_flg=on&field_title_nid=&field_type_value=&product_title=001&field_color_value=&keyword_card=&button=%E6%A4%9C+%E7%B4%A2
     * 
     * @param {Card}
     * @return {Promise}
     * @resolve {Card}
     */
    async search(card) {
        console.log(`  [3] searching for the card ${card.setAbbr} ${card.number}`);
        const setAbbr = card.setAbbr;
        const number = card.number;
        const url = `http://p-memories.com/card_product_list_page?s_flg=on&field_title_nid=&field_type_value=&product_title=${number}&field_color_value=&keyword_card=&button=%E6%A4%9C+%E7%B4%A2`;
        const bodies = await this.fetch.fetchBodies(url);
        const foundCard = this.parse.getCardFromSearchResults(card, bodies[0]);
        return foundCard;
    }



    static getSetAbbrVarieties (setAbbr) {
        const match = setData.find((d) => d.setAbbrVarieties.includes(setAbbr))
        if (!match) return [];
        else {
            return match.setAbbrVarieties;
        }
    }

}

module.exports = PMemoriesCom;