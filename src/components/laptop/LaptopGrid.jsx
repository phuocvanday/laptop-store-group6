import LaptopCard from './LaptopCard';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';

export default function LaptopGrid({ laptops = [], loading = false, onAddToCart }) {
  if (loading) {
    return (
      <div className="py-5 text-center">
        <LoadingSpinner message="Đang tải danh sách sản phẩm..." />
      </div>
    );
  }

  if (!laptops || laptops.length === 0) {
    return (
      <EmptyState
        title="Không tìm thấy sản phẩm"
        message="Không có laptop nào phù hợp với bộ lọc hiện tại."
      />
    );
  }

  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
      {laptops.map((laptop) => (
        <div className="col" key={laptop.id}>
          <LaptopCard laptop={laptop} onAddToCart={onAddToCart} />
        </div>
      ))}
    </div>
  );
}