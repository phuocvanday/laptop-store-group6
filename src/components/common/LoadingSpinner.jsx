export default function LoadingSpinner({ text = 'Đang tải dữ liệu...' }) {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center py-5">
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted mb-0">{text}</p>
    </div>
  );
}