import { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useLogout, useUser } from '../hooks/useAuth';
import {
  LayoutDashboard,
  BookOpen,
  User,
  LogOut,
  CheckSquare,
  List,
  Users,
  Search,
  Trash2,
  Bell,
  Link as LinkIcon,
  Trophy,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { ThemeToggle } from '../components/shared/ThemeToggle';
import { useUIStore } from '../store/useUIStore';
import { CommandPalette } from '../components/shared/CommandPalette';
import { NotificationsDropdown } from '../components/shared/NotificationsDropdown';

export function AppLayout() {
  const { data: user } = useUser();
  const logout = useLogout();
  const location = useLocation();
  const { isSidebarCollapsed, toggleSidebar, isCommandPaletteOpen, setCommandPaletteOpen } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          toggleSidebar();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, isCommandPaletteOpen, setCommandPaletteOpen]);

  const navItems = [
    { name: 'Sheet', path: '/app/sheet', icon: List },
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Contests', path: '/app/contests', icon: Trophy },
    { name: 'Practice', path: '/app/review', icon: CheckSquare },
    { name: 'Discover', path: '/app/discover', icon: Search },
    { name: 'Groups', path: '/app/groups', icon: Users },
  ];

  const bottomNavItems = [
    { name: 'Integrations', path: '/app/integrations', icon: LinkIcon },
    { name: 'Trash', path: '/app/trash', icon: Trash2 },
  ];

  return (
    <div className="h-screen h-[100dvh] flex bg-bg-dark transition-colors overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`h-screen h-[100dvh] sticky top-0 flex flex-col shrink-0 border-r border-border-dark bg-bg-elevated transition-[width] duration-300 ease-in-out z-20 overflow-hidden select-none ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        } hidden md:flex`}
      >
        {/* Sidebar Header */}
        <div className="h-16 shrink-0 border-b border-border-dark flex items-center px-3 overflow-hidden">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between w-full min-w-0">
              <Link to="/app/dashboard" className="flex items-center gap-2.5 font-bold text-lg text-text-main overflow-hidden group min-w-0">
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                  <div className="p-1.5 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/20 rounded-md group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5 text-brand-primary" />
                  </div>
                </div>
                <span className="truncate tracking-tight font-extrabold text-text-main whitespace-nowrap">AlgoForge</span>
              </Link>
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-border-dark/60 transition-colors cursor-pointer shrink-0"
                title="Collapse sidebar (Ctrl+B)"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={toggleSidebar}
              className="group relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-border-dark/70 transition-all cursor-pointer shrink-0 mx-auto"
              title="Expand sidebar (Ctrl+B)"
              aria-label="Expand sidebar"
            >
              {/* Default: AlgoForge logo */}
              <div className="p-1.5 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/20 rounded-md transition-all duration-200 group-hover:opacity-0 group-hover:scale-75">
                <BookOpen className="w-5 h-5 text-brand-primary" />
              </div>

              {/* Hover: Uncollapse (expand) button icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 text-brand-primary">
                <PanelLeftOpen className="w-5 h-5" />
              </div>
            </button>
          )}
        </div>
        
        {/* Navigation links (scrolls independently if height is constrained) */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-3 flex flex-col">
          <div
            className={`overflow-hidden transition-all duration-200 px-3 ${
              isSidebarCollapsed ? 'h-0 opacity-0 my-0' : 'h-5 opacity-100 mt-1 mb-1'
            }`}
          >
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
              Main Menu
            </span>
          </div>

          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  title={isSidebarCollapsed ? item.name : undefined}
                  className={`flex items-center h-10 rounded-lg font-medium text-sm transition-colors overflow-hidden whitespace-nowrap ${
                    isActive
                      ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                      : 'text-text-muted hover:bg-border-dark hover:text-text-main'
                  }`}
                >
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-brand-primary' : ''}`} />
                  </div>
                  <span
                    className={`truncate text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      isSidebarCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-[180px]'
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div
            className={`overflow-hidden transition-all duration-200 px-3 ${
              isSidebarCollapsed ? 'h-0 opacity-0 my-0' : 'h-5 opacity-100 mt-5 mb-1'
            }`}
          >
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
              Manage
            </span>
          </div>
          {isSidebarCollapsed && <div className="my-2 border-t border-border-dark/60 mx-3" />}

          <nav className="space-y-1 px-3">
            {bottomNavItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  title={isSidebarCollapsed ? item.name : undefined}
                  className={`flex items-center h-10 rounded-lg font-medium text-sm transition-colors overflow-hidden whitespace-nowrap ${
                    isActive
                      ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                      : 'text-text-muted hover:bg-border-dark hover:text-text-main'
                  }`}
                >
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-brand-primary' : ''}`} />
                  </div>
                  <span
                    className={`truncate text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      isSidebarCollapsed ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-[180px]'
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & logout footer */}
        <div className="h-[76px] shrink-0 border-t border-border-dark flex items-center px-3 overflow-hidden">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between w-full min-w-0">
              <Link to="/app/profile" className="flex items-center gap-3 flex-1 min-w-0 group" title="View profile">
                <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full bg-border-dark border border-border-dark object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-sm border border-brand-primary/30">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-main truncate group-hover:text-brand-primary transition-colors leading-tight">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-text-muted truncate mt-0.5">@{user?.username || 'user'}</p>
                </div>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  logout.mutate();
                }}
                className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors shrink-0 cursor-pointer"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 w-full">
              <Link
                to="/app/profile"
                title={user?.name || 'User profile'}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:ring-2 hover:ring-brand-primary/40 transition-all cursor-pointer"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full bg-border-dark object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-sm border border-brand-primary/30">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </Link>
              <button
                onClick={() => logout.mutate()}
                className="p-1 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen h-[100dvh] overflow-hidden">
        <header className="h-16 shrink-0 bg-bg-elevated/80 backdrop-blur-md border-b border-border-dark flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Search Bar / Command Palette trigger */}
            <button 
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-2 text-sm text-text-muted bg-bg-dark border border-border-dark px-4 py-1.5 rounded-lg hover:border-brand-primary/50 transition-colors w-64 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search anything...</span>
              <span className="ml-auto text-xs bg-border-dark px-1.5 rounded">⌘K</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <NotificationsDropdown />
            <ThemeToggle />
          </div>
        </header>
        
        <main className="flex-1 min-h-0 overflow-y-auto bg-bg-dark p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
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
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}

export default AppLayout;
