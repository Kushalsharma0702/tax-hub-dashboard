import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo.png';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  UserCog,
  Settings,
  BarChart3,
  ClipboardList,
  History,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { PERMISSIONS } from '@/types';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: null },
  { name: 'Clients', href: '/clients', icon: Users, permission: null },
  { name: 'Documents', href: '/documents', icon: FileText, permission: null },
  { name: 'Payments', href: '/payments', icon: CreditCard, permission: PERMISSIONS.ADD_EDIT_PAYMENT },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, permission: PERMISSIONS.VIEW_ANALYTICS },
  { name: 'Admin Management', href: '/admins', icon: UserCog, superadminOnly: true },
  { name: 'Audit Logs', href: '/audit-logs', icon: History, superadminOnly: true },
  { name: 'Settings', href: '/settings', icon: Settings, permission: null },
];

export function Sidebar() {
  const location = useLocation();
  const { user, hasPermission, isSuperAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNav = navigation.filter(item => {
    if (item.superadminOnly && !isSuperAdmin()) return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  });

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className={cn('flex h-16 items-center border-b border-border px-4', collapsed ? 'justify-center' : 'gap-3')}>
          <img src={logo} alt="TaxPro" className="h-10 w-10" />
          {!collapsed && <span className="text-lg font-semibold text-foreground">TaxPro Admin</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  collapsed && 'justify-center'
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className={cn('border-t border-border p-4', collapsed && 'px-2')}>
          {!collapsed && user && (
            <div className="mb-3">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </aside>
  );
}
