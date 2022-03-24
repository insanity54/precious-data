var { expect } = require('chai');
var request = require('supertest');
var app = require('../../../app');
var crypto = require('crypto');
const debug = require('debug')('precious-data');
const test = require('ava')

function md5(string) {
    return crypto.createHash('md5').update(string).digest('hex');
}

test('should return an image', async (t) => {
  return request(app)
    .get('/image')
    .query({ num: '001', set: 'HMK', release: '01' })
    .set('Accept', 'image/jpeg')
    .expect('Content-Type', /jpeg/)
    .expect(200)
    .then((res) => {
      const correctHash = '59d6b7d3589895cdbd32816d302373e0';
      const actualHash = md5(res.body);
      expect(actualHash).to.be(correctHash);
    });
})
