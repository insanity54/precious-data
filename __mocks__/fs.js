
const fs = jest.createMockFromModule('fs')
const fsa = jest.requireActual('fs')
const Promise = require('bluebird')
const path = require('path')

// greetz https://jestjs.io/docs/en/manual-mocks#examples

let mockFiles = Object.create(null);
let pseudoDisk = {}

/**
 * __setMockFiles
 * create a mock filesystem
 *
 * @param {object} newMockFiles - mock filesystem in the shape of
 *                                [
                                    { fileName: fileContents }
                                  ]
 *
 * @example
   [
     { '/home/example/taco.txt': 'I am a taco!!1' }
   ]
 */
function __setMockFiles(newMockFiles) {
  mockFiles = Object.create(null);
  for (const file in newMockFiles) {
    const content = newMockFiles[file]

    if (!mockFiles[file]) {
      mockFiles[file] = content;
    }

  }
}


/**
 * __getWrittenFiles
 * get a list of files which have been written to.
 *
 * @returns {Array} files
 * @returns file.name
 * @returns file.content
 */
function __getWrittenFiles() {
  return pseudoDisk
}

function readFile (filePath, opts) {
  return new Promise((resolve, reject) => {
    (mockFiles[filePath]) ? resolve(mockFiles[filePath]) : reject(new Error('ENOENT'))
  })
}

const mocks = {
  __setMockFiles: __setMockFiles,
  __getWrittenFiles: __getWrittenFiles,
  createWriteStream: () => {
    return fsa.createWriteStream('/dev/null')
  },
  writeFile: (file, data, cb) => {
    pseudoDisk[file] = data
    return cb(null)
  },
  writeFileSync: (file, opts) => {
    // workaround for nockBack to access real fs
    // and be able to write fixtures
    // while rest of test is using mocked fs
    let fixturePath = path.join(__dirname, '..', 'fixtures')
    if (file.startsWith(fixturePath)) {
      return fsa.writeFileSync(file, opts)
    }
  },
  promises: {
    mkdir: (path, opts) => { return new Promise.resolve() },
    readFile: readFile,
    writeFile: (file, data) => {
      pseudoDisk[file] = data
      return new Promise.resolve()
    }
  }
}


// extend mocked fs with my custom mocks
for (const m in mocks) {
  fs[m] = mocks[m]
}





module.exports = fs
