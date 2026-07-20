import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function StatCard({ label, value }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      api.get('/reports/dashboard').then((res) => setStats(res.data));
    } else {
      api.get('/policies').then((res) => setPolicies(res.data.data));
    }
  }, [user]);

  if (user?.role === 'ADMIN') {
    return (
      <div>
        <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Business overview</h1>
        {!stats ? (
          <p className="text-slate-500">Loading…</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Active policies" value={stats.policies.active} />
            <StatCard label="Expired policies" value={stats.policies.expired} />
            <StatCard label="Total customers" value={stats.totalCustomers} />
            <StatCard label="Premium collected" value={`₹${stats.totalPremiumCollected.toLocaleString()}`} />
          </div>
        )}
        <p className="mt-6 text-sm text-slate-500">See the <b>Reports</b> tab for charts and monthly breakdowns.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">
        {user?.role === 'AGENT' ? 'Welcome back' : 'My policies'}
      </h1>
      <div className="grid gap-4 md:grid-cols-3">
        {policies.map((p) => (
          <div key={p.id} className="card p-5">
            <p className="text-sm font-semibold text-ink">{p.policyType}</p>
            <p className="text-xs text-slate-500">{p.policyNumber}</p>
            <p className="mt-3 font-display text-xl font-semibold text-ink">₹{p.premiumAmount.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Expires {new Date(p.endDate).toLocaleDateString()}</p>
          </div>
        ))}
        {policies.length === 0 && <p className="text-slate-500">No policies yet.</p>}
      </div>
    </div>
  );
}