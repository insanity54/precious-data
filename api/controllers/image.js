'use strict';


var util = require('util');
const Store = require('../../lib/Store');
const path = require('path');
const fsp = require('fs').promises;
const debug = require('debug')('precious-data');
const sharp = require('sharp');

module.exports = {
  image: image
};


async function image(req, res) {
  var number = req.query.number;
  var setAbbr = req.query.setAbbr;

  const cardData = {
    number,
    setAbbr
  }

  debug(`looking up card data ${cardData.number}, ${cardData.setAbbr}`)

  // We are responding with an image no matter what
  res.set('Content-Type', 'image/jpeg');


  try {
    const card = await game.findCard(cardData);

    debug(card)

    const imageBlob = card.imageBlob;

    res.send(imageBlob);


  } catch (e) {

    // generate an image which communicates the error
    const errorImage = await sharp({
      create: {
        width: 372,
        height: 520,
        channels: 3,
        background: { r: 255, g: 0, b: 255, alpha: 1 },
      }
    })
    .withMetadata({
      /** @todo I dont think this metadata works. 
       *        When opening the image in GIMP
       *        and viewing EXIF metadata, I see no error.
       *        I think a better thing to do is
       *        create opposite-coloured text with the 
       *        error message atop the background
       */
      exif: {
        "preciousdata": {
          error: e.message 
        }
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
