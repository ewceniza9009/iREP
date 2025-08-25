import Sidebar from './Sidebar';
import Header from './Header';
import { ReactNode } from 'react'; // Import ReactNode

// The Layout component should be a simple wrapper that accepts children.
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children} {/* <-- Change <Outlet /> back to {children} */}
        </main>
      </div>
    </div>
  );
}