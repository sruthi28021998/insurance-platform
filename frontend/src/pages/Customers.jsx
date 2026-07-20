import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get('/customers', { params: { search } });
    setCustomers(data.data);
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/customers', form);
      setShowModal(false);
      setForm({ name: '', email: '', phone: '', address: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create customer');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Customers</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Register customer</button>
      </div>

      <input
        className="input mb-4 max-w-sm"
        placeholder="Search by name, email, or phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'policies', label: 'Policies', render: (r) => r.policies?.length ?? 0 },
          { key: 'actions', label: '', render: (r) => <Link className="text-sm font-semibold text-brand-600" to={`/customers/${r.id}`}>View</Link> },
        ]}
        rows={customers}
      />

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Register a new customer">
        {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <form onSubmit={handleCreate} className="space-y-3">
          <div><label className="label">Name</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Email</label><input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="label">Address</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <button type="submit" className="btn-primary w-full">Save customer</button>
        </form>
      </Modal>
    </div>
  );
}