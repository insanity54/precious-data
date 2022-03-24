const axios = require('axios');
const throttleRequests = require('./throttleRequests');


// override the adapter so nock can intercept during testing
// https://github.com/nock/nock#axios
axios.defaults.adapter = require('axios/lib/adapters/http')

const {
  version
} = require('./misc');

const {
  rootUrl
} = require('./constants');

const customHeaders = {
  'User-Agent': `precious-data/${version}`,
  'Cache-Control': 'no-cache'
};




const httpAgent = axios.create({
  method: 'get',
  baseURL: rootUrl,
  headers: customHeaders
});

throttleRequests(httpAgent, (1000 * 3));


module.exports = {
  httpAgent
}
