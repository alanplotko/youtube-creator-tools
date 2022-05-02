import Navigation from '@/components/Navigation';

export default function Layout({ children }) {
  return (
    <div className="flex-h-screen flex flex-col">
      <Navigation />
      <main>
        {children}
      </main>
    </div>
  );
}
