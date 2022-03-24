const test = require('ava');
const Ripper = require('../lib/ripper.js');

test('buildSetAbbrIndex', async (t) => {
    const ripper = new Ripper();
    await ripper.createSetAbbreviationIndex();
});