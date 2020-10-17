const axios = require('axios');

const {
  version
} = require('./misc');
const rootUrl = 'http://p-memories.com';
const customHeaders = {
  'User-Agent': `precious-data/${version}`,
  'Cache-Control': 'no-cache'
};



const normalizeUrl = (url) => {
  if (typeof url === 'undefined') {
    return url
  } else {
    if (url.startsWith(rootUrl)) {
      return url;
    } else {
      return `${rootUrl}${url}`;
    }
  }
}

const httpAgent = axios.create({
  method: 'get',
  baseURL: rootUrl,
  headers: customHeaders
});

module.exports = {
  httpAgent,
  normalizeUrl
}
