import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '' });
  const [editError, setEditError] = useState('');

  async function load() {
    const { data } = await api.get('/customers', { params: { search, page, limit } });
    setCustomers(data.data);
    setTotal(data.total);
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

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

  function openEdit(customer) {
    setEditing(customer);
    setEditForm({ name: customer.name || '', phone: customer.phone || '', address: customer.address || '' });
    setEditError('');
  }

  async function handleEditSave(e) {
    e.preventDefault();
    setEditError('');
    try {
      await api.put(`/customers/${editing.id}`, editForm);
      setEditing(null);
      load();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Could not update customer');
    }
  }

  async function handleDelete(customer) {
    if (!window.confirm(`Delete ${customer.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/customers/${customer.id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete customer (it may have linked policies)');
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
        onChange={(e) => { setPage(1); setSearch(e.target.value); }}
      />

      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'policies', label: 'Policies', render: (r) => r.policies?.length ?? 0 },
          {
            key: 'actions',
            label: '',
            render: (r) => (
              <div className="flex gap-3">
                <Link className="text-sm font-semibold text-brand-600" to={`/customers/${r.id}`}>View</Link>
                <button className="text-sm font-semibold text-slate-600" onClick={() => openEdit(r)}>Edit</button>
                <button className="text-sm font-semibold text-rose-600" onClick={() => handleDelete(r)}>Delete</button>
              </div>
            ),
          },
        ]}
        rows={customers}
      />

      <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />

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

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit ${editing?.name || ''}`}>
        {editError && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{editError}</p>}
        <form onSubmit={handleEditSave} className="space-y-3">
          <div><label className="label">Name</label><input required className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
          <div><label className="label">Phone</label><input className="input" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
          <div><label className="label">Address</label><input className="input" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} /></div>
          <button type="submit" className="btn-primary w-full">Save changes</button>
        </form>
      </Modal>
    </div>
  );
}