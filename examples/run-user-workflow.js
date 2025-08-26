const { runSteps } = require('../transformRuntime');
const config = require('./user-workflow-config.json');

function resolveTemplates(obj, context) {
  if (typeof obj === 'string') {
    return obj.replace(/{{([^}]+)}}/g, (_, p) => {
      return p.trim().split('.').reduce((acc, key) => (acc ? acc[key] : undefined), context);
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

async function mockCall(node, context) {
  const variables = resolveTemplates(node.variables || {}, context);
  console.log(`Calling ${node.id} with`, variables);
  await new Promise(r => setTimeout(r, 50));
  return node.mockResponse;
}

async function run() {
  const ctx = { input: config.input };

  const userNode = config.workflow.nodes.find(n => n.id === 'getUserDetail');
  const userRes = await mockCall(userNode, ctx);
  ctx.user = userRes.data.getUserDetailByUserId;

  const sessionNode = config.workflow.nodes.find(n => n.id === 'getUserWorkingSession');
  const delegationNode = config.workflow.nodes.find(n => n.id === 'getUserDelegation');
  const [sessionsRes, delegationsRes] = await Promise.all([
    mockCall(sessionNode, ctx),
    mockCall(delegationNode, ctx)
  ]);
  ctx.sessions = sessionsRes.data.getUserWorkingSessionByappCodeActionTypeUserId.items;
  ctx.delegations = delegationsRes.data.getUserDelegationByUserId.items;

  const configNode = config.workflow.nodes.find(n => n.id === 'getCountryConfig');
  const countryRes = await mockCall(configNode, ctx);
  ctx.countryConfig = countryRes.data.getUserManagementConfigByCategoryNameAndId;

  const transformNode = config.workflow.nodes.find(n => n.id === 'transform');
  const output = runSteps(ctx, transformNode.transformations);

  console.log('Final Output:');
  console.log(JSON.stringify(output, null, 2));
}

run().catch(err => console.error(err));
