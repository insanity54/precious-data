const debug = require('debug')('precious-data');
const Ripper = require('../lib/ripper');


exports.command = 'rip'
exports.describe = 'Rip card data and images'
exports.builder = {
  url: {
    alias: 'u',
    type: 'string',
    description: 'The URL to download card data from'
  },
  all: {
    alias: 'a',
    type: 'boolean',
    description: 'Download all card/images found on p-memories.com',
    default: false
  },
  incremental: {
    alias: 'i',
    type: 'boolean',
    description: 'Download only data/images which do not exist locally',
    default: false
  },
  throttle: {
    alias: 't',
    description: 'Seconds to wait between requests. (A higher number is more polite',
    type: 'number',
    default: 5
  },
  set: {
    alias: 's',
    description: 'Set (abbreviation) to download',
    type: 'string'
  },
  number: {
    alias: 'n',
    description: 'Card number to download',
    type: 'string'
  },
  quiet: {
    alias: 'q',
    description: 'Hide command output',
    type: 'boolean',
    default: false
  }
}
exports.handler = (options) => {
  debug(options)
  debug(`url: ${options.url}`);
  let ripper = new Ripper({
    url: options.url,
    all: options.all,
    incremental: options.incremental,
    throttle: options.throttle,
    set: options.set,
    number: options.number,
    quiet: options.quiet,
  });
  return ripper.rip()
  .then((res) => {
    console.log(res);
  })
}
