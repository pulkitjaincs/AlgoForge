import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useLogout, useUser } from '../hooks/useAuth';
import { LayoutDashboard, BookOpen, User, LogOut, CheckSquare, List, Users, Search, Trash2, Bell, Link as LinkIcon } from 'lucide-react';
import { ThemeToggle } from '../components/shared/ThemeToggle';
import { useUIStore } from '../store/useUIStore';

export function AppLayout() {
  const { data: user } = useUser();
  const logout = useLogout();
  const location = useLocation();
  const { setCommandPaletteOpen } = useUIStore();

  const navItems = [
    { name: 'Sheet', path: '/app/sheet', icon: List },
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Practice', path: '/app/review', icon: CheckSquare },
    { name: 'Discover', path: '/app/discover', icon: Search },
    { name: 'Groups', path: '/app/groups', icon: Users },
  ];

  const bottomNavItems = [
    { name: 'Integrations', path: '/app/integrations', icon: LinkIcon },
    { name: 'Profile', path: '/app/profile', icon: User },
    { name: 'Trash', path: '/app/trash', icon: Trash2 },
  ];

  return (
    <div className="min-h-screen flex bg-bg-dark transition-colors">
      {/* Desktop Sidebar */}
      <aside className="w-64 sidebar hidden md:flex flex-col">
        <div className="h-16 flex items-center gap-2 px-6 font-bold text-xl text-text-main border-b border-border-dark">
          <div className="p-1.5 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/20 rounded-md">
            <BookOpen className="w-5 h-5 text-brand-primary" />
          </div>
          AlgoForge
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1">
          <div className="px-4 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Main Menu</div>
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-brand-primary' : ''}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 mt-8 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Settings</div>
          <nav className="px-3 space-y-1">
            {bottomNavItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-brand-primary' : ''}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-border-dark">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-border-dark transition-colors cursor-pointer group relative">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full bg-border-dark border border-border-dark object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-main truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-text-muted truncate">@{user?.username || 'user'}</p>
            </div>
            <button 
              onClick={(e) => {
                e.preventDefault();
                logout.mutate();
              }}
              className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 bg-bg-elevated/80 backdrop-blur-md border-b border-border-dark flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
             {/* Search Bar / Command Palette trigger */}
             {location.pathname.startsWith('/app/sheet') && (
               <button 
                  onClick={() => setCommandPaletteOpen(true)}
                  className="hidden md:flex items-center gap-2 text-sm text-text-muted bg-bg-dark border border-border-dark px-4 py-1.5 rounded-lg hover:border-brand-primary/50 transition-colors w-64"
               >
                  <Search className="w-4 h-4" />
                  <span>Search anything...</span>
                  <span className="ml-auto text-xs bg-border-dark px-1.5 rounded">⌘K</span>
               </button>
             )}
          </div>
          <div className="flex items-center gap-4">
            <button className="btn-icon" title="Notifications">
               <Bell className="w-5 h-5" />
            </button>
            <ThemeToggle />
          </div>
        </header>
        
        <main className="flex-1 overflow-auto bg-bg-dark p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-elevated border-t border-border-dark flex justify-around items-center h-16 px-2 z-50">
        {[...navItems.slice(0, 4), { name: 'Profile', path: '/app/profile', icon: User }].map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive 
                  ? 'text-brand-primary' 
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default AppLayout;
