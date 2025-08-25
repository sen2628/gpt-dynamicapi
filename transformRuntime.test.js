const assert = require('assert');
const { executeTransformation, unflatten } = require('./transformRuntime');

// Round-trip flatten -> unflatten
const original = {
  user: { name: 'Alice', address: { city: 'LA' } },
  tags: ['a', 'b']
};

const flattened = executeTransformation(original, {
  op: 'flatten',
  target: '',
  config: { delimiter: '.', depth: 0, preserveArrays: true }
});

const roundTrip = executeTransformation(flattened, {
  op: 'unflatten',
  target: '',
  config: { delimiter: '.', overwrite: true }
});

assert.deepStrictEqual(roundTrip, original, 'round-trip flatten/unflatten');

// Conflict handling with overwrite
const flatInput = { a: 1, 'a.b': 2 };
const noOverwrite = unflatten(flatInput, { delimiter: '.', overwrite: false });
assert.deepStrictEqual(noOverwrite, { a: 1 }, 'no overwrite should keep existing value');

const yesOverwrite = unflatten(flatInput, { delimiter: '.', overwrite: true });
assert.deepStrictEqual(yesOverwrite, { a: { b: 2 } }, 'overwrite should replace value');

console.log('All runtime tests passed');

