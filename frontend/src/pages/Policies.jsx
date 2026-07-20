import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import StatusStamp from '../components/StatusStamp';
import Modal from '../components/Modal';

export default function Policies() {
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'AGENT';
  const [policies, setPolicies] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ customerId: '', policyType: '', policyNumber: '', premiumAmount: '', startDate: '', endDate: '' });

  async function load() {
    const { data } = await api.get('/policies', { params: statusFilter ? { status: statusFilter } : {} });
    setPolicies(data.data);
  }

  useEffect(() => { load(); }, [statusFilter]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/policies', form);
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create policy');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Policies</h1>
        {canManage && <button className="btn-primary" onClick={() => setShowModal(true)}>+ Create policy</button>}
      </div>

      <select className="input mb-4 max-w-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="EXPIRED">Expired</option>
        <option value="CANCELLED">Cancelled</option>
      </select>

      <DataTable
        columns={[
          { key: 'policyNumber', label: 'Policy #' },
          { key: 'policyType', label: 'Type' },
          { key: 'customer', label: 'Customer', render: (r) => r.customer?.name || '—' },
          { key: 'premiumAmount', label: 'Premium', render: (r) => `₹${r.premiumAmount.toLocaleString()}` },
          { key: 'endDate', label: 'Expires', render: (r) => new Date(r.endDate).toLocaleDateString() },
          { key: 'status', label: 'Status', render: (r) => <StatusStamp status={r.status} /> },
        ]}
        rows={policies}
      />

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create a new policy">
        {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <form onSubmit={handleCreate} className="space-y-3">
          <div><label className="label">Customer ID</label><input required className="input" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} /></div>
          <div><label className="label">Policy type</label><input required className="input" placeholder="e.g. Health, Auto, Life" value={form.policyType} onChange={(e) => setForm({ ...form, policyType: e.target.value })} /></div>
          <div><label className="label">Policy number</label><input required className="input" value={form.policyNumber} onChange={(e) => setForm({ ...form, policyNumber: e.target.value })} /></div>
          <div><label className="label">Premium amount</label><input required type="number" className="input" value={form.premiumAmount} onChange={(e) => setForm({ ...form, premiumAmount: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Start date</label><input required type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div><label className="label">End date</label><input required type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
          </div>
          <button type="submit" className="btn-primary w-full">Save policy</button>
        </form>
      </Modal>
    </div>
  );
}