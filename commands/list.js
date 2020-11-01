const debug = require('debug')('precious-data');
const Ripper = require('../lib/ripper');
const util = require('util')

exports.command = 'list';
exports.describe = 'Generate a list';
exports.builder = {
  type: {
    alias: 't',
    description: 'The type of list to generate',
    choices: ['setNames', 'setUrls']
  },
  json: {
    alias: 'j',
    description: 'Format the output as JSON'
  }
}
exports.handler = (options) => {
  let ripper = new Ripper();

  let list;
  if (options.type === 'setNames') {
    list = ripper.getSetNames()
  } else if (options.type === 'setUrls') {
    list = ripper.getSetUrls()
  }

  return list
    .then((list) => {
      if (options.json) {
        console.log(JSON.stringify(list))
      }
      else {
        console.log(list)
      }
    })
}
