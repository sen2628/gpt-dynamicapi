import Image from '@/components/core/Image';

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-gray-50">
      <div className="flex items-center gap-2">
        <Image src="/app-integrator-logo-light.svg" alt="App Integrator" width={32} height={32} />
        <span className="font-bold">App Integrator</span>
      </div>
    </header>
  );
}
