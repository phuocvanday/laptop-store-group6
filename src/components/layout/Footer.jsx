export default function Footer() {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <div className="container text-center">
        <div className="row mb-3">
          <div className="col-md-4 mb-3 mb-md-0">
            <h5>LaptopStore</h5>
            <p className="text-muted small">
              Hệ thống cung cấp laptop chính hãng hàng đầu với giá cả hợp lý và chất lượng đảm bảo.
            </p>
          </div>
          <div className="col-md-4 mb-3 mb-md-0">
            <h5>Liên kết nhanh</h5>
            <ul className="list-unstyled small">
              <li><a href="/" className="text-decoration-none text-muted">Trang chủ</a></li>
              <li><a href="/catalog" className="text-decoration-none text-muted">Danh mục laptop</a></li>
              <li><a href="/cart" className="text-decoration-none text-muted">Giỏ hàng</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5>Hỗ trợ khách hàng</h5>
            <p className="text-muted small mb-1">Hotline: 1900 xxxx</p>
            <p className="text-muted small">Email: support@laptopstore.vn</p>
          </div>
        </div>
        <hr className="border-secondary" />
        <p className="mb-0 text-muted small">
          &copy; {new Date().getFullYear()} LaptopStore. All rights reserved.
        </p>
      </div>
    </footer>
  );
}