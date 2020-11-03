#!/usr/bin/env node

/**
 * assertSbtpSetlistParity.js
 *
 * Assert parity between https://wiki.sbtp.xyz/en/prememo/setlist and http://p-memories.com/card_product_list_page
 *
 * This is used to ensure that the English setlist on wiki.sbtp.xyz is up to date with official p-memories website
 */


let Ripper = require('../lib/ripper')
let axios = require('axios')
let Promise = require('bluebird')
let cheerio = require('cheerio')
let util = require('util')
let fsp = require('fs').promises
let spawn = require('child_process').spawn

let ripper = new Ripper()

const fetchSBTPSetlist = () => {
  let config = {
    responseType: 'text'
  }
  return axios
    .get('https://wiki.sbtp.xyz/en/prememo/setlist')
    .then((res) => {
      // remove everything before the table tag
      // this is done because cheerio is failing to parse the full html output of this page
      let table = res.data.substr(res.data.lastIndexOf('<table>'))
      // remove everything after the closing table tag
      table = table.substring(table, table.indexOf('</table>'))
      const $ = cheerio.load(table)
      let interest = $('tbody td:nth-child(1)').map(function () {
        return $(this).text()
      }).get()
      interest.sort()
      return interest
    })
}

const fetchPrememoSetlist = () => {
  return ripper.getSetNames()
    .then((names) => {
      return names.sort()
    })
}

const main = () => {
  return new Promise
    .all([fetchSBTPSetlist(), fetchPrememoSetlist()])
    .then(([sbtpList, officialList]) => {
      // console.log(sbtpList)
      // console.log(officialList)
      return new Promise.all([
        fsp.writeFile('/tmp/sbtpList.txt', sbtpList.join('\n'), { encoding: 'utf-8' }),
        fsp.writeFile('/tmp/officialList.txt', officialList.join('\n'), { encoding: 'utf-8' })
      ])
        .then(() => {
          const diff = spawn('/usr/bin/diff', ['--color', '/tmp/sbtpList.txt', '/tmp/officialList.txt'], { stdio: "inherit" })

          diff.on('close', (code) => {
            console.log('all done, bb')
            console.log(code)
          })
        })
    })
}




main()
