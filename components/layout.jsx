import Navigation from './navigation';

export default function Layout({ children }) {
  return (
    <div className="flex-h-screen flex flex-col">
      <Navigation />
      <div className="container mx-auto px-5 py-24">
        {children}
      </div>
    </div>
  );
}
