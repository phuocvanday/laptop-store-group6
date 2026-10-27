import { Link } from 'react-router-dom';
import { formatPrice, getFinalPrice } from '../../utils/format';
import Badge from '../common/Badge';

export default function LaptopCard({ laptop, onAddToCart }) {
  if (!laptop) return null;

  const finalPrice = getFinalPrice(laptop.price, laptop.discount);
  const hasDiscount = laptop.discount && laptop.discount > 0;

  return (
    <div className="card h-100 shadow-sm border-0 position-relative">
      {hasDiscount && (
        <span className="position-absolute top-0 start-0 m-2">
          <Badge variant="danger">-{laptop.discount}%</Badge>
        </span>
      )}

      <img
        src={laptop.image || 'https://via.placeholder.com/300x200?text=No+Image'}
        className="card-img-top p-3"
        alt={laptop.name}
        style={{ height: '200px', objectFit: 'contain' }}
      />

      <div className="card-body d-flex flex-column">
        <h6 className="card-subtitle mb-2 text-muted small">{laptop.brand}</h6>
        <h5 className="card-title fs-6 fw-bold text-truncate" title={laptop.name}>
          <Link to={`/laptops/${laptop.id}`} className="text-decoration-none text-dark">
            {laptop.name}
          </Link>
        </h5>

        <div className="mb-2 small text-muted">
          <div><i className="bi bi-cpu me-1"></i>{laptop.cpu || 'N/A'}</div>
          <div><i className="bi bi-memory me-1"></i>{laptop.ram || 'N/A'} - {laptop.storage || 'N/A'}</div>
        </div>

        <div className="mt-auto pt-2">
          <div className="d-flex align-items-baseline gap-2 mb-2">
            <span className="text-danger fw-bold fs-5">
              {formatPrice(finalPrice)}
            </span>
            {hasDiscount && (
              <span className="text-muted text-decoration-line-through small">
                {formatPrice(laptop.price)}
              </span>
            )}
          </div>

          <div className="d-grid gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => onAddToCart && onAddToCart(laptop)}
            >
              <i className="bi bi-cart-plus me-1"></i> Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}