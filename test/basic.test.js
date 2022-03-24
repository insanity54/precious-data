const test = require('ava');
const { setupRecorder } = require('nock-record');


test.beforeEach((t) => {
    t.context.record = setupRecorder();
})

test('basic', (t) => {
  t.context.record('basic');
  const idk = true;
  t.true(idk);
});
