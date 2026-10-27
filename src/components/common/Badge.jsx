export default function Badge({ type = 'primary', children, className = '' }) {
  return (
    <span className={`badge bg-${type} ${className}`}>
      {children}
    </span>
  );
}