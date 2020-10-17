#!/usr/bin/env node

const yargs = require('yargs/yargs')
const { version } = require('./lib/misc');

let program = yargs(process.argv.slice(2))



program
  .usage('Usage: $0 <cmd> [options]')
  .epilogue('Looking for prememo cards, or card translations? Check out https://sbtp.xyz/')
  .commandDir('./commands')
  .version('version', version).alias('version', 'V')
  .help('help')
  .demandCommand(1)
  .example('p-data.js rip --url "http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on"')
  .example('p-data.js rip --url "http://p-memories.com/node/383031"')
  .example('p-data.js rip --set "MMDK" --number "P-012"')
  .example('p-data.js rip --set "HMK"')
  .example('p-data.js rip --all')
  .showHelpOnFail('Experiencing an issue? Report bugs at https://github.com/insanity54/precious-data/issues')
  .wrap(null)
  .argv
