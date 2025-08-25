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

function executeTransformation(data, t) {
  const { op, target = '', config = {} } = t || {};
  let working = JSON.parse(JSON.stringify(data || {}));
  switch (op) {
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
    default:
      break;
  }
  return working;
}

module.exports = { flatten, unflatten, executeTransformation };

