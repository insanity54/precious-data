const setData = require('./setData.js');

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
        const setAbbr = card.setAbbr;
        const number = card.number;
        const url = `http://p-memories.com/card_product_list_page?s_flg=on&field_title_nid=&field_type_value=&product_title=${number}&field_color_value=&keyword_card=&button=%E6%A4%9C+%E7%B4%A2`;
        const bodies = await this.fetch.fetchBodies(url);
        const foundCard = this.parse.getCardFromSearchResults(card, bodies[0]);
        return foundCard;
    }


    /**
     * jenkifySetAbbr
     * 
     * There are some set abbreviations on p-memories.com that are inconsistently named.
     * For example, K-ON release #1 is abbreviated PM_K-ON, but release #1 is simply KON2.
     * This method will convert nice abbreviations to p-memories jenk abbreviations.
     * This allows storing consistent setAbbreviations in precious-data
     * 
     * @param {String} niceSetAbbr
     * @return {String} jenkSetAbbr
     */ 
    static getJenkSetAbbr (niceSetAbbr) {
        if (typeof niceSetAbbr === 'undefined') throw new Error('getJenkSetAbbr requires a {String} niceSetAbbr param but it was undefined.');
        const matchingSet = setData.filter((d) => d.setAbbr === niceSetAbbr);
        return (matchingSet?.setAbbrJenk) ? matchingSet.setAbbrJenk[0] : niceSetAbbr;
    }


    /**
     * Some prememo sents have JENK set abbreviations, so we replace
     * those jenk abbreviations with a nice abbrevation.
     * 
     * example: 'PM_BKM' is JENK, so we rename it to, 'BKM'
     * 
     * @param {String} jenkSetAbbr
     * @return {String} niceSetAbbr
     */
    static getNiceSetAbbr (jenkSetAbbr) {
        for (const set of setData) {
            if (typeof set.setAbbrJenk !== 'undefined') {
                if (set.setAbbrJenk.includes(jenkSetAbbr)) {
                    return set.setAbbr;
                }
            }
        }
        return jenkSetAbbr;
    }

}

module.exports = PMemoriesCom;