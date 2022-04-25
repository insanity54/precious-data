'use strict';


var util = require('util');
const Store = require('../../lib/Store');
const PMemoriesCom = require('../../lib/PMemoriesCom');
const Parse = require('../../lib/Parse');
const Fetch = require('../../lib/Fetch');
const Game = require('../../lib/Game');
const path = require('path');
const fsp = require('fs').promises;
const debug = require('debug')('precious-data');
const sharp = require('sharp');


module.exports = {
  image: image
};


async function image(req, res) {
  const fetch = new Fetch();
  const parse = new Parse();
  const store = new Store();
  const pm = new PMemoriesCom(fetch, parse);
  const game = new Game(pm, fetch, parse, store);

  var number = req.query.number;
  var setAbbr = req.query.setAbbr;

  try {
    const cardData = {
      number,
      setAbbr
    }

    debug(`looking up card data ${cardData.number}, ${cardData.setAbbr}`)

    // We are responding with an image no matter what
    res.set('Content-Type', 'image/jpeg');


    const card = await game.findCard(cardData);

    console.log('  [q] teh card exists in the db')
    debug(card)

    const imageBlob = card.imageBlob;

    res.send(imageBlob);


  } catch (e) {
    console.error(e);

    // generate an image which communicates an error
    const errorImage = await sharp({
      create: {
        width: 372,
        height: 520,
        channels: 3,
        background: { r: 255, g: 0, b: 255, alpha: 1 },
      }
    })
    .jpeg({
      mozjpeg: true
    })
    .toBuffer();

    if (/not found/i.test(e)) {
      res.status(404);
    } else {
      res.status(500);
    }

    res.send(errorImage);
  }
  
}
