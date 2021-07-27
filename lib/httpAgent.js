const axios = require('axios');
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

module.exports = {
  httpAgent
}
