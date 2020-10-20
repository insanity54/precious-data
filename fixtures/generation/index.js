const axios = require('axios')
const nockBack = require('nock').back
const path = require('path')
const Promise = require('bluebird')
nockBack.setMode('record')

nockBack.fixtures = path.join(__dirname, '..')

let fixtureResources = [
  {
    url: 'http://p-memories.com/images/product/HMK/HMK_01-001.jpg',
    fixturePath: 'HMK_01-001.jpg.json'
  },
  {
    url: 'http://p-memories.com/node/383031',
    fixturePath: 'HMK_01-001.html.json'
  },
  {
    url: 'http://p-memories.com/node/932341',
    fixturePath: 'GPFN_01-030a.html.json'
  },
  {
    url: 'http://p-memories.com/node/926791',
    fixturePath: 'SSSS_01-001.html.json'
  },
  {
    url: 'http://p-memories.com/card_product_list_page?field_title_nid=919863-SSSS.GRIDMAN&s_flg=on',
    fixturePath: 'SSSS.html.json'
  }
]

let getFixture = (data) => {
  console.log(`getting ${data.url} and saving it to ${data.fixturePath}`)
  return nockBack(data.fixturePath).then(({ nockDone }) => {
    return axios.get(data.url).then(nockDone)
  })
}

Promise.mapSeries(fixtureResources, getFixture)
  .then(() => {
    console.log('Fixture generation complete.')
  })
