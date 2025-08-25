import Layout from '../components/layout/Layout';
import Card from '../components/core/Card';
import Button from '../components/core/Button';

export default function Home() {
  return (
    <Layout>
      <Card title="Welcome">
        <p className="mb-4">This is the GPT DynamicAPI prototype running on Next.js.</p>
        <Button onClick={() => alert('Clicked!')}>Primary Action</Button>
      </Card>
    </Layout>
  );
}
