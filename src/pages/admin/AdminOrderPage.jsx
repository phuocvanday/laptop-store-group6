import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Form, Image, Modal, Nav, Row, Spinner, Table } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import orderApi from '../../api/orderApi';
import { getErrorMessage, isCancel } from '../../api/axiosClient';
import { useToast } from '../../contexts/ToastContext';
import usePageTitle from '../../hooks/usePageTitle';
import { formatDate, formatPrice } from '../../utils/format';
import { handleImageError } from '../../utils/image';
import { getOrderStatusInfo, ORDER_STATUS_MAP } from '../../utils/orderStatus';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';

export default function AdminOrderPage() {
  usePageTitle('Quản lý đơn hàng');
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || 'all';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Đơn hàng đang được cập nhật trạng thái qua API PATCH
  const [updatingId, setUpdatingId] = useState(null);

  // Modal xem chi tiết đơn hàng
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Tải danh sách đơn hàng từ API (có hỗ trợ lọc theo status nếu khác 'all')
  const loadOrders = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusParam && statusParam !== 'all') {
        params.status = statusParam;
      }

      const data = await orderApi.getAll(params, signal);
      const list = Array.isArray(data) ? [...data] : [];
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(list);
    } catch (err) {
      if (isCancel(err)) return;
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [statusParam]);

  useEffect(() => {
    const controller = new AbortController();
    loadOrders(controller.signal);
    return () => controller.abort();
  }, [loadOrders]);

  // Đồng bộ ?status= lên URL khi bấm chuyển Tab
  const handleSelectTab = (selectedKey) => {
    const next = new URLSearchParams(searchParams);
    if (!selectedKey || selectedKey === 'all') {
      next.delete('status');
    } else {
      next.set('status', selectedKey);
    }
    setSearchParams(next);
  };

  /**
   * BR-06: Đổi trạng thái qua PATCH và chỉ cho phép chuyển sang trạng thái kế tiếp hợp lệ.
   * Đơn 'done' hoặc 'cancelled' không thể đổi được nữa.
   */
  const handleStatusChange = async (order, newStatus) => {
    if (newStatus === order.status) return;

    setUpdatingId(order.id);
    try {
      await orderApi.updateStatus(order.id, newStatus);
      const nextInfo = getOrderStatusInfo(newStatus);

      // Cập nhật state đơn hàng cục bộ
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
      );

      // Cập nhật selectedOrder nếu modal đang mở
      setSelectedOrder((prev) =>
        prev && prev.id === order.id ? { ...prev, status: newStatus } : prev
      );

      showToast(`Đã chuyển đơn #${order.id} sang "${nextInfo.label}"`, 'success');
    } catch (err) {
      showToast(getErrorMessage(err), 'danger');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Quản lý đơn hàng</h3>
          <p className="text-muted small mb-0">
            Theo dõi, lọc theo trạng thái và cập nhật quy trình xử lý đơn hàng
          </p>
        </div>
      </div>

      {/* Tabs lọc theo trạng thái (đồng bộ ?status= trên URL) */}
      <Nav
        variant="pills"
        activeKey={statusParam}
        onSelect={handleSelectTab}
        className="mb-4 gap-2 bg-light p-2 rounded"
      >
        <Nav.Item>
          <Nav.Link eventKey="all" className="fw-semibold">
            Tất cả
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="pending" className="fw-semibold">
            Chờ xử lý
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="shipping" className="fw-semibold">
            Đang giao hàng
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="done" className="fw-semibold">
            Hoàn thành
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="cancelled" className="fw-semibold">
            Đã hủy
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {error && <ErrorAlert message={error} onRetry={() => loadOrders()} />}

      {loading ? (
        <LoadingSpinner text="Đang tải danh sách đơn hàng..." />
      ) : orders.length === 0 ? (
        <EmptyState
          title="Không có đơn hàng nào"
          message={
            statusParam !== 'all'
              ? `Không tìm thấy đơn hàng nào ở trạng thái "${ORDER_STATUS_MAP[statusParam]?.label || statusParam}".`
              : 'Hiện chưa có đơn hàng nào trong hệ thống.'
          }
        />
      ) : (
        <Card className="shadow-sm border-0">
          <Table responsive hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 80 }}>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Số điện thoại</th>
                <th>Ngày đặt</th>
                <th className="text-end">Tổng tiền</th>
                <th className="text-center" style={{ minWidth: 190 }}>
                  Trạng thái (BR-06)
                </th>
                <th className="text-center" style={{ minWidth: 120 }}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusInfo = getOrderStatusInfo(order.status);
                const nextStatuses = statusInfo.next || [];
                const isTerminal = nextStatuses.length === 0; // done hoặc cancelled: không đổi được nữa
                const isUpdating = updatingId === order.id;
                const customerName = order.fullName || order.customerName || 'Khách vãng lai';
                const customerPhone = order.phone || order.customerPhone || 'Chưa có SĐT';

                return (
                  <tr key={order.id}>
                    <td>
                      <strong>#{order.id}</strong>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{customerName}</div>
                      <small className="text-muted text-truncate d-block" style={{ maxWidth: 220 }}>
                        {order.address || order.customerAddress}
                      </small>
                    </td>
                    <td className="text-nowrap">{customerPhone}</td>
                    <td className="text-nowrap text-muted small">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="text-end fw-bold text-danger text-nowrap">
                      {formatPrice(order.total)}
                    </td>
                    <td className="text-center">
                      {isTerminal ? (
                        /* Đơn done hoặc cancelled không đổi được nữa */
                        <Badge bg={statusInfo.variant} className="px-3 py-2 fs-6">
                          {statusInfo.label}
                        </Badge>
                      ) : (
                        /* Form.Select đổi trạng thái chỉ hiện trạng thái kế tiếp hợp lệ (BR-06) */
                        <div className="d-inline-flex align-items-center gap-1">
                          <Form.Select
                            size="sm"
                            value={order.status}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusChange(order, e.target.value)}
                            style={{ width: 'auto', minWidth: 145 }}
                            className={`fw-semibold border-${statusInfo.variant}`}
                            aria-label={`Trạng thái đơn #${order.id}`}
                          >
                            <option value={order.status}>
                              {statusInfo.label}
                            </option>
                            {nextStatuses.map((nextSt) => {
                              const nextInfo = getOrderStatusInfo(nextSt);
                              return (
                                <option key={nextSt} value={nextSt}>
                                  → {nextInfo.label}
                                </option>
                              );
                            })}
                          </Form.Select>
                          {isUpdating && <Spinner size="sm" animation="border" />}
                        </div>
                      )}
                    </td>
                    <td className="text-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Chi tiết ({order.items?.length || 0})
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Modal chi tiết đơn hàng */}
      <Modal
        show={Boolean(selectedOrder)}
        onHide={() => setSelectedOrder(null)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title as="h5">
            Chi tiết đơn hàng #{selectedOrder?.id}{' '}
            {selectedOrder && (
              <Badge
                bg={getOrderStatusInfo(selectedOrder.status).variant}
                className="ms-2 fs-6"
              >
                {getOrderStatusInfo(selectedOrder.status).label}
              </Badge>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedOrder && (
            <>
              <div className="bg-light p-3 rounded mb-4 small">
                <Row className="gy-2">
                  <Col sm={6}>
                    <span className="text-muted">Khách hàng: </span>
                    <strong>
                      {selectedOrder.fullName || selectedOrder.customerName}
                    </strong>
                  </Col>
                  <Col sm={6}>
                    <span className="text-muted">Số điện thoại: </span>
                    <strong>{selectedOrder.phone || selectedOrder.customerPhone}</strong>
                  </Col>
                  <Col sm={6}>
                    <span className="text-muted">Ngày đặt: </span>
                    <span>{formatDate(selectedOrder.createdAt)}</span>
                  </Col>
                  <Col sm={6}>
                    <span className="text-muted">Địa chỉ nhận hàng: </span>
                    <span>{selectedOrder.address || selectedOrder.customerAddress}</span>
                  </Col>
                  {selectedOrder.note && (
                    <Col xs={12}>
                      <span className="text-muted">Ghi chú: </span>
                      <em>"{selectedOrder.note}"</em>
                    </Col>
                  )}
                </Row>
              </div>

              <h6 className="fw-bold mb-3">Danh sách sản phẩm</h6>
              <Table responsive hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Sản phẩm</th>
                    <th className="text-end">Đơn giá</th>
                    <th className="text-center">Số lượng</th>
                    <th className="text-end">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.items || []).map((item) => {
                    const name = item.laptop?.name || item.name || 'Sản phẩm';
                    const image = item.laptop?.image || item.image;
                    const linePrice = (item.price || 0) * item.quantity;

                    return (
                      <tr key={item.id || item.laptopId}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <Image
                              src={image}
                              alt=""
                              width={48}
                              height={48}
                              rounded
                              className="border object-fit-cover"
                              onError={handleImageError}
                            />
                            <div className="fw-semibold">{name}</div>
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

              <div className="d-flex justify-content-end align-items-center gap-2 mt-3 pt-3 border-top">
                <span className="fs-6 text-muted">Tổng cộng đơn hàng:</span>
                <strong className="fs-4 text-danger">
                  {formatPrice(selectedOrder.total)}
                </strong>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
