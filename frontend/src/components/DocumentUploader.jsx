import { useState } from 'react';
import api from '../api/axios';

// Shared upload form used by the Documents page and the per-claim documents modal.
export default function DocumentUploader({ claimId, customerId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('OTHER');
  const [error, setError] = useState('');

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setError('');
    const body = new FormData();
    body.append('file', file);
    body.append('documentType', docType);
    if (claimId) body.append('claimId', claimId);
    if (customerId) body.append('customerId', customerId);
    try {
      await api.post('/documents/upload', body, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFile(null);
      onUploaded?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  }

  return (
    <form onSubmit={handleUpload} className="flex flex-wrap items-center gap-2">
      <select className="input w-auto" value={docType} onChange={(e) => setDocType(e.target.value)}>
        <option value="IDENTITY">Identity document</option>
        <option value="POLICY">Policy document</option>
        <option value="CLAIM">Claim document</option>
        <option value="OTHER">Other</option>
      </select>
      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} className="text-sm" />
      <button type="submit" className="btn-primary">Upload</button>
      {error && <p className="w-full text-sm text-rose-600">{error}</p>}
    </form>
  );
}