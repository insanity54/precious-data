const debug = require('debug')('precious-data');
const Ripper = require('../lib/ripper');


exports.command = 'index';
exports.describe = 'Create an index of card set abbreviations. Used when ripping card sets by name.';
exports.builder = {
  throttle: {
    alias: 't',
    description: 'Seconds to wait between requests. (A higher number is more polite.)'
  }
}
exports.handler = (options) => {
  let ripper = new Ripper({
    url: options.url,
    all: options.all,
    incremental: options.incremental,
    throttle: options.throttle,
    set: options.set,
    number: options.number,
    quiet: options.quiet,
  });
  return ripper.createSetAbbreviationIndex({
    throttle: options.throttle
  })
  .then(() => {
    console.log('index creation complete.')
  })
}
