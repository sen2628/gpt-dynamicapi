const assert = require('assert');
const { executeTransformation, unflatten, runSteps } = require('./transformRuntime');

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

// Rename fields with nested paths
const renameData = { current: { temp_c: 25, humidity: 80 } };
const renameResult = executeTransformation(renameData, {
  op: 'rename_fields',
  target: '',
  config: { mappings: [{ from: 'current.temp_c', to: 'temperature' }] }
});
assert.deepStrictEqual(
  renameResult,
  { current: { humidity: 80 }, temperature: 25 },
  'rename_fields should move nested field to root'
);

// Select fields with nested paths
const selectData = { a: 1, b: 2, c: { d: 3, e: 4 } };
const selectResult = executeTransformation(selectData, {
  op: 'select_fields',
  target: '',
  config: { fields: ['a', 'c.d'] }
});
assert.deepStrictEqual(
  selectResult,
  { a: 1, c: { d: 3 } },
  'select_fields should pick specified fields only'
);

// Compute new field using expression
const computeData = { temperature: 35 };
const computeResult = executeTransformation(computeData, {
  op: 'compute_field',
  target: '',
  config: { field: 'isHot', expression: 'temperature > 30' }
});
assert.deepStrictEqual(
  computeResult,
  { temperature: 35, isHot: true },
  'compute_field should add computed field'
);

// Take first N elements from array
const arrayData = { forecast: { forecastday: [1, 2, 3, 4] } };
const arrayResult = executeTransformation(arrayData, {
  op: 'array_take',
  target: 'forecast.forecastday',
  config: { count: 2 }
});
assert.deepStrictEqual(
  arrayResult,
  { forecast: { forecastday: [1, 2] } },
  'array_take should limit array length'
);

// Combined runSteps test
const combinedData = {
  current: { temp_c: 35, humidity: 50 },
  forecast: { forecastday: [1, 2, 3, 4] }
};
const combinedResult = runSteps(combinedData, [
  { op: 'rename_fields', target: '', config: { mappings: [{ from: 'current.temp_c', to: 'temperature' }] } },
  { op: 'compute_field', target: '', config: { field: 'isHot', expression: 'temperature > 30' } },
  { op: 'array_take', target: 'forecast.forecastday', config: { count: 2 } },
  { op: 'select_fields', target: '', config: { fields: ['temperature', 'isHot', 'current.humidity', 'forecast.forecastday'] } }
]);
assert.deepStrictEqual(
  combinedResult,
  {
    temperature: 35,
    isHot: true,
    current: { humidity: 50 },
    forecast: { forecastday: [1, 2] }
  },
  'runSteps should apply sequence of transformations'
);

console.log('All runtime tests passed');

