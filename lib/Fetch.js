const { httpAgent } = require('./httpAgent');
const throttleRequests = require('./throttleRequests');
const debug = require('debug')('precious-data');
const { pipeline } = require('stream/promises');

class Fetch {
    constructor() {
       
    }


    /**
     * fetchBodies
     * 
     * @param {(String|Array<String>)} url - url or list of urls to fetch
     * @return {Promise}
     * @resolve {String}               html - html document body
     */
    async fetchBodies (url) {
        debug(`fetching bodies ${url}`)
        if (typeof url === 'undefined') throw new Error('Fetch#fetchBodies requires a url as first param, but it was undefined');
        if (typeof url !== 'object') url = [url];

        let bodies = [];

        for (const u of url) {
            const response = await httpAgent.request({
                url: u
            });
            bodies.push(response.data);
        }

        return bodies;
    }

    
    /**
     * fetchBuffer
     * 
     * @param {String} url
     * @param {Number} tries - used for recursive retries
     * @return {Promise}
     * @resolve {Buffer}
     */
    async fetchBuffer (url, tries) {
        debug(`fetching ${url} tries:${tries}`)
        if (typeof tries === 'undefined') tries = 0;
        if (tries > 5) throw new Error(`Fetch#fetchBuffer failed after ${tries} tries`);
        if (typeof url === 'undefined') throw new Error('Fetch#fetchBuffer requires a url as first param, but it was undefined');
        try {
            const res = await httpAgent.request({
              url: url,
              responseType: 'arraybuffer'
            });
            return res.data;
        } catch (e) {
            console.error(`problem during Fetch#fetchBuffer ${e}`);
            return this.fetchBuffer(url, tries++);
        }
    }
}


module.exports = Fetch;