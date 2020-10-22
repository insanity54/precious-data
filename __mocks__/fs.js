
const fs = jest.createMockFromModule('fs')
const fsa = jest.requireActual('fs')
const Promise = require('bluebird')
const path = require('path')

// greetz https://jestjs.io/docs/en/manual-mocks#examples

let mockFiles = Object.create(null);

function __setMockFiles(newMockFiles) {
  mockFiles = Object.create(null);
  for (const file in newMockFiles) {
    const content = newMockFiles[file]

    if (!mockFiles[file]) {
      mockFiles[file] = content;
    }

  }
}

function readFile (filePath, opts) {
  return new Promise((resolve, reject) => {
    (mockFiles[filePath]) ? resolve(mockFiles[filePath]) : reject(new Error('ENOENT'))
  })
}

const mocks = {
  __setMockFiles: __setMockFiles,
  createWriteStream: () => {
    return fsa.createWriteStream('/dev/null')
  },
  writeFile: (file, data, cb) => { return cb(null) },
  promises: {
    mkdir: (path, opts) => { return new Promise.resolve() },
    readFile: readFile,
    writeFile: (file, data) => { return new Promise.resolve() }
  }
}


// extend mocked fs with my custom mocks
for (const m in mocks) {
  fs[m] = mocks[m]
}





module.exports = fs
