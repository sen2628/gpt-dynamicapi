// Central configuration validation and persistence/export helpers
function validateConfig(config, schema = {}) {
  const seenTargets = new Set();

  const isSimplePath = str => /^[A-Za-z0-9_.]+$/.test(str);

  const checkNode = (node, ctx = 'root') => {
    if (!node) {
      throw new Error(`Invalid node at ${ctx}`);
    }
    if (Array.isArray(node)) {
      node.forEach((n, i) => checkNode(n, `${ctx}[${i}]`));
      return;
    }
    const { op, target, expectedType, config = {} } = node;
    if (!target) {
      throw new Error(`Missing target for op ${op || 'unknown'} at ${ctx}`);
    }
    if (schema && target && !schema[target]) {
      throw new Error(`Unknown target path: ${target}`);
    }
    if (
      expectedType &&
      schema[target] &&
      schema[target].type &&
      schema[target].type !== expectedType
    ) {
      throw new Error(
        `Type mismatch for "${target}": expected ${expectedType} but found ${schema[target].type}`
      );
    }
    if (seenTargets.has(target)) {
      throw new Error(`Duplicate write to path: ${target}`);
    }
    seenTargets.add(target);

    // Expression/binding checks for conditional nodes
    if (op === 'condition') {
      const cond = config.if;
      if (typeof cond === 'string') {
        if (isSimplePath(cond)) {
          if (!schema[cond]) {
            throw new Error(`Unresolved binding: ${cond}`);
          }
        } else {
          try {
            new Function(`return (${cond});`); // eslint-disable-line no-new-func
          } catch (err) {
            throw new Error(`Invalid expression syntax: ${cond}`);
          }
        }
      }
      if (Array.isArray(config.then)) {
        config.then.forEach((n, i) => checkNode(n, `${ctx}.then[${i}]`));
      }
      if (Array.isArray(config.else)) {
        config.else.forEach((n, i) => checkNode(n, `${ctx}.else[${i}]`));
      }
    }
  };

  if (Array.isArray(config)) {
    config.forEach((n, i) => checkNode(n, `root[${i}]`));
  } else {
    checkNode(config, 'root');
  }
  return true;
}

function persistConfig(config, schema) {
  validateConfig(config, schema);
  // Stub persistence - in real use this would save to a datastore
  return JSON.parse(JSON.stringify(config));
}

function exportConfig(config, schema) {
  validateConfig(config, schema);
  return JSON.stringify(config);
}

module.exports = { validateConfig, persistConfig, exportConfig };

