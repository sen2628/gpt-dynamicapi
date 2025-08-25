const TRANSFORM_OPS = {
  rename_fields: {
    label: 'Rename Fields',
    expectedType: 'object',
    allowCreate: true,
    defaultConfig: { mappings: [{ from: '', to: '' }] },
    defaultOnError: 'continue',
    requiredConfig: ['mappings']
  },
  select_fields: {
    label: 'Select Fields',
    expectedType: 'object',
    allowCreate: true,
    defaultConfig: { fields: [''] },
    defaultOnError: 'continue',
    requiredConfig: ['fields']
  },
  compute_field: {
    label: 'Compute Field',
    expectedType: null,
    allowCreate: true,
    defaultConfig: { field: '', expression: '' },
    defaultOnError: 'continue',
    requiredConfig: ['field', 'expression']
  },
  array_take: {
    label: 'Array Take',
    expectedType: 'array',
    allowCreate: false,
    defaultConfig: { count: 1 },
    defaultOnError: 'continue',
    requiredConfig: ['count']
  },
  flatten: {
    label: 'Flatten',
    expectedType: 'object',
    allowCreate: true,
    defaultConfig: { delimiter: '.', depth: 0, preserveArrays: false },
    defaultOnError: 'continue',
    requiredConfig: []
  },
  unflatten: {
    label: 'Unflatten',
    expectedType: 'object',
    allowCreate: true,
    defaultConfig: { delimiter: '.', overwrite: false },
    defaultOnError: 'continue',
    requiredConfig: []
  }
};

function normalizeTransformations(transforms = []) {
  const steps = [];
  transforms.forEach(t => {
    const def = TRANSFORM_OPS[t.op] || {};
    const config = t.config || {};
    if (!config || Object.keys(config).length === 0) return;
    if ((def.requiredConfig || []).some(key => {
      const val = config[key];
      return val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);
    })) {
      return;
    }
    steps.push({
      op: t.op,
      target: t.target,
      config,
      onError: t.onError || def.defaultOnError || 'continue'
    });
  });
  return steps;
}

module.exports = { TRANSFORM_OPS, normalizeTransformations };
