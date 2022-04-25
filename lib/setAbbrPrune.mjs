/**
 * 
 * 
 * 
 * {
        setName: 'けいおん！！',
        setAbbr: 'KON3',
        setAbbrJenk: ['K_ON2'],
        setNameEn: 'K-ON!!',
        releaseDate: '2012-05-28'
    }

*/



import setData from './setData.js';
import fs from 'fs';

let neuSetData = [];
for (const d of setData) {
    
    let neuDatum = {}

    neuDatum.setAbbr = []
    if (typeof d.setAbbrJenk !== 'undefined') {
        neuDatum.setAbbr = neuDatum.setAbbr.concat(d.setAbbrJenk)
    } else {
        neuDatum.setAbbr.push(d.setAbbr)
    }

    neuDatum.setName = d.setName
    neuDatum.setNameEn = d.setNameEn
    neuDatum.releaseDate = d.releaseDate

    neuSetData.push(neuDatum)
}



console.log(neuSetData)
fs.writeFileSync('./setDataNeu.js', JSON.stringify(neuSetData, 0, 2), { encoding: 'utf-8' })