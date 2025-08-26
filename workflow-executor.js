const transformRuntime = require('./transformRuntime');
const { runSteps } = transformRuntime;

function resolveTemplates(obj, context) {
  if (typeof obj === 'string') {
    return obj.replace(/{{([^}]+)}}/g, (_, p) => {
      const keys = p.trim().split('.');
      return keys.reduce((acc, k) => (acc ? acc[k] : undefined), context);
    });
  }
  if (Array.isArray(obj)) {
    return obj.map(v => resolveTemplates(v, context));
  }
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const k of Object.keys(obj)) {
      out[k] = resolveTemplates(obj[k], context);
    }
    return out;
  }
  return obj;
}

async function callRest(node, ctx) {
  const data = node.data || node;
  let url = resolveTemplates(data.endpoint, ctx);
  const method = (data.method || 'GET').toUpperCase();
  const params = resolveTemplates(data.queryParams || data.variables || {}, ctx);
  const headers = resolveTemplates(data.headers || {}, ctx);
  let fetchUrl = url;
  const options = { method, headers: { ...headers } };
  if (method === 'GET') {
    const qs = new URLSearchParams(params).toString();
    if (qs) fetchUrl += (fetchUrl.includes('?') ? '&' : '?') + qs;
  } else {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(params);
  }
  try {
    const res = await fetch(fetchUrl, options);
    return res.json();
  } catch (err) {
    if (data.mockResponse) return data.mockResponse;
    throw err;
  }
}

async function callGraphQL(node, ctx) {
  const data = node.data || node;
  const url = resolveTemplates(data.endpoint, ctx);
  const query = data.query;
  const variables = resolveTemplates(data.variables || {}, ctx);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    });
    return res.json();
  } catch (err) {
    if (data.mockResponse) return data.mockResponse;
    throw err;
  }
}

async function runWorkflow(config, input = {}, onStep) {
  let context = { ...input };
  const nodes = (config.workflow && config.workflow.nodes) || [];
  for (const node of nodes) {
    onStep && onStep({ id: node.id, status: 'running' });
    try {
      let result;
      if (node.type === 'api' || node.type === 'rest') {
        result = await callRest(node, context);
        context[node.id] = result;
      } else if (node.type === 'graphql') {
        result = await callGraphQL(node, context);
        context[node.id] = result;
      } else if (node.type === 'transform') {
        const data = node.data || node;
        context = runSteps(context, data.transformations || []);
        result = context;
      }
      onStep && onStep({ id: node.id, status: 'success' });
    } catch (err) {
      onStep && onStep({ id: node.id, status: 'error', error: err });
      throw err;
    }
  }
  return context;
}

module.exports = { runWorkflow };
