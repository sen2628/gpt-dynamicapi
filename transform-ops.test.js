const assert = require('assert');
const { normalizeTransformations } = require('./transform-ops');

const steps = normalizeTransformations([
  { op: 'flatten', target: 'a', config: {} },
  { op: 'unflatten', target: 'b', config: { delimiter: '.' } },
]);

assert.deepStrictEqual(steps, [
  { op: 'unflatten', target: 'b', config: { delimiter: '.' }, onError: 'continue' }
], 'should default onError and skip empty configs');

console.log('transform ops tests passed');
