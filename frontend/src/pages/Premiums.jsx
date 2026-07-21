import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import StatusStamp from '../components/StatusStamp';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

export default function Premiums() {
  const { user } = useAuth();
  const isCustomer = user?.role === 'CUSTOMER';
  const canManage = user?.role === 'ADMIN' || user?.role === 'AGENT';

  const [payments, setPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [overdue, setOverdue] = useState([]);

  const [showPayModal, setShowPayModal] = useState(false);
  const [payForm, setPayForm] = useState({ policyId: '', amount: '' });

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ policyId: '', amount: '', dueDate: '' });

  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get('/premiums', {
      params: { page, limit, ...(statusFilter ? { status: statusFilter } : {}) },
    });
    setPayments(data.data);
    setTotal(data.total);
  }

  async function loadOverdue() {
    if (!canManage) return;
    const { data } = await api.get('/premiums/overdue');
    setOverdue(data);
  }

  useEffect(() => { load(); }, [page, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { loadOverdue(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handlePayNow(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/premiums', payForm);
      setShowPayModal(false);
      setPayForm({ policyId: '', amount: '' });
      load();
      loadOverdue();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    }
  }

  async function handleSchedule(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/premiums/schedule', scheduleForm);
      setShowScheduleModal(false);
      setScheduleForm({ policyId: '', amount: '', dueDate: '' });
      load();
      loadOverdue();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not schedule due premium');
    }
  }

  async function handleMarkPaid(id) {
    await api.patch(`/premiums/${id}/pay`);
    load();
    loadOverdue();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">{isCustomer ? 'My payments' : 'Premium payments'}</h1>
        <div className="flex gap-2">
          {isCustomer && <button className="btn-primary" onClick={() => setShowPayModal(true)}>+ Pay premium</button>}
          {canManage && <button className="btn-secondary" onClick={() => setShowScheduleModal(true)}>+ Schedule due premium</button>}
        </div>
      </div>

      {canManage && overdue.length > 0 && (
        <div className="card mb-4 border-rose-300 bg-rose-50 p-4">
          <p className="text-sm font-semibold text-rose-800">{overdue.length} overdue premium payment{overdue.length === 1 ? '' : 's'}:</p>
          <ul className="mt-1 list-inside list-disc text-sm text-rose-700">
            {overdue.slice(0, 5).map((p) => (
              <li key={p.id}>{p.policy?.policyNumber} — {p.policy?.customer?.name} (due {new Date(p.dueDate).toLocaleDateString()})</li>
            ))}
          </ul>
        </div>
      )}

      <select className="input mb-4 max-w-xs" value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
        <option value="">All statuses</option>
        <option value="PAID">Paid</option>
        <option value="PENDING">Pending</option>
        <option value="OVERDUE">Overdue</option>
      </select>

      <DataTable
        columns={[
          { key: 'policy', label: 'Policy', render: (r) => r.policy?.policyNumber },
          { key: 'customer', label: 'Customer', render: (r) => r.policy?.customer?.name || '—' },
          { key: 'amount', label: 'Amount', render: (r) => `₹${r.amount.toLocaleString()}` },
          { key: 'dueDate', label: 'Due date', render: (r) => new Date(r.dueDate).toLocaleDateString() },
          { key: 'paymentStatus', label: 'Status', render: (r) => <StatusStamp status={r.paymentStatus} /> },
          {
            key: 'actions',
            label: '',
            render: (r) => (r.paymentStatus !== 'PAID' ? <button className="text-sm font-semibold text-emerald-600" onClick={() => handleMarkPaid(r.id)}>Mark paid</button> : null),
          },
        ]}
        rows={payments}
      />

      <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />

      <Modal open={showPayModal} onClose={() => setShowPayModal(false)} title="Pay a premium">
        {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <form onSubmit={handlePayNow} className="space-y-3">
          <div><label className="label">Policy ID</label><input required className="input" value={payForm.policyId} onChange={(e) => setPayForm({ ...payForm, policyId: e.target.value })} /></div>
          <div><label className="label">Amount</label><input required type="number" className="input" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} /></div>
          <button type="submit" className="btn-primary w-full">Pay now</button>
        </form>
      </Modal>

      <Modal open={showScheduleModal} onClose={() => setShowScheduleModal(false)} title="Schedule a due premium">
        {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <form onSubmit={handleSchedule} className="space-y-3">
          <div><label className="label">Policy ID</label><input required className="input" value={scheduleForm.policyId} onChange={(e) => setScheduleForm({ ...scheduleForm, policyId: e.target.value })} /></div>
          <div><label className="label">Amount</label><input required type="number" className="input" value={scheduleForm.amount} onChange={(e) => setScheduleForm({ ...scheduleForm, amount: e.target.value })} /></div>
          <div><label className="label">Due date</label><input required type="date" className="input" value={scheduleForm.dueDate} onChange={(e) => setScheduleForm({ ...scheduleForm, dueDate: e.target.value })} /></div>
          <button type="submit" className="btn-primary w-full">Schedule</button>
        </form>
      </Modal>
    </div>
  );
}