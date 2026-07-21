import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import StatusStamp from '../components/StatusStamp';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

export default function Policies() {
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'AGENT';
  const [policies, setPolicies] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ customerId: '', policyType: '', policyNumber: '', premiumAmount: '', startDate: '', endDate: '' });

  const [renewing, setRenewing] = useState(null);
  const [renewEndDate, setRenewEndDate] = useState('');
  const [renewError, setRenewError] = useState('');

  const [expiring, setExpiring] = useState([]);

  async function load() {
    const { data } = await api.get('/policies', { params: { page, limit, ...(statusFilter ? { status: statusFilter } : {}) } });
    setPolicies(data.data);
    setTotal(data.total);
  }

  async function loadExpiring() {
    if (!canManage) return;
    try {
      const { data } = await api.get('/policies/expiring', { params: { days: 30 } });
      setExpiring(data);
    } catch {
      /* non-critical */
    }
  }

  useEffect(() => { load(); }, [page, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { loadExpiring(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/policies', form);
      setShowModal(false);
      load();
      loadExpiring();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create policy');
    }
  }

  async function handleCancel(policy) {
    if (!window.confirm(`Cancel policy ${policy.policyNumber}?`)) return;
    await api.patch(`/policies/${policy.id}/cancel`);
    load();
    loadExpiring();
  }

  function openRenew(policy) {
    setRenewing(policy);
    const current = new Date(policy.endDate);
    current.setFullYear(current.getFullYear() + 1);
    setRenewEndDate(current.toISOString().slice(0, 10));
    setRenewError('');
  }

  async function handleRenewSave(e) {
    e.preventDefault();
    setRenewError('');
    try {
      await api.put(`/policies/${renewing.id}`, { endDate: renewEndDate, status: 'ACTIVE' });
      setRenewing(null);
      load();
      loadExpiring();
    } catch (err) {
      setRenewError(err.response?.data?.message || 'Could not renew policy');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Policies</h1>
        {canManage && <button className="btn-primary" onClick={() => setShowModal(true)}>+ Create policy</button>}
      </div>

      {canManage && expiring.length > 0 && (
        <div className="card mb-4 border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            {expiring.length} polic{expiring.length === 1 ? 'y is' : 'ies are'} expiring within 30 days:
          </p>
          <ul className="mt-1 list-inside list-disc text-sm text-amber-700">
            {expiring.slice(0, 5).map((p) => (
              <li key={p.id}>{p.policyNumber} — {p.customer?.name} (expires {new Date(p.endDate).toLocaleDateString()})</li>
            ))}
          </ul>
        </div>
      )}

      <select className="input mb-4 max-w-xs" value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
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
          ...(canManage
            ? [{
                key: 'actions',
                label: '',
                render: (r) =>
                  r.status !== 'CANCELLED' ? (
                    <div className="flex gap-3">
                      <button className="text-sm font-semibold text-brand-600" onClick={() => openRenew(r)}>Renew</button>
                      <button className="text-sm font-semibold text-rose-600" onClick={() => handleCancel(r)}>Cancel</button>
                    </div>
                  ) : null,
              }]
            : []),
        ]}
        rows={policies}
      />

      <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />

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

      <Modal open={!!renewing} onClose={() => setRenewing(null)} title={`Renew ${renewing?.policyNumber || ''}`}>
        {renewError && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{renewError}</p>}
        <form onSubmit={handleRenewSave} className="space-y-3">
          <p className="text-sm text-slate-500">Current expiry: {renewing && new Date(renewing.endDate).toLocaleDateString()}</p>
          <div><label className="label">New end date</label><input required type="date" className="input" value={renewEndDate} onChange={(e) => setRenewEndDate(e.target.value)} /></div>
          <button type="submit" className="btn-primary w-full">Confirm renewal</button>
        </form>
      </Modal>
    </div>
  );
}