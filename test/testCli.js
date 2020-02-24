const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');
const cliPath = path.join(__dirname, '..', 'util', 'program.js');
const cli = require(cliPath);
const Promise = require('bluebird');
const execFile = Promise.promisify(require('child_process').execFile);

describe('p-data.js CLI', function () {
  describe('index subcommand', function () {
    it('should write index.json to the data directory', function () {
      let program = cli.parse(['node', './p-data.js', 'index'])
      assert.isObject(program);
      assert.isDefined(program.index);
    });
  });
  describe('rip subcommand', function () {
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
  })
})
