const td = require('testdouble');

module.exports = {
  beforeAll: function () {
    
  },
  afterEach: function () {
    td.reset()
  }
}
