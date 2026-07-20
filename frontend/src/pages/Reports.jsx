import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import api from '../api/axios';

export default function Reports() {
  const [dashboard, setDashboard] = useState(null);
  const [monthly, setMonthly] = useState([]);

  useEffect(() => {
    api.get('/reports/dashboard').then((res) => setDashboard(res.data));
    api.get('/reports/monthly').then((res) => setMonthly(res.data));
  }, []);

  if (!dashboard) return <p className="text-slate-500">Loading…</p>;

  const policyStatusData = {
    labels: ['Active', 'Expired', 'Cancelled'],
    datasets: [{
      data: [dashboard.policies.active, dashboard.policies.expired, dashboard.policies.cancelled],
      backgroundColor: ['#3868e0', '#94a3b8', '#c26b4f'],
    }],
  };

  const monthlyData = {
    labels: monthly.map((m) => m.month),
    datasets: [
      { label: 'Premium collected', data: monthly.map((m) => m.premiumCollected), backgroundColor: '#3868e0' },
      { label: 'Claims filed', data: monthly.map((m) => m.claimsFiled), backgroundColor: '#c26b4f' },
    ],
  };

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Reports</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-5">
          <p className="mb-4 text-sm font-semibold text-slate-500">Policy status breakdown</p>
          <Doughnut data={policyStatusData} />
        </div>
        <div className="card p-5">
          <p className="mb-4 text-sm font-semibold text-slate-500">Monthly business report</p>
          <Bar data={monthlyData} />
        </div>
      </div>
    </div>
  );
}