import List from '@/components/core/List';

export default function Nav() {
  const items = ['Home', 'APIs'];
  return (
    <nav className="w-48 border-r p-4 bg-white">
      <List items={items} />
    </nav>
  );
}
