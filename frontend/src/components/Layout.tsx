import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Search, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  Package,
  User,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Create Bill', href: '/create', icon: PlusCircle },
    { name: 'Search Bills', href: '/search', icon: Search },
    { name: 'Daily Reports', href: '/reports', icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPathName = navigation.find(item => item.href === location.pathname)?.name || 'Consignment System';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-slate-900 border-r border-slate-800 text-white shrink-0">
        <div className="p-6 flex flex-col items-start border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 p-2 rounded-lg text-white">
              <Package size={22} className="animate-pulse" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight">AmodXpress</h1>
              <p className="text-[10px] text-primary-400 font-semibold uppercase tracking-wider">Courier billing console</p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-700/30 border border-primary-500/20 flex items-center justify-center text-primary-400">
              <User size={18} />
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold truncate text-slate-200">{user?.username || 'Administrator'}</p>
              <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Admin Session
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/10'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{item.name}</span>
                </div>
                <ChevronRight size={14} className="opacity-40" />
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Action */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full bg-slate-800/60 hover:bg-red-950/20 hover:text-red-400 border border-slate-700/40 hover:border-red-900/30 text-slate-300 font-medium py-2.5 rounded-lg text-sm transition-all duration-150 active:scale-95"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 md:hidden text-white">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <Package size={18} />
            </div>
            <span className="font-extrabold text-md tracking-tight">AmodXpress</span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 text-slate-300 hover:text-white focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Overlay backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black z-40 md:hidden"
              />

              {/* Sidebar Menu Drawer */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 bottom-0 left-0 w-72 bg-slate-900 border-r border-slate-800 text-white z-50 flex flex-col md:hidden"
              >
                <div className="p-6 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary-600 p-1.5 rounded-lg">
                      <Package size={20} />
                    </div>
                    <span className="font-extrabold text-md tracking-tight">AmodXpress</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                    <X size={20} />
                  </button>
                </div>

                <div className="px-4 py-4 border-b border-slate-800 bg-slate-950/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-700/30 border border-primary-500/20 flex items-center justify-center text-primary-400">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold truncate text-slate-200">{user?.username}</p>
                      <span className="inline-block text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Admin Session
                      </span>
                    </div>
                  </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                            isActive
                              ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/10'
                              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                          }`
                        }
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight size={14} className="opacity-40" />
                      </NavLink>
                    );
                  })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-3 w-full bg-slate-800/60 hover:bg-red-950/20 hover:text-red-400 border border-slate-700/40 hover:border-red-900/30 text-slate-300 font-medium py-2.5 rounded-lg text-sm transition-all duration-150"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Content Box */}
        <main className="flex-1 overflow-y-auto focus:outline-none p-4 md:p-8 bg-slate-50/50">
          {/* Page header title block (only shown on desktop) */}
          <div className="hidden md:flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{currentPathName}</h2>
              <p className="text-xs text-slate-400">AmodXpress Consignment System</p>
            </div>
            <div className="text-xs text-slate-500 bg-white border border-slate-100 rounded-lg px-3 py-1.5 shadow-sm">
              <span className="font-semibold text-slate-700">Delhi Branch</span> • Kashmir Gate
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full h-full max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
