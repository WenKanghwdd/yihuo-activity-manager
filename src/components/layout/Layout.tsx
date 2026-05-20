import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Calendar, Library, Users, Settings, Menu, X } from 'lucide-react';

const navItems = [
  { path: '/', label: '周计划表', icon: Calendar },
  { path: '/activities', label: '活动库', icon: Library },
  { path: '/elderly', label: '老人管理', icon: Users },
  { path: '/settings', label: '设置', icon: Settings },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Top Navigation Bar — fixed at top */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }} className="no-print flex h-14 items-center bg-white border-b border-warm-200 shadow-sm px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <img src="/yuehuo-activity-manager/logo.svg" alt="悦活" className="h-9 w-auto" />
          <span className="text-base font-bold text-warm-800 hidden sm:inline">悦活</span>
        </div>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 ml-8 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-red-50 text-red-700'
                    : 'text-warm-600 hover:bg-warm-100 hover:text-warm-800'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden rounded-lg p-1.5 text-warm-600 hover:bg-warm-100 ml-auto transition-colors"
          aria-label="切换菜单"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Version tag */}
        <span className="hidden lg:inline text-xs text-warm-300 ml-auto">v1.0</span>
      </header>

      {/* Mobile overlay + dropdown */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setMenuOpen(false)} />
          <div className="fixed top-14 left-0 right-0 z-40 bg-white border-b border-warm-200 shadow-lg md:hidden">
            <nav className="flex flex-col p-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-red-50 text-red-700'
                        : 'text-warm-600 hover:bg-warm-50'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* Page content — offset for fixed header */}
      <main className="min-h-screen bg-warm-50 px-4 sm:px-6 lg:px-8 pt-14 pb-4 print:p-0">
        <Outlet />
      </main>
    </>
  );
}
