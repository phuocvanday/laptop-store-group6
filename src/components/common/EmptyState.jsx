export default function EmptyState({
  title = 'Không tìm thấy kết quả',
  message = 'Vui lòng thử lại với từ khóa hoặc bộ lọc khác.',
  actionText,
  onAction,
}) {
  return (
    <div className="text-center py-5 border rounded bg-light my-3">
      <h5 className="text-secondary">{title}</h5>
      <p className="text-muted mb-3">{message}</p>
      {actionText && onAction && (
        <button className="btn btn-outline-primary btn-sm" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}