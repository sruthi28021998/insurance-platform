import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Settings() {
  const [form, setForm] = useState({ companyName: '', claimApprovalThreshold: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/settings').then((res) => setForm({
      companyName: res.data.companyName,
      claimApprovalThreshold: res.data.claimApprovalThreshold,
    }));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.put('/settings', form);
      setMessage('Settings saved.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save settings');
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">System settings</h1>
      <div className="card max-w-md p-6">
        {message && <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
        {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="label">Company name</label>
            <input className="input" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          </div>
          <div>
            <label className="label">Claim approval threshold (Rs.)</label>
            <input type="number" className="input" value={form.claimApprovalThreshold} onChange={(e) => setForm({ ...form, claimApprovalThreshold: e.target.value })} />
            <p className="mt-1 text-xs text-slate-500">Claims above this amount are flagged for extra review.</p>
          </div>
          <button type="submit" className="btn-primary w-full">Save settings</button>
        </form>
      </div>
    </div>
  );
}