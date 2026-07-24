import { useEffect, useState } from 'react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [entityType, setEntityType] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  async function load() {
    const { data } = await api.get('/audit-logs', {
      params: { page, limit, ...(entityType ? { entityType } : {}) },
    });
    setLogs(data.data);
    setTotal(data.total);
  }
  useEffect(() => { load(); }, [page, entityType]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink dark:text-white">Audit logs</h1>
      <select className="input mb-4 max-w-xs" value={entityType} onChange={(e) => { setPage(1); setEntityType(e.target.value); }}>
        <option value="">All entities</option>
        <option value="Policy">Policy</option>
        <option value="Claim">Claim</option>
      </select>
      <DataTable
        columns={[
          { key: 'createdAt', label: 'When', render: (r) => new Date(r.createdAt).toLocaleString() },
          { key: 'entityType', label: 'Entity' },
          { key: 'entityId', label: 'ID' },
          { key: 'action', label: 'Action' },
          { key: 'performedByName', label: 'By' },
        ]}
        rows={logs}
      />
      <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
    </div>
  );
}