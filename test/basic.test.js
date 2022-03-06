const nock = require('nock');
const td = require('testdouble');
const request = require('request');

module.exports = {
  'should support verify': (done) => {
    const api = td.api('https://example.com')

    request('https://example.com/api', () => {
      td.verify(api.get('/api'))
      done()
    })

    
  }
}