import { useState } from 'react';
import api from '../api/axios';

export default function Employees() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'AGENT' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/auth/employees', form);
      setMessage(`Created ${data.role} account for ${data.email}`);
      setForm({ name: '', email: '', password: '', role: 'AGENT' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create employee account');
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Manage employees</h1>
      <div className="card max-w-md p-6">
        {message && <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
        {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <form onSubmit={handleCreate} className="space-y-3">
          <div><label className="label">Name</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Email</label><input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Password</label><input type="password" required minLength={6} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="AGENT">Agent</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">Create account</button>
        </form>
      </div>
    </div>
  );
}