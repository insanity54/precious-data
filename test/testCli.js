const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');
const cliPath = path.join(__dirname, '..', 'p-data.js');
const Promise = require('bluebird');


describe('p-data.js CLI', function () {
  describe('index subcommand', function () {
    it('should write index.json to the data directory', function () {
      let program = cli.parse(['node', './p-data.js', 'index'])
      assert.isObject(program);
      assert.isDefined(program.index);
    });
  });
  describe('rip subcommand', function () {
    it('should make a Set suggestion if the Set abbreviation doesnt have an exact match', () => {
      console.log('WE OUT HERE')
      const parser = require('yargs')().command(require('../commands/rip'))
      return new Promise((resolve, reject) => {
        parser.parse('rip -s OREIMO', (err, argv, output) => {
          if (err) reject(err)
          resolve(output)
        })
      }).then((output) => {
        assert.match(output, /Did you mean/, 'the thingy did not make a suggestion')
      })

    })
    it('should rip a card given a URL to the card', function () {
      return execFile(cliPath, ['node', './p-data.js', 'rip', '-u', 'http://p-memories.com/node/906300'])
        .then((res) => {
          assert.isString(res);
          assert.match(res, /涼風 青葉/)
        })
    })
    it('should rip a card given the set abbreviation and card number', function () {
      return execFile(cliPath, ['node', './p-data.js', 'rip', '-s', 'SG', '-n', '01-019'])
        .then((res) => {
          assert.isString(res);
          assert.match(res, /岡部 倫太郎/);
        })
    })
    it('should rip an entire set given the set abbreviation', function () {
      let program = cli.parse(['node', './p-data.js', 'rip', '--set', 'MMDK']);
      assert.isDefined(program);
      assert.equal(program.set, 'MMDK');

        // .then((res) => {
        //   assert.isString(res);
        //   assert.match(res, /劇場版 魔法少女まどか☆マギカ/);
        //   const
        // })
    })
    xit('should have silent output when called with -q flag', function () {

    })

    it('should rip all incrementally with a throttle', function () {
      let program = cli.parse(['node', './p-data.js', 'rip', '-a', '-i', '-t', '3']);
      assert.isDefined(program);
      console.log(program);
    })
  })
})
