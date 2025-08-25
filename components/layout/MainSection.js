import { useEffect, useState } from 'react';
import Dropdown from '@/components/core/Dropdown';
import Table from '@/components/core/Table';
import Button from '@/components/core/Button';
import Canvas from '@/components/layout/Canvas';
import { getEnvironments, getApiCatalog } from '@/services/configService';
import apiClient from '@/services/apiClient';

export default function MainSection() {
  const [env, setEnv] = useState('dev');
  const [catalog, setCatalog] = useState({ restApis: [], graphqlApis: [] });

  useEffect(() => {
    setCatalog(getApiCatalog());
  }, []);

  const envOptions = getEnvironments().map(e => ({ value: e.id, label: e.id }));

  const columns = [
    { accessor: 'name', Header: 'Name' },
    { accessor: 'method', Header: 'Method' },
    { accessor: 'endpoint', Header: 'Endpoint' },
    { accessor: 'action', Header: 'Action' }
  ];

  const invoke = async (api) => {
    const url = api.environments[env] || api.endpoint;
    try {
      const res = await apiClient.get(url);
      console.log('API response', res.data);
    } catch (err) {
      console.error('API error', err);
    }
  };

  const restData = catalog.restApis.map(api => ({
    name: api.name,
    method: api.method,
    endpoint: api.environments[env] || api.endpoint,
    action: <Button onClick={() => invoke(api)}>Call</Button>
  }));

  return (
    <main className="flex-1 p-4 space-y-4 overflow-auto">
      <div className="flex items-center gap-2">
        <span>Select environment:</span>
        <Dropdown options={envOptions} value={env} onChange={setEnv} />
      </div>
      <Canvas>
        <Table columns={columns} data={restData} />
      </Canvas>
    </main>
  );
}
