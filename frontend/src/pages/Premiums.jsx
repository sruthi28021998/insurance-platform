import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import StatusStamp from '../components/StatusStamp';
import Modal from '../components/Modal';

export default function Premiums() {
  const { user } = useAuth();
  const isCustomer = user?.role === 'CUSTOMER';
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ policyId: '', amount: '' });
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get('/premiums');
    setPayments(data.data);
  }
  useEffect(() => { load(); }, []);

  async function handlePay(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/premiums', form);
      setShowModal(false);
      setForm({ policyId: '', amount: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">{isCustomer ? 'My payments' : 'Premium payments'}</h1>
        {isCustomer && <button className="btn-primary" onClick={() => setShowModal(true)}>+ Pay premium</button>}
      </div>

      <DataTable
        columns={[
          { key: 'policy', label: 'Policy', render: (r) => r.policy?.policyNumber },
          { key: 'customer', label: 'Customer', render: (r) => r.policy?.customer?.name || '—' },
          { key: 'amount', label: 'Amount', render: (r) => `₹${r.amount.toLocaleString()}` },
          { key: 'paymentDate', label: 'Date', render: (r) => new Date(r.paymentDate).toLocaleDateString() },
          { key: 'paymentStatus', label: 'Status', render: (r) => <StatusStamp status={r.paymentStatus} /> },
        ]}
        rows={payments}
      />

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Pay a premium">
        {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <form onSubmit={handlePay} className="space-y-3">
          <div><label className="label">Policy ID</label><input required className="input" value={form.policyId} onChange={(e) => setForm({ ...form, policyId: e.target.value })} /></div>
          <div><label className="label">Amount</label><input required type="number" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
          <button type="submit" className="btn-primary w-full">Pay now</button>
        </form>
      </Modal>
    </div>
  );
}