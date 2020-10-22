// @TODO I can't use the following createMockFromModule with fs.promises
//       because the esm loader doesn't expose the experimental fs Promise API. So
//       Instead, I would like to mock the specific function that loadSetAbbrIndex needs,
//       rather than automocking the entire fs module.
//       see https://jestjs.io/docs/en/jest-object#jestmockmodulename-factory-options
//
//       OR, we *do* automock the entire fs module, but we define the promise interface ourself,
//       just like we did in an earlier commit of this file.
//       https://github.com/insanity54/precious-data/blob/679d3e759ca2558663444c32a238b76871bd00a6/__mocks__/fs.js
//       yeah. I think we were on the right track in that commit. Just merge the __setMockFiles function below and we'll be golden
//
const fs = jest.createMockFromModule('fs')
const Promise = require('bluebird')
console.log(fs)

// greetz https://jestjs.io/docs/en/manual-mocks#examples

let mockFiles = Object.create(null);

function __setMockFiles(newMockFiles) {
  mockFiles = Object.create(null);
  for (const file in newMockFiles) {
    const dir = path.dirname(file);

    if (!mockFiles[dir]) {
      mockFiles[dir] = [];
    }
    mockFiles[dir].push(path.basename(file));
  }
}

function readFile (filePath, opts) {
  return new Promise((resolve, reject) => {
    resolve(mockFiles[filePath] || [])
  })
}

fs.__setMockFiles = __setMockFiles
fs.readFile = readFile


module.exports = fs
