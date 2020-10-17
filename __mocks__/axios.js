
const fs = require('fs')
const fsp = fs.promises
const path = require('path')
const Promise = require('bluebird')
jest.unmock('fs')

const mockedHttpAgent = {
  request: (opts) => {
    if (opts.url !== 'undefined') {
      if (opts.url.includes('/card_product_list_page')) {
        return fsp.readFile(path.join(__dirname, '..', 'fixtures', 'card_product_list_page.html'))
          .then((data) => {
            return {
              data: data
            }
          })
      } else if (opts.url.includes('.jpg')) {
        if (opts.responseType === 'stream') {
          return new Promise.resolve({
            data: fs.createReadStream(path.join(__dirname, '..', 'fixtures', 'test-image.jpg'))
          })
        } else {
          throw new Error('httpAgent Mock doesnt know how to handle this request')
        }
      } else {
        return fsp.readFile(path.join(__dirname, '..', 'fixtures', '01-001.html'))
          .then((data) => {
              return {
                data: data
              }
          })
      }
    }
  }
}


const axios = {
  create: (opts) => {
    return mockedHttpAgent
  }
}

module.exports = axios
