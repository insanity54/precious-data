const path = require('path');
const query = require('../lib/query');
const EventEmitter = require('events');
const { setupRecorder } = require('nock-record');

const record = setupRecorder();


describe('query', () => {
  jest.setTimeout(30000);
  it('should return a {Promise} results and an {EventEmitter} events', async () => {
    const { completeRecording, assertScopesFinished } = await record("query1");
    const { results, events } = query('HMK_01-001');
    expect(results).toBeInstanceOf(Promise);
    expect(events).toBeInstanceOf(EventEmitter);
    await results;
    completeRecording();
    assertScopesFinished();
  })
  it('should accept a set name as its only parameter', async () => {
    expect(() => query('ClariS')).not.toThrow();
  })
  it('should throw if not receiving an argument', () => {
    expect(() => query()).toThrow();
  })
  it('should accept a wildcard as input', async () => {
    const { completeRecording, assertScopesFinished } = await record("query2");
    const { results, events } = query('*');
    await results
    completeRecording();
    assertScopesFinished();
  })
  it('should expose properties for monitoring query progress', async () => {
    const { completeRecording, assertScopesFinished } = await record("query3");
    const { results, events } = query('HMK');
    const cards = await results;
    completeRecording();
    assertScopesFinished();
    expect(cards.length).toBeGreaterThan(0);
  })
  it('should respond with {POJO} card data as a result of a query', async () => {
    const { completeRecording, assertScopesFinished } = await record("query4");
    const { results } = query('HMK_01-001');
    const { cardData } = await results;
    expect(cardData).toHaveProperty('ap', '40');
    expect(cardData).toHaveProperty('name', '初音 ミク');
    expect(cardData).toHaveProperty('rarity', 'SR');
    expect(cardData).toHaveProperty('image', 'http://p-memories.com/images/product/HMK/HMK_01-001.jpg');
  })
})
