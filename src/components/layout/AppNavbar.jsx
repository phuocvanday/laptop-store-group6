import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import SearchSuggest from './SearchSuggest';

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const { totalQuantity } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          LaptopStore
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Trang chủ
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/laptops">
                Sản phẩm
              </NavLink>
            </li>
          </ul>

          <div className="mx-lg-3 flex-grow-1 search-wrapper">
            <SearchSuggest />
          </div>

          <div className="d-flex align-items-center gap-3">
            <Link to="/cart" className="btn btn-outline-light position-relative btn-sm">
              <i className="bi bi-cart"></i> Giỏ hàng
              {totalQuantity > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {totalQuantity}
                </span>
              )}
            </Link>

            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="primary"
                  size="sm"
                  id="userDropdown"
                  className="d-flex align-items-center"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {user.fullName || user.username || 'Tài khoản'}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {user.role === 'admin' && (
                    <Dropdown.Item as={Link} to="/admin/laptops">
                      Quản trị hệ thống
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item as={Link} to="/orders">
                    Đơn hàng của tôi
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item as="button" className="text-danger" onClick={handleLogout}>
                    Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Link to="/login" className="btn btn-outline-primary btn-sm">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}