const axios = require('axios')
const nockBack = require('nock').back
const path = require('path')
nockBack.setMode('record')

nockBack.fixtures = path.join(__dirname, '..', 'fixtures')

nockBack('GPFN_01-030a.html.json', nockDone => {
  axios
    .get('http://p-memories.com/node/932341')
    .then((res) => {
      nockDone()
    })
})

nockBack('SSSS_01-001.html.json', nockDone => {
  axios
    .get('http://p-memories.com/node/926791')
    .then((res) => {
      nockDone()
    })
})
