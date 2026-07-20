import { useEffect, useState } from 'react';
import api from '../api/axios';
import DataTable from '../components/DataTable';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get('/documents');
    setDocuments(data);
  }
  useEffect(() => { load(); }, []);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setError('');
    const body = new FormData();
    body.append('file', file);
    try {
      await api.post('/documents/upload', body, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFile(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  }

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

      <form onSubmit={handleUpload} className="card mb-6 flex items-center gap-3 p-4">
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} className="text-sm" />
        <button type="submit" className="btn-primary">Upload</button>
      </form>
      {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <DataTable
        columns={[
          { key: 'fileName', label: 'File' },
          { key: 'uploadedAt', label: 'Uploaded', render: (r) => new Date(r.uploadedAt).toLocaleDateString() },
          { key: 'actions', label: '', render: (r) => <button className="text-sm font-semibold text-brand-600" onClick={() => handleDownload(r.id, r.fileName)}>Download</button> },
        ]}
        rows={documents}
      />
    </div>
  );
}