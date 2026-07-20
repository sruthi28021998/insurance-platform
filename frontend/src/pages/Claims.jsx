import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import StatusStamp from '../components/StatusStamp';
import Modal from '../components/Modal';

export default function Claims() {
  const { user } = useAuth();
  const canReview = user?.role === 'ADMIN' || user?.role === 'AGENT';
  const [claims, setClaims] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ policyId: '', claimAmount: '', reason: '' });
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get('/claims');
    setClaims(data.data);
  }
  useEffect(() => { load(); }, []);

  async function handleSubmitClaim(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/claims', form);
      setShowModal(false);
      setForm({ policyId: '', claimAmount: '', reason: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit claim');
    }
  }

  async function handleReview(id, status) {
    await api.patch(`/claims/${id}/review`, { status });
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">{canReview ? 'Claims' : 'My claims'}</h1>
        {!canReview && <button className="btn-primary" onClick={() => setShowModal(true)}>+ Submit claim</button>}
      </div>

      <DataTable
        columns={[
          { key: 'id', label: 'Claim #' },
          { key: 'policy', label: 'Policy', render: (r) => r.policy?.policyNumber },
          { key: 'customer', label: 'Customer', render: (r) => r.policy?.customer?.name || '—' },
          { key: 'claimAmount', label: 'Amount', render: (r) => `₹${r.claimAmount.toLocaleString()}` },
          { key: 'reason', label: 'Reason' },
          { key: 'status', label: 'Status', render: (r) => <StatusStamp status={r.status} /> },
          ...(canReview
            ? [{
                key: 'actions',
                label: '',
                render: (r) =>
                  r.status === 'PENDING' ? (
                    <div className="flex gap-2">
                      <button className="text-sm font-semibold text-emerald-600" onClick={() => handleReview(r.id, 'APPROVED')}>Approve</button>
                      <button className="text-sm font-semibold text-rose-600" onClick={() => handleReview(r.id, 'REJECTED')}>Reject</button>
                    </div>
                  ) : null,
              }]
            : []),
        ]}
        rows={claims}
      />

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Submit a claim">
        {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <form onSubmit={handleSubmitClaim} className="space-y-3">
          <div><label className="label">Policy ID</label><input required className="input" value={form.policyId} onChange={(e) => setForm({ ...form, policyId: e.target.value })} /></div>
          <div><label className="label">Claim amount</label><input required type="number" className="input" value={form.claimAmount} onChange={(e) => setForm({ ...form, claimAmount: e.target.value })} /></div>
          <div><label className="label">Reason</label><textarea required className="input" rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
          <button type="submit" className="btn-primary w-full">Submit claim</button>
        </form>
      </Modal>
    </div>
  );
}