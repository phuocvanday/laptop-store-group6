import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Col,
  Container,
  Row,
  Tab,
  Table,
  Tabs,
} from 'react-bootstrap';
import laptopApi from '../api/laptopApi';
import reviewApi from '../api/reviewApi';
import { getErrorMessage, isCancel } from '../api/axiosClient';
import { calculateDiscount, formatDate, formatPrice, getFinalPrice } from '../utils/format';
import { useToast } from '../contexts/ToastContext';
import usePageTitle from '../hooks/usePageTitle';
import NotFoundPage from './NotFoundPage';
import LaptopCard from '../components/laptop/LaptopCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import useAddToCart from '../hooks/useAddToCart';
import ReviewList from '../components/laptop/ReviewList';

export default function LaptopDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const numId = Number(id);
  const isInvalidId = !id || isNaN(numId) || numId <= 0;

  // Dữ liệu chính
  const [laptop, setLaptop] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedLaptops, setRelatedLaptops] = useState([]);

  // Trạng thái tải & lỗi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  // Số lượng mua
  const [quantity, setQuantity] = useState(1);

  // Tiêu đề trang theo tên laptop
  usePageTitle(laptop ? `${laptop.name} | LaptopStore` : 'Chi tiết laptop');

  useEffect(() => {
    // Nếu ID không phải là số hợp lệ -> báo lỗi không tìm thấy
    if (isInvalidId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadDetail = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      setReviewError(null);
      setQuantity(1);

      try {
        // ==========================================
        // BƯỚC 1: Lấy chi tiết laptop
        // Lỗi bước 1 -> Lỗi toàn trang hoặc 404
        // ==========================================
        let laptopData;
        try {
          laptopData = await laptopApi.getById(numId, controller.signal);
        } catch (step1Err) {
          if (isCancel(step1Err) || controller.signal.aborted) return;
          // 404 hoặc không tìm thấy dữ liệu
          if (step1Err.response?.status === 404) {
            setNotFound(true);
            return;
          }
          throw step1Err;
        }

        if (!laptopData || controller.signal.aborted) return;
        setLaptop(laptopData);

        // ==========================================
        // BƯỚC 2: Gọi đồng thời reviews + related
        // Dùng Promise.allSettled và CHUNG 1 controller.signal
        // Nếu reviews lỗi -> Chỉ khu vực đánh giá hiện Alert warning
        // ==========================================
        const [reviewsResult, relatedResult] = await Promise.allSettled([
          reviewApi.getByLaptopId(numId, controller.signal),
          laptopApi.getAll(
            {
              brandId: laptopData.brandId,
              id_ne: numId,
              _limit: 4,
            },
            controller.signal
          ),
        ]);

        if (controller.signal.aborted) return;

        // Xử lý reviews
        if (reviewsResult.status === 'fulfilled') {
          setReviews(reviewsResult.value || []);
        } else {
          // Bỏ qua nếu là cancel error
          if (!isCancel(reviewsResult.reason)) {
            setReviewError('Không tải được đánh giá');
          }
        }

        // Xử lý sản phẩm liên quan cùng hãng
        if (relatedResult.status === 'fulfilled') {
          setRelatedLaptops(relatedResult.value.data || []);
        } else {
          setRelatedLaptops([]);
        }
      } catch (err) {
        if (isCancel(err) || controller.signal.aborted) return;
        setError(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      controller.abort();
    };
  }, [numId, isInvalidId]);

  // Nếu ID sai định dạng hoặc 404
  if (isInvalidId || notFound) {
    return <NotFoundPage />;
  }

  const { add: addToCartAction, adding } = useAddToCart();

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = () => {
    if (!laptop || laptop.stock <= 0) return;
    addToCartAction(laptop, quantity);
  };

  // Thêm đánh giá mới trực tiếp vào state mà không cần reload trang (G2, TECH-03)
  const handleReviewAdded = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  const finalPrice = laptop ? getFinalPrice(laptop) : 0;
  const discount = laptop ? calculateDiscount(laptop.price, laptop.salePrice) : 0;
  const hasDiscount = discount > 0;

  return (
    <Container className="py-4">
      {/* Nút quay lại & Breadcrumb */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
        <Button
          variant="outline-secondary"
          size="sm"
          className="d-flex align-items-center gap-1"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left"></i> Quay lại
        </Button>

        <Breadcrumb className="mb-0">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
            Trang chủ
          </Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/laptops' }}>
            Laptop
          </Breadcrumb.Item>
          {laptop && <Breadcrumb.Item active>{laptop.name}</Breadcrumb.Item>}
        </Breadcrumb>
      </div>

      {/* Trạng thái tải dữ liệu */}
      {loading && (
        <div className="py-5 text-center">
          <LoadingSpinner message="Đang tải thông tin sản phẩm..." />
        </div>
      )}

      {/* Lỗi Bước 1: Lỗi toàn trang */}
      {error && !loading && (
        <Alert variant="danger" className="my-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      )}

      {/* Chi tiết sản phẩm */}
      {!loading && !error && laptop && (
        <>
          <Card className="border-0 shadow-sm p-4 mb-5">
            <Row className="g-4">
              {/* Cột trái: Ảnh sản phẩm lớn */}
              <Col lg={5} className="text-center position-relative">
                {hasDiscount && (
                  <span className="position-absolute top-0 start-0 m-3 z-1">
                    <Badge bg="danger" className="fs-6 px-3 py-2">
                      -{discount}%
                    </Badge>
                  </span>
                )}
                <div
                  className="p-3 bg-white rounded border d-flex align-items-center justify-content-center"
                  style={{ minHeight: '360px' }}
                >
                  <img
                    src={laptop.image || 'https://via.placeholder.com/500x350?text=Laptop'}
                    alt={laptop.name}
                    className="img-fluid rounded"
                    style={{ maxHeight: '340px', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/500x350?text=No+Image';
                    }}
                  />
                </div>
              </Col>

              {/* Cột phải: Thông tin chi tiết */}
              <Col lg={7}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Badge bg="primary">{laptop.brand?.name || 'Chính hãng'}</Badge>
                  <span className="text-muted small">
                    Mã sản phẩm: #{laptop.id}
                  </span>
                </div>

                <h2 className="fw-bold mb-3">{laptop.name}</h2>

                {/* Đánh giá & Lượt bán */}
                <div className="d-flex align-items-center gap-3 mb-3 text-muted small">
                  <span className="text-warning fw-bold">
                    <i className="bi bi-star-fill me-1"></i>
                    {laptop.rating || 5.0} / 5
                  </span>
                  <span>|</span>
                  <span>{reviews.length} đánh giá</span>
                  <span>|</span>
                  <span>Đã bán: <strong>{laptop.sold || 0}</strong></span>
                </div>

                {/* Giá tiền */}
                <div className="p-3 bg-light rounded mb-4">
                  <div className="d-flex align-items-baseline gap-3">
                    <span className="text-danger fw-bold fs-3">
                      {formatPrice(finalPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-muted text-decoration-line-through fs-5">
                        {formatPrice(laptop.price)}
                      </span>
                    )}
                    {hasDiscount && (
                      <Badge bg="danger" className="small">
                        Tiết kiệm {formatPrice(laptop.price - laptop.salePrice)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Tình trạng tồn kho */}
                <div className="mb-4">
                  {laptop.stock === 0 ? (
                    <span className="badge bg-danger p-2 fs-6">
                      <i className="bi bi-x-circle me-1"></i> Tạm hết hàng
                    </span>
                  ) : laptop.stock < 5 ? (
                    <span className="badge bg-warning text-dark p-2 fs-6">
                      <i className="bi bi-exclamation-circle me-1"></i> Chỉ còn {laptop.stock} sản phẩm trong kho!
                    </span>
                  ) : (
                    <span className="badge bg-success p-2 fs-6">
                      <i className="bi bi-check-circle me-1"></i> Còn hàng ({laptop.stock} sản phẩm)
                    </span>
                  )}
                </div>

                {/* Chọn số lượng & Nút Thêm vào giỏ */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="d-flex align-items-center border rounded">
                    <Button
                      variant="light"
                      size="sm"
                      className="px-3"
                      disabled={quantity <= 1 || laptop.stock === 0}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      -
                    </Button>
                    <span className="px-3 fw-bold">{quantity}</span>
                    <Button
                      variant="light"
                      size="sm"
                      className="px-3"
                      disabled={quantity >= laptop.stock || laptop.stock === 0}
                      onClick={() => setQuantity((q) => Math.min(laptop.stock, q + 1))}
                    >
                      +
                    </Button>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    className="fw-bold px-4"
                    disabled={adding || laptop.stock === 0}
                    onClick={handleAddToCart}
                  >
                    {adding ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cart-plus me-2"></i> Thêm vào giỏ hàng
                      </>
                    )}
                  </Button>
                </div>

                {/* Thông số nhanh */}
                <div className="border-top pt-3">
                  <h6 className="fw-bold mb-2">Đặc điểm nổi bật:</h6>
                  <p className="text-muted small mb-0">{laptop.description}</p>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Khu vực Tabs: Thông số kỹ thuật & Đánh giá */}
          <Card className="border-0 shadow-sm p-4 mb-5">
            <Tabs defaultActiveKey="specs" id="laptop-detail-tabs" className="mb-4">
              {/* Tab 1: Thông số kỹ thuật */}
              <Tab eventKey="specs" title="Thông số kỹ thuật">
                <Table striped bordered hover responsive className="mb-0">
                  <tbody>
                    <tr>
                      <th style={{ width: '25%' }}>Thương hiệu</th>
                      <td>{laptop.brand?.name || 'Chính hãng'}</td>
                    </tr>
                    <tr>
                      <th>Dòng sản phẩm</th>
                      <td>{laptop.category?.name || 'Tiêu chuẩn'}</td>
                    </tr>
                    <tr>
                      <th>Vi xử lý (CPU)</th>
                      <td>{laptop.cpu || 'Đang cập nhật'}</td>
                    </tr>
                    <tr>
                      <th>Bộ nhớ RAM</th>
                      <td>{laptop.ram ? `${laptop.ram} GB` : 'Đang cập nhật'}</td>
                    </tr>
                    <tr>
                      <th>Ổ cứng lưu trữ</th>
                      <td>{laptop.storage ? `${laptop.storage} GB SSD` : 'Đang cập nhật'}</td>
                    </tr>
                    <tr>
                      <th>Màn hình</th>
                      <td>{laptop.screen || 'Đang cập nhật'}</td>
                    </tr>
                    <tr>
                      <th>Card đồ họa (GPU)</th>
                      <td>{laptop.gpu || 'Tích hợp'}</td>
                    </tr>
                    <tr>
                      <th>Trọng lượng</th>
                      <td>{laptop.weight ? `${laptop.weight} kg` : 'Đang cập nhật'}</td>
                    </tr>
                  </tbody>
                </Table>
              </Tab>

              {/* Tab 2: Đánh giá */}
              <Tab eventKey="reviews" title={`Đánh giá (${reviews.length})`}>
                <ReviewList
                  reviews={reviews}
                  reviewError={reviewError}
                  laptopId={laptop.id}
                  onReviewAdded={handleReviewAdded}
                />
              </Tab>
            </Tabs>
          </Card>

          {/* Khối sản phẩm liên quan cùng thương hiệu */}
          {relatedLaptops.length > 0 && (
            <div className="mb-5">
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <h4 className="fw-bold mb-0">
                  <i className="bi bi-grid-fill text-primary me-2"></i>
                  Sản phẩm cùng thương hiệu
                </h4>
                <Link
                  to={`/laptops?brandId=${laptop.brandId}`}
                  className="text-decoration-none text-primary small fw-semibold"
                >
                  Xem tất cả <i className="bi bi-arrow-right"></i>
                </Link>
              </div>

              <Row className="row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {relatedLaptops.map((item) => (
                  <Col key={item.id}>
                    <LaptopCard laptop={item} />
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
