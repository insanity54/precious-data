const nock = require('nock');
const td = require('testdouble');

module.exports = {
  beforeAll: function () {
    require('testdouble-nock')(td, nock)
  },
  beforeEach: function () {
    td.reset.onNextReset(() => nock.cleanAll())
  },
  afterEach: function () {
    td.reset()
  }
}


// before(function () {

//   // we mock getSetUrls to only return 3 sets rather than all 100+ sets
//   // to keep network traffic to a minimum
//   // td.func(ripper.getSetUrls)
//   // td.replace('../data/setAbbrIndex.json', setUrlsFixture);
//   // td.when(ripper.getSetUrls()).thenResolve(setUrlsFixture)

//   td.when(Ripper.prototype.getSetUrls()).thenResolve(setUrlsFixture)

// })


// let ripper
// beforeEach(function () {
//   ripper = new Ripper();



//   // when(myTestDouble('foo')).thenReturn('bar')


//   // td.when(ripper.loadSetAbbrIndex()).thenResolve(setAbbrIndexFixture)
//   // td.when(ripper.getSetAbbrIndex()).thenResolve(setAbbrIndexFixture)
// })