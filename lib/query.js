/**
 * 
 * 
 * Query is a thing 
 * that finds data
 * that exists locally
 * in the db
 * 
 * 
 * 
 */



const { 
    parseCardId,
    parseQuery,
} = require('./parsers');

const R = require('ramda');

const EventEmitter = require('events');
const Ripper = require('./ripper');

const query = (q) => {
    if (typeof q === 'undefined') throw new Error('query must receive an argument, but it received undefined.');

    const { card, setAbbr } = parseQuery(q);
    if (typeof card === 'undefined') throw new Error('card inside the query object was undefined!');
    if (typeof setAbbr === 'undefined') throw new Error('setAbbr inside the query object was undefined!');


    const ripper = new Ripper();
    const events = new EventEmitter();


    // determine what to rip
    // like.. not a high level overview,
    // but an actual complete list of URLs
    // that we want to rip.
    // To determine this info, 
    // we will have to access the setAbbrIndex
    // or reach out to the network and build
    // a setAbbrIndex.


    const targetUrls = R.cond([
        [R.equals('*', R.__), R.always(ripper.ripSetData(R.__))],
        []
    ])(setAbbr);


    const results = new Promise((resolve, reject) => {
        // @todo rip the website
        
    })

    return {
        results,
        events
    }
}


module.exports = query