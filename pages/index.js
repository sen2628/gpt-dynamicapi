import Header from '@/components/layout/Header';
import Nav from '@/components/layout/Nav';
import MainSection from '@/components/layout/MainSection';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Nav />
        <MainSection />
      </div>
    </div>
  );
}
