import { Outlet, Link } from 'react-router-dom';
import { useLogout, useUser } from '../hooks/useAuth';

export default function AppLayout() {
  const { data: user } = useUser();
  const logout = useLogout();

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar placeholder */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block">
        <div className="h-16 flex items-center px-4 font-bold text-xl border-b border-gray-200 dark:border-gray-700">
          AlgoForge
        </div>
        <nav className="p-4 space-y-2">
          <Link to="/sheet" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Sheet</Link>
          <Link to="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Dashboard</Link>
          <Link to="/review" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Review</Link>
          <Link to="/profile" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Profile</Link>
        </nav>
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Header placeholder */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
          <div>
            <span className="font-semibold">{(user as any)?.name}</span>
          </div>
          <button 
            onClick={() => logout.mutate()}
            className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
          >
            Logout
          </button>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
