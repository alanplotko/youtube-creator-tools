import Navigation from './navigation';

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
