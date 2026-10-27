export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 12,
  onPageChange,
}) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="d-flex justify-content-center my-4">
      <ul className="pagination mb-0">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo;
          </button>
        </li>
        {pages.map((page) => (
          <li
            key={page}
            className={`page-item ${page === currentPage ? 'active' : ''}`}
          >
            <button className="page-link" onClick={() => onPageChange(page)}>
              {page}
            </button>
          </li>
        ))}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
}