const assert = require('assert');
const { persistConfig, exportConfig } = require('./validation');

const schema = {
  'user': { type: 'object' },
  'user.name': { type: 'string' },
  'user.age': { type: 'number' }
};

// Missing target
let threw = false;
try {
  persistConfig([{ op: 'flatten' }], schema);
} catch (err) {
  threw = true;
  assert.ok(err.message.includes('Missing target'), 'missing target message');
}
assert.ok(threw, 'should throw for missing target');

// Allow empty string target (root)
threw = false;
try {
  persistConfig([{ op: 'flatten', target: '' }], schema);
} catch (err) {
  threw = true;
}
assert.ok(!threw, 'should allow empty string target');

// Type mismatch
threw = false;
try {
  persistConfig([{ op: 'flatten', target: 'user.name', expectedType: 'number' }], schema);
} catch (err) {
  threw = true;
  assert.ok(err.message.includes('Type mismatch'), 'type mismatch message');
}
assert.ok(threw, 'should throw for type mismatch');

// Unresolved binding
threw = false;
try {
  persistConfig([
    { op: 'condition', target: 'user', config: { if: 'foo.bar', then: [{ op: 'flatten', target: 'user.name' }] } }
  ], schema);
} catch (err) {
  threw = true;
  assert.ok(err.message.includes('Unresolved binding'), 'unresolved binding message');
}
assert.ok(threw, 'should throw for unresolved binding');

// Duplicate writes
threw = false;
try {
  persistConfig([
    { op: 'flatten', target: 'user.name' },
    { op: 'unflatten', target: 'user.name' }
  ], schema);
} catch (err) {
  threw = true;
  assert.ok(err.message.includes('Duplicate write'), 'duplicate write message');
}
assert.ok(threw, 'should throw for duplicate writes');

// Export should also validate
threw = false;
try {
  exportConfig([{ op: 'flatten' }], schema);
} catch (err) {
  threw = true;
  assert.ok(err.message.includes('Missing target'), 'export validation message');
}
assert.ok(threw, 'exportConfig should validate');

console.log('validation tests passed');
