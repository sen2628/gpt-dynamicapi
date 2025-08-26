// Simple transformation runtime with flatten/unflatten support
function flatten(obj, { delimiter = '.', depth = 0, preserveArrays = false } = {}) {
  const maxDepth = depth && depth > 0 ? depth : Infinity;
  const result = {};
  function recurse(value, path, currentDepth) {
    const isObject = value && typeof value === 'object';
    const isArray = Array.isArray(value);
    if (
      isObject &&
      currentDepth < maxDepth &&
      (!isArray || !preserveArrays)
    ) {
      const entries = isArray ? value.entries() : Object.entries(value);
      for (const [k, v] of entries) {
        const newPath = path ? `${path}${delimiter}${k}` : String(k);
        recurse(v, newPath, currentDepth + 1);
      }
    } else {
      if (path) result[path] = value;
    }
  }
  recurse(obj, '', 0);
  return result;
}

function unflatten(obj, { delimiter = '.', overwrite = false } = {}) {
  const result = {};
  outer: for (const [compound, value] of Object.entries(obj || {})) {
    const keys = compound.split(delimiter);
    let current = result;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (i === keys.length - 1) {
        if (!overwrite && Object.prototype.hasOwnProperty.call(current, key)) {
          continue outer;
        }
        current[key] = value;
      } else {
        if (!current[key] || typeof current[key] !== 'object') {
          if (overwrite) {
            current[key] = {};
          } else {
            continue outer;
          }
        }
        current = current[key];
      }
    }
  }
  return result;
}

function getByPath(obj, path) {
  if (!path) return obj;
  return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
}

function setByPath(obj, path, value) {
  if (!path) return value;
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
  return obj;
}

function deleteByPath(obj, path) {
  if (!path) return;
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object') {
      return;
    }
    current = current[part];
  }
  delete current[parts[parts.length - 1]];
}

function runSteps(data, steps = []) {
  let working = JSON.parse(JSON.stringify(data || {}));
  for (const step of steps) {
    try {
      working = executeTransformation(working, step);
    } catch (err) {
      if ((step.onError || 'continue') === 'continue') {
        continue;
      }
      throw err;
    }
  }
  return working;
}

function executeTransformation(data, t) {
  if (Array.isArray(t)) {
    return runSteps(data, t);
  }
  const { op, target = '', config = {} } = t || {};
  let working = JSON.parse(JSON.stringify(data || {}));
  switch (op) {
    case 'rename_fields': {
      let obj = getByPath(working, target) || {};
      if (typeof obj === 'object') {
        for (const m of config.mappings || []) {
          const val = getByPath(obj, m.from);
          if (val !== undefined) {
            deleteByPath(obj, m.from);
            setByPath(obj, m.to, val);
          }
        }
      }
      working = target ? setByPath(working, target, obj) : obj;
      break;
    }
    case 'select_fields': {
      const obj = getByPath(working, target);
      if (obj && typeof obj === 'object') {
        const selected = {};
        for (const field of config.fields || []) {
          const val = getByPath(obj, field);
          if (val !== undefined) {
            setByPath(selected, field, val);
          }
        }
        working = target ? setByPath(working, target, selected) : selected;
      }
      break;
    }
    case 'compute_field': {
      let obj = getByPath(working, target);
      if (!obj || typeof obj !== 'object') {
        obj = {};
      }
      let value;
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function('obj', `with(obj){ return (${config.expression}); }`);
        value = fn(obj);
      } catch (e) {
        throw e;
      }
      setByPath(obj, config.field, value);
      working = target ? setByPath(working, target, obj) : obj;
      break;
    }
    case 'array_take': {
      const arr = getByPath(working, target);
      if (Array.isArray(arr)) {
        const result = arr.slice(0, config.count);
        working = target ? setByPath(working, target, result) : result;
      }
      break;
    }
    case 'flatten': {
      const val = getByPath(working, target);
      const flat = flatten(val, config);
      working = target ? setByPath(working, target, flat) : flat;
      break;
    }
    case 'unflatten': {
      const val = getByPath(working, target);
      const nested = unflatten(val, config);
      working = target ? setByPath(working, target, nested) : nested;
      break;
    }
    case 'condition': {
      const condVal = typeof config.if === 'string'
        ? getByPath(working, config.if)
        : config.if;
      const branch = condVal ? config.then : config.else;
      if (Array.isArray(branch)) {
        working = runSteps(working, branch);
      }
      break;
    }
    default:
      throw new Error(`Unsupported op: ${op}`);
  }
  return working;
}

module.exports = { flatten, unflatten, executeTransformation, runSteps };

