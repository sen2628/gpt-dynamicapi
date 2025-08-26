const userAggregatorDemo = {
  id: 'api_demo_6',
  name: 'User Aggregator Demo',
  description: 'Demonstrates combining REST and GraphQL APIs with transformations.',
  version: '1.0.0',
  status: 'published',
  wasPublished: true,
  createdAt: new Date().toISOString(),
  modifiedAt: new Date().toISOString(),
  tags: ['demo', 'aggregator'],
  applications: ['Demo App'],
  inputSchema: { userId: { type: 'number', required: true, description: 'JSONPlaceholder user id', example: 1 } },
  outputSchema: {
    user: { type: 'object', description: 'User details from REST API' },
    firstCountry: { type: 'object', description: 'First country from GraphQL API' }
  },
  workflow: {
    nodes: [
      { id: 'start_1', type: 'start', position: { x: 50, y: 200 }, data: { label: 'Start', status: 'idle' } },
      {
        id: 'api_user',
        type: 'api',
        position: { x: 200, y: 200 },
        data: {
          label: 'Fetch User',
          apiType: 'REST',
          method: 'GET',
          endpoint: 'https://jsonplaceholder.typicode.com/users/{{userId}}',
          status: 'idle',
          mockResponse: {
            id: 1,
            name: 'Leanne Graham',
            username: 'Bret',
            email: 'Sincere@april.biz'
          }
        }
      },
      {
        id: 'graphql_countries',
        type: 'graphql',
        position: { x: 400, y: 200 },
        data: {
          label: 'Fetch Countries',
          endpoint: 'https://countries.trevorblades.com/',
          query: 'query { countries { code name } }',
          variables: {},
          status: 'idle',
          mockResponse: {
            data: {
              countries: [
                { code: 'US', name: 'United States' },
                { code: 'CA', name: 'Canada' }
              ]
            }
          }
        }
      },
      {
        id: 'transform_1',
        type: 'transform',
        position: { x: 600, y: 200 },
        data: {
          label: 'Transform',
          transformations: [
            {
              op: 'rename_fields',
              target: '',
              config: {
                mappings: [
                  { from: 'api_user', to: 'user' },
                  { from: 'graphql_countries.data.countries.0', to: 'firstCountry' }
                ]
              },
              onError: 'continue'
            },
            {
              op: 'select_fields',
              target: '',
              config: { fields: ['user', 'firstCountry'] },
              onError: 'continue'
            }
          ],
          status: 'idle'
        }
      },
      { id: 'end_1', type: 'end', position: { x: 800, y: 200 }, data: { label: 'End', status: 'idle' } }
    ],
    edges: [
      { id: 'e1', source: 'start_1', target: 'api_user', animated: false },
      { id: 'e2', source: 'api_user', target: 'graphql_countries', animated: false },
      { id: 'e3', source: 'graphql_countries', target: 'transform_1', animated: false },
      { id: 'e4', source: 'transform_1', target: 'end_1', animated: false }
    ]
  },
  environments: {
    dev: { active: true, variables: {}, promotedVersionId: null, promotedFrom: null, lastPromotion: null, promotionHistory: [] },
    qa: { active: false, variables: {}, promotedVersionId: null, promotedFrom: null, lastPromotion: null, promotionHistory: [] },
    uat: { active: false, variables: {}, promotedVersionId: null, promotedFrom: null, lastPromotion: null, promotionHistory: [] },
    prod: { active: false, variables: {}, promotedVersionId: null, promotedFrom: null, lastPromotion: null, promotionHistory: [] }
  },
  versions: [
    {
      id: 'v1',
      version: 1,
      createdAt: new Date().toISOString(),
      description: 'Initial version',
      content: {
        workflow: { nodes: [], edges: [] },
        inputSchema: {},
        outputSchema: {}
      },
      isCurrent: true
    }
  ],
  testSuites: []
};

export default userAggregatorDemo;
