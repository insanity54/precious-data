


const cliProgress = require('cli-progress');
const Game = require('./Game.js');
const PMemoriesCom = require('./PMemoriesCom.js');
const Parse = require('./Parse.js');
const Fetch = require('./Fetch.js');
const Store = require('./Store.js');


(async () => {
    const pm = new PMemoriesCom();
    const store = new Store();
    const fetch = new Fetch();
    const parse = new Parse(fetch, store);
    const game = new Game(pm, fetch, parse, store);


    // create a new progress bar instance and use shades_classic theme
    const progressBar = new cliProgress.SingleBar({
        clearOnComplete: false,
        hideCursor: false,
        forceRedraw: true,
        format: '[{bar}] {title} | {percentage}% | ETA: {eta}s | {value}/{total}'
    }, cliProgress.Presets.shades_classic);


    game.ee.on('start', (info) => {
        progressBar.start(info.total, 0, { title: info.title });
    })

    game.ee.on('progress', (info) => {
        progressBar.update(info.count, { title: info.title });
    })


    await game.ripAllCardSets();
    progressBar.stop();

})();

