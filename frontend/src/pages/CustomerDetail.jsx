import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import StatusStamp from '../components/StatusStamp';
import DataTable from '../components/DataTable';

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    api.get(`/customers/${id}`).then((res) => setCustomer(res.data));
  }, [id]);

  if (!customer) return <p className="text-slate-500">Loading…</p>;

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold text-ink">{customer.name}</h1>
      <p className="mb-6 text-sm text-slate-500">{customer.email} · {customer.phone}</p>

      <h2 className="mb-3 font-display text-lg font-semibold text-ink">Policy history</h2>
      <DataTable
        columns={[
          { key: 'policyType', label: 'Type' },
          { key: 'policyNumber', label: 'Policy #' },
          { key: 'premiumAmount', label: 'Premium', render: (r) => `₹${r.premiumAmount.toLocaleString()}` },
          { key: 'status', label: 'Status', render: (r) => <StatusStamp status={r.status} /> },
        ]}
        rows={customer.policies}
      />

      <h2 className="mb-3 mt-8 font-display text-lg font-semibold text-ink">Documents</h2>
      <DataTable
        columns={[
          { key: 'fileName', label: 'File' },
          { key: 'uploadedAt', label: 'Uploaded', render: (r) => new Date(r.uploadedAt).toLocaleDateString() },
        ]}
        rows={customer.documents}
      />
    </div>
  );
}