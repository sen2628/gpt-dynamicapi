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

// Conditional branching
const condDataTrue = { flag: true, nested: { foo: { bar: 1 } } };
const condResultTrue = executeTransformation(condDataTrue, {
  op: 'condition',
  config: {
    if: 'flag',
    then: [
      { op: 'unknown_op', onError: 'continue' },
      { op: 'flatten', target: 'nested', config: {} }
    ],
    else: [{ op: 'unflatten', target: 'nested', config: { overwrite: true } }]
  }
});
assert.deepStrictEqual(
  condResultTrue,
  { flag: true, nested: { 'foo.bar': 1 } },
  'then branch should flatten nested object and skip invalid step'
);

const condDataFalse = { flag: false, nested: { 'foo.bar': 1 } };
const condResultFalse = executeTransformation(condDataFalse, {
  op: 'condition',
  config: {
    if: 'flag',
    then: [{ op: 'flatten', target: 'nested', config: {} }],
    else: [{ op: 'unflatten', target: 'nested', config: { overwrite: true } }]
  }
});
assert.deepStrictEqual(
  condResultFalse,
  { flag: false, nested: { foo: { bar: 1 } } },
  'else branch should unflatten nested object'
);

console.log('All runtime tests passed');

