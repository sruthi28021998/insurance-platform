import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import StatusStamp from '../components/StatusStamp';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import DocumentUploader from '../components/DocumentUploader';

export default function Claims() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const canReview = user?.role === 'ADMIN' || user?.role === 'AGENT';
  const [claims, setClaims] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [agents, setAgents] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ policyId: '', claimAmount: '', reason: '' });
  const [error, setError] = useState('');

  const [viewingClaim, setViewingClaim] = useState(null);
  const [claimDocs, setClaimDocs] = useState([]);

  async function load() {
    const { data } = await api.get('/claims', {
      params: { page, limit, ...(statusFilter ? { status: statusFilter } : {}) },
    });
    setClaims(data.data);
    setTotal(data.total);
  }
  useEffect(() => { load(); }, [page, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isAdmin) api.get('/auth/employees').then((res) => setAgents(res.data.filter((e) => e.role === 'AGENT')));
  }, [isAdmin]);

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

  async function handleAssign(claimId, agentId) {
    if (!agentId) return;
    await api.patch(`/claims/${claimId}/assign`, { agentId });
    load();
  }

  async function openDocs(claim) {
    setViewingClaim(claim);
    const { data } = await api.get('/documents', { params: { claimId: claim.id } });
    setClaimDocs(data);
  }

  async function reloadDocs() {
    if (!viewingClaim) return;
    const { data } = await api.get('/documents', { params: { claimId: viewingClaim.id } });
    setClaimDocs(data);
  }

  function agentName(id) {
    const a = agents.find((ag) => ag.id === id);
    return a ? a.name : '—';
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">{canReview ? 'Claims' : 'My claims'}</h1>
        {!canReview && <button className="btn-primary" onClick={() => setShowModal(true)}>+ Submit claim</button>}
      </div>

      <select className="input mb-4 max-w-xs" value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
        <option value="">All statuses</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
      </select>

      <DataTable
        columns={[
          { key: 'id', label: 'Claim #' },
          { key: 'policy', label: 'Policy', render: (r) => r.policy?.policyNumber },
          { key: 'customer', label: 'Customer', render: (r) => r.policy?.customer?.name || '—' },
          { key: 'claimAmount', label: 'Amount', render: (r) => `₹${r.claimAmount.toLocaleString()}` },
          { key: 'reason', label: 'Reason' },
          { key: 'status', label: 'Status', render: (r) => <StatusStamp status={r.status} /> },
          { key: 'docs', label: 'Documents', render: (r) => <button className="text-sm font-semibold text-brand-600" onClick={() => openDocs(r)}>View / Upload</button> },
          ...(isAdmin
            ? [{
                key: 'assign',
                label: 'Assigned to',
                render: (r) => (
                  <select
                    className="input"
                    value={r.assignedAgentId || ''}
                    onChange={(e) => handleAssign(r.id, e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                ),
              }]
            : canReview
            ? [{ key: 'assignedTo', label: 'Assigned to', render: (r) => agentName(r.assignedAgentId) }]
            : []),
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

      <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Submit a claim">
        {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <form onSubmit={handleSubmitClaim} className="space-y-3">
          <div><label className="label">Policy ID</label><input required className="input" value={form.policyId} onChange={(e) => setForm({ ...form, policyId: e.target.value })} /></div>
          <div><label className="label">Claim amount</label><input required type="number" className="input" value={form.claimAmount} onChange={(e) => setForm({ ...form, claimAmount: e.target.value })} /></div>
          <div><label className="label">Reason</label><textarea required className="input" rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
          <button type="submit" className="btn-primary w-full">Submit claim</button>
        </form>
      </Modal>

      <Modal open={!!viewingClaim} onClose={() => setViewingClaim(null)} title={`Documents for claim #${viewingClaim?.id || ''}`}>
        <div className="mb-4">
          <DocumentUploader claimId={viewingClaim?.id} onUploaded={reloadDocs} />
        </div>
        <ul className="space-y-2 text-sm">
          {claimDocs.length === 0 && <li className="text-slate-400">No documents attached yet.</li>}
          {claimDocs.map((d) => (
            <li key={d.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
              <span>{d.fileName} <span className="text-xs text-slate-400">({d.documentType})</span></span>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}