import { useState } from 'react';
import { Alert, Button, Card, Col, Form, Image, Row, Spinner, Table } from 'react-bootstrap';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import usePageTitle from '../hooks/usePageTitle';
import { formatPrice, getSellingPrice } from '../utils/format';
import { handleImageError } from '../utils/image';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Validate thông tin đơn hàng theo tiêu chuẩn E5
 */
const validate = ({ fullName, phone, address }) => {
  const errors = {};
  if (!fullName.trim()) {
    errors.fullName = 'Họ tên không được để trống';
  }
  if (!phone.trim()) {
    errors.phone = 'Số điện thoại không được để trống';
  } else if (!/^0\d{9}$/.test(phone.trim())) {
    errors.phone = 'Số điện thoại không hợp lệ (10 chữ số bắt đầu bằng 0)';
  }
  if (!address.trim()) {
    errors.address = 'Địa chỉ nhận hàng không được để trống';
  }
  return errors;
};

export default function CheckoutPage() {
  usePageTitle('Thanh toán');
  const { user } = useAuth();
  const { items, totalPrice, loading, clearLocal } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: '',
    address: '',
    note: '',
  });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Chưa đăng nhập → chuyển về /login kèm vị trí quay lại
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Đang tải dữ liệu giỏ hàng ban đầu
  if (loading && items.length === 0) {
    return <LoadingSpinner text="Đang tải thông tin giỏ hàng..." />;
  }

  // Giỏ rỗng vào /checkout → tự động quay về /cart
  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const errors = validate(form);
  // E5: Chỉ hiện thông báo lỗi khi đã chạm vào ô (blur) hoặc sau khi bấm Đặt hàng
  const showError = (field) => (touched[field] || submitted) && errors[field];

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setError(null);
    // Logic 5 bước sẽ được kết nối ở commit tiếp theo
  };

  return (
    <div className="py-2">
      <h3 className="fw-bold mb-4">Thông tin thanh toán & Đặt hàng</h3>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      <Form noValidate onSubmit={handleSubmit}>
        <Row className="g-4">
          {/* Cột trái: Thông tin nhận hàng */}
          <Col md={7}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-white fw-bold py-3 fs-5">
                Thông tin giao hàng
              </Card.Header>
              <Card.Body className="p-4">
                <Form.Group className="mb-3" controlId="checkout-fullname">
                  <Form.Label>
                    Họ và tên người nhận <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    name="fullName"
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={form.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={Boolean(showError('fullName'))}
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">{errors.fullName}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="checkout-phone">
                  <Form.Label>
                    Số điện thoại liên hệ <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    name="phone"
                    type="tel"
                    placeholder="Ví dụ: 0912345678"
                    value={form.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={Boolean(showError('phone'))}
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="checkout-address">
                  <Form.Label>
                    Địa chỉ nhận hàng <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    name="address"
                    as="textarea"
                    rows={3}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    value={form.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={Boolean(showError('address'))}
                    disabled={submitting}
                  />
                  <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-0" controlId="checkout-note">
                  <Form.Label>Ghi chú đơn hàng (tuỳ chọn)</Form.Label>
                  <Form.Control
                    name="note"
                    as="textarea"
                    rows={2}
                    placeholder="Giao giờ hành chính, gọi trước khi giao..."
                    value={form.note}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Cột phải: Tóm tắt đơn hàng */}
          <Col md={5}>
            <Card className="shadow-sm border-0 sticky-top" style={{ top: '1.5rem' }}>
              <Card.Header className="bg-white fw-bold py-3 fs-5 d-flex justify-content-between align-items-center">
                <span>Tóm tắt đơn hàng</span>
                <span className="badge bg-secondary">{items.length} món</span>
              </Card.Header>
              <Card.Body className="p-3">
                <Table responsive borderless className="align-middle mb-0">
                  <tbody>
                    {items.map((item) => {
                      const price = getSellingPrice(item.laptop);
                      return (
                        <tr key={item.id} className="border-bottom">
                          <td style={{ width: 56 }}>
                            <Image
                              src={item.laptop?.image}
                              alt=""
                              width={48}
                              height={48}
                              rounded
                              className="border object-fit-cover"
                              onError={handleImageError}
                            />
                          </td>
                          <td>
                            <div className="fw-semibold text-truncate" style={{ maxWidth: 180 }}>
                              {item.laptop?.name || 'Sản phẩm'}
                            </div>
                            <small className="text-muted">
                              {formatPrice(price)} × {item.quantity}
                            </small>
                          </td>
                          <td className="text-end fw-semibold text-nowrap">
                            {formatPrice(price * item.quantity)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>

                <div className="mt-3 pt-2">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Tạm tính:</span>
                    <span className="fw-semibold">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Phí vận chuyển:</span>
                    <span className="text-success fw-semibold">Miễn phí</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fs-5 fw-bold">Tổng cộng:</span>
                    <span className="fs-4 fw-bold text-danger">{formatPrice(totalPrice)}</span>
                  </div>

                  <Button
                    type="submit"
                    variant="danger"
                    size="lg"
                    className="w-100 py-2 fw-semibold"
                    disabled={submitting || items.length === 0}
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Đang xử lý đơn hàng...
                      </>
                    ) : (
                      'Đặt hàng ngay'
                    )}
                  </Button>

                  <div className="text-center mt-3">
                    <Button as={Link} to="/cart" variant="link" className="text-decoration-none text-muted small p-0">
                      ← Quay lại giỏ hàng
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
