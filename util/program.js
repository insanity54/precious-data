const debug = require('debug')('precious-data');
const ripper = require('./ripper');
const commander = require('commander');
const program = new commander.Command();
const { version } = require('./misc');


program.version(version);


program.on('--help', function() {
  console.log('');
  console.log('Examples:');
  console.log('  $ ./p-data.js rip --url "http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on"');
  console.log('  $ ./p-data.js rip --url "http://p-memories.com/node/383031"');
  console.log('  $ ./p-data.js rip --set "MMDK" --number "P-012"');
  console.log('  $ ./p-data.js rip --set "HMK"');
  console.log('  $ ./p-data.js rip --all');
})

program
  .command('rip')
  .description('Rip card data and images')
  .option('-u, --url <url>', 'The URL to download card data from')
  .option('-a, --all', 'Download all card/images found on p-memories.com', false)
  .option('-i, --incremental', "Download only data/images which do not exist locally.", false)
  .option('-t, --throttle <seconds>', "Seconds to wait between requests. (A higher number is more polite.)", 5)
  .option('-s, --set <set>', "Set (abbreviation) to download")
  .option('-n, --number <number>', "Card number to download.")
  .option('-q, --quiet', "Hide command output", false)
  .action((options) => {
    debug(`url: ${options.url}`);
      return ripper.rip({
        url: options.url,
        all: options.all,
        incremental: options.incremental,
        throttle: options.throttle,
        set: options.set,
        number: options.number,
        quiet: options.quiet,
      })
      .then((res) => {
        console.log(res);
      })
    })

program
  .command('index')
  .description('Create an index of card set abbreviations. Used when ripping card sets by name.')
  .option('-t, --throttle <seconds>', "Seconds to wait between requests. (A higher number is more polite.)", 5)
  .action((options) => {
    return ripper.createSetAbbreviationIndex({
      throttle: options.throttle
    })
    .then(() => {
      console.log('index creation complete.')
    })
  })



module.exports = program;
