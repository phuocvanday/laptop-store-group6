import { useCallback, useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Image, Row, Table } from 'react-bootstrap';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import usePageTitle from '../hooks/usePageTitle';
import orderApi from '../api/orderApi';
import { getErrorMessage, isCancel } from '../api/axiosClient';
import { formatDate, formatPrice } from '../utils/format';
import { handleImageError } from '../utils/image';
import { getOrderStatusInfo } from '../utils/orderStatus';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

export default function OrderListPage() {
  usePageTitle('Đơn hàng của tôi');
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Đọc location.state.message → Toast, rồi xoá state (F5 không hiện lại)
  useEffect(() => {
    if (location.state?.message) {
      showToast(location.state.message, 'success');
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showToast]);

  // Tải danh sách đơn hàng của user (mới nhất trước)
  const loadOrders = useCallback(async (signal) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await orderApi.getByUser(user.id, signal);
      const list = Array.isArray(data) ? [...data] : [];
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(list);
    } catch (err) {
      if (isCancel(err)) return;
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const controller = new AbortController();
    loadOrders(controller.signal);
    return () => controller.abort();
  }, [loadOrders]);

  // Chưa đăng nhập → chuyển về /login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (loading) {
    return <LoadingSpinner text="Đang tải danh sách đơn hàng của bạn..." />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={() => loadOrders()} />;
  }

  if (orders.length === 0) {
    return (
      <div className="py-3">
        <h3 className="fw-bold mb-4">Đơn hàng của tôi</h3>
        <EmptyState
          title="Chưa có đơn hàng nào"
          message="Bạn chưa đặt đơn hàng nào. Hãy khám phá và mua sắm ngay!"
          actionText="Khám phá laptop"
          onAction={() => navigate('/laptops')}
        />
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Đơn hàng của tôi</h3>
        <span className="text-muted">Tổng cộng: {orders.length} đơn hàng</span>
      </div>

      <div className="d-flex flex-column gap-4">
        {orders.map((order) => {
          const statusInfo = getOrderStatusInfo(order.status);
          const customerName = order.fullName || order.customerName || user.fullName;
          const customerPhone = order.phone || order.customerPhone || 'Chưa cập nhật';
          const customerAddress = order.address || order.customerAddress || 'Chưa cập nhật';

          return (
            <Card key={order.id} className="shadow-sm border-0 overflow-hidden">
              <Card.Header className="bg-light py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div className="d-flex align-items-center gap-3">
                  <span className="fw-bold fs-5 text-dark">Đơn hàng #{order.id}</span>
                  <span className="text-muted small">
                    Ngày đặt: {formatDate(order.createdAt)}
                  </span>
                </div>
                <div>
                  <Badge bg={statusInfo.variant} className="px-3 py-2 fs-6">
                    {statusInfo.label}
                  </Badge>
                </div>
              </Card.Header>

              <Card.Body className="p-4">
                {/* Thông tin người nhận */}
                <div className="p-3 bg-light rounded mb-3 small">
                  <Row className="gy-2">
                    <Col sm={6} md={4}>
                      <span className="text-muted">Người nhận: </span>
                      <strong>{customerName}</strong>
                    </Col>
                    <Col sm={6} md={4}>
                      <span className="text-muted">SĐT: </span>
                      <strong>{customerPhone}</strong>
                    </Col>
                    <Col sm={12} md={4}>
                      <span className="text-muted">Địa chỉ: </span>
                      <span>{customerAddress}</span>
                    </Col>
                    {order.note && (
                      <Col xs={12}>
                        <span className="text-muted">Ghi chú: </span>
                        <em>"{order.note}"</em>
                      </Col>
                    )}
                  </Row>
                </div>

                {/* Bảng sản phẩm trong đơn */}
                <Table responsive hover className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Sản phẩm</th>
                      <th className="text-end">Đơn giá</th>
                      <th className="text-center">Số lượng</th>
                      <th className="text-end">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.items || []).map((item) => {
                      const laptopName = item.laptop?.name || item.name || 'Sản phẩm';
                      const laptopImage = item.laptop?.image || item.image;
                      const linePrice = (item.price || 0) * item.quantity;

                      return (
                        <tr key={item.id || item.laptopId}>
                          <td style={{ minWidth: 220 }}>
                            <div className="d-flex align-items-center gap-3">
                              <Image
                                src={laptopImage}
                                alt=""
                                width={56}
                                height={56}
                                rounded
                                className="border object-fit-cover"
                                onError={handleImageError}
                              />
                              <div>
                                <Link
                                  to={`/laptops/${item.laptopId}`}
                                  className="text-decoration-none fw-semibold text-dark"
                                >
                                  {laptopName}
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td className="text-end text-nowrap">{formatPrice(item.price)}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end fw-semibold text-nowrap">
                            {formatPrice(linePrice)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card.Body>

              <Card.Footer className="bg-white py-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                  {/* Nút hủy đơn sẽ được kết nối ở commit tiếp theo */}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted">Tổng cộng:</span>
                  <strong className="fs-4 text-danger">{formatPrice(order.total)}</strong>
                </div>
              </Card.Footer>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
