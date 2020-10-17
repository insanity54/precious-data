jest.unmock('fs')

const Promise = require('bluebird')
const fs = require('fs')

const mockedFs = {
  createWriteStream: () => {
    return fs.createWriteStream('/dev/null')
  },
  writeFile: (file, data, cb) => { return cb(null) },
  promises: {
    mkdir: (path, opts) => { return new Promise.resolve() },
    writeFile: (file, data) => { return new Promise.resolve() }
  }
}


module.exports = mockedFs
