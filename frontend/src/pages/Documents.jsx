import { useEffect, useState } from 'react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import DocumentUploader from '../components/DocumentUploader';

export default function Documents() {
  const [documents, setDocuments] = useState([]);

  async function load() {
    const { data } = await api.get('/documents');
    setDocuments(data);
  }
  useEffect(() => { load(); }, []);

  async function handleDownload(id, fileName) {
    const res = await api.get(`/documents/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold text-ink">Documents</h1>

      <div className="card mb-6 p-4">
        <DocumentUploader onUploaded={load} />
      </div>

      <DataTable
        columns={[
          { key: 'fileName', label: 'File' },
          { key: 'documentType', label: 'Type' },
          { key: 'uploadedAt', label: 'Uploaded', render: (r) => new Date(r.uploadedAt).toLocaleDateString() },
          { key: 'actions', label: '', render: (r) => <button className="text-sm font-semibold text-brand-600" onClick={() => handleDownload(r.id, r.fileName)}>Download</button> },
        ]}
        rows={documents}
      />
    </div>
  );
}