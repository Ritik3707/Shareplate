import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, Gift, Users, Building2, Truck, 
  MessageSquare, Settings, Shield, LogOut 
} from 'lucide-react';
import type { RootState } from '../../store';

export const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['DONOR', 'NGO', 'VOLUNTEER', 'ADMIN'] },
    { path: '/donations', label: 'Donations', icon: Gift, roles: ['DONOR', 'NGO', 'ADMIN'] },
    { path: '/ngos', label: 'NGOs', icon: Building2, roles: ['DONOR', 'NGO', 'VOLUNTEER', 'ADMIN'] },
    { path: '/volunteers', label: 'Volunteers', icon: Truck, roles: ['NGO', 'ADMIN'] },
    { path: '/messages', label: 'Messages', icon: MessageSquare, roles: ['DONOR', 'NGO', 'VOLUNTEER', 'ADMIN'] },
    { path: '/admin', label: 'Admin', icon: Shield, roles: ['ADMIN'] },
    { path: '/settings', label: 'Settings', icon: Settings, roles: ['DONOR', 'NGO', 'VOLUNTEER', 'ADMIN'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:block">
      <nav className="p-4 space-y-1">
        {visibleItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.path)
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
