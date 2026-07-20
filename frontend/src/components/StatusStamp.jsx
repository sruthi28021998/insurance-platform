export default function StatusStamp({ status }) {
  const key = (status || '').toLowerCase();
  return <span className={`stamp stamp-${key}`}>{status}</span>;
}