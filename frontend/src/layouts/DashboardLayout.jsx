import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const NAV_BY_ROLE = {
  ADMIN: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/customers', label: 'Customers' },
    { to: '/policies', label: 'Policies' },
    { to: '/claims', label: 'Claims' },
    { to: '/premiums', label: 'Premiums' },
    { to: '/reports', label: 'Reports' },
    { to: '/employees', label: 'Employees' },
    { to: '/audit-logs', label: 'Audit Logs' },
    { to: '/settings', label: 'Settings' },
  ],
  AGENT: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/customers', label: 'Customers' },
    { to: '/policies', label: 'Policies' },
    { to: '/claims', label: 'Claims' },
    { to: '/premiums', label: 'Premiums' },
  ],
  CUSTOMER: [
    { to: '/dashboard', label: 'My Policies' },
    { to: '/claims', label: 'My Claims' },
    { to: '/premiums', label: 'Payments' },
    { to: '/documents', label: 'Documents' },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { dark, toggleDark } = useTheme();
  const nav = NAV_BY_ROLE[user?.role] || [];

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col justify-between border-r border-slate-200 bg-brand-900 text-white">
        <div>
          <div className="border-b border-white/10 px-6 py-5">
            <p className="font-display text-lg font-semibold leading-tight">Insurance<br/>Platform</p>
          </div>
          <nav className="mt-4 flex flex-col gap-1 px-3">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-white/10 text-white' : 'text-brand-100 hover:bg-white/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="border-t border-white/10 px-6 py-4">
          <button
            onClick={toggleDark}
            className="mb-3 w-full rounded-md border border-white/20 px-2 py-1 text-xs text-brand-100 hover:bg-white/5"
          >
            {dark ? '☀ Light mode' : '🌙 Dark mode'}
          </button>
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="mb-3 text-xs uppercase tracking-wide text-brand-100">{user?.role}</p>
          <button onClick={logout} className="text-sm text-brand-100 underline-offset-2 hover:underline">
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-[#f7f8fb] p-8 dark:bg-slate-900">
        <Outlet />
      </main>
    </div>
  );
}