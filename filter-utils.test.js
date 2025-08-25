const assert = require('assert');
const { parseWhereInput } = require('./filter-utils');

// Expression input
const expr = parseWhereInput('age > 30');
assert.deepStrictEqual(expr, { kind: 'expr', expr: 'age > 30' }, 'expression parsing');

// Predicate tree JSON
const jsonInput = '{"path":"age","op":"gt","value":21}';
const tree = parseWhereInput(jsonInput);
assert.deepStrictEqual(tree, {
  kind: 'tree',
  tree: { path: 'age', op: 'gt', value: 21 }
}, 'predicate JSON parsing');

// Invalid JSON
let errorCaught = false;
try {
  parseWhereInput('{invalid');
} catch (err) {
  errorCaught = true;
}
assert.ok(errorCaught, 'invalid JSON should throw');

console.log('filter-utils tests passed');
