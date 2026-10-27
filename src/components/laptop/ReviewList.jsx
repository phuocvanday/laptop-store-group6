import { Alert, Badge, Card, Col, Row } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/format';
import ReviewForm from './ReviewForm';
import EmptyState from '../common/EmptyState';

export default function ReviewList({ reviews = [], reviewError = null, laptopId, onReviewAdded }) {
  const { user } = useAuth();

  // Quy tắc BR-07: Mỗi người dùng chỉ được đánh giá 1 lần duy nhất cho mỗi laptop
  const hasReviewed =
    user && reviews.some((r) => Number(r.userId) === Number(user.id));

  // Tính điểm đánh giá trung bình
  const totalCount = reviews.length;
  const avgRating =
    totalCount > 0
      ? (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / totalCount).toFixed(1)
      : 0;

  return (
    <div className="review-section">
      {/* Cảnh báo lỗi tải Bước 2 nếu có */}
      {reviewError && (
        <Alert variant="warning" className="my-3">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {reviewError}
        </Alert>
      )}

      {/* Tóm tắt điểm đánh giá */}
      {totalCount > 0 && (
        <div className="p-3 bg-light rounded mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="text-center">
              <div className="display-6 fw-bold text-warning">{avgRating}</div>
              <div className="text-warning">
                {Array.from({ length: 5 }, (_, i) => (
                  <i
                    key={i}
                    className={`bi bi-star${i < Math.round(Number(avgRating)) ? '-fill' : ''}`}
                  ></i>
                ))}
              </div>
            </div>
            <div>
              <h6 className="fw-bold mb-1">Đánh giá chung</h6>
              <p className="text-muted small mb-0">Dựa trên {totalCount} lượt đánh giá từ khách hàng đã mua</p>
            </div>
          </div>
          <Badge bg="secondary" className="px-3 py-2 fs-6">
            {totalCount} nhận xét
          </Badge>
        </div>
      )}

      {/* Quy tắc BR-07: Nếu đã đánh giá thì hiển thị thông báo, nếu chưa thì hiện Form */}
      {hasReviewed ? (
        <Alert variant="info" className="d-flex align-items-center mb-4">
          <i className="bi bi-check-circle-fill fs-5 me-2 text-info"></i>
          <div>
            <strong>Bạn đã đánh giá sản phẩm này.</strong>
            <div className="small text-muted">
              Mỗi tài khoản được gửi 1 lần đánh giá cho mỗi sản phẩm để đảm bảo tính khách quan. Cảm ơn bạn đã đóng góp ý kiến!
            </div>
          </div>
        </Alert>
      ) : (
        <ReviewForm laptopId={laptopId} onReviewSubmitted={onReviewAdded} />
      )}

      {/* Danh sách các bài đánh giá */}
      <h6 className="fw-bold mb-3">
        Tất cả nhận xét ({totalCount}):
      </h6>

      {!reviewError && totalCount === 0 && (
        <EmptyState
          title="Chưa có đánh giá nào"
          message="Sản phẩm này chưa có nhận xét nào từ khách hàng. Hãy là người đầu tiên trải nghiệm nhé!"
        />
      )}

      {!reviewError && totalCount > 0 && (
        <Row className="g-3">
          {reviews.map((r) => (
            <Col xs={12} key={r.id}>
              <Card className="border-0 shadow-sm p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-person-circle fs-5 text-secondary"></i>
                    <div>
                      <strong className="d-block small">
                        {r.userName || r.user?.fullName || 'Khách hàng'}
                      </strong>
                      <span className="text-warning small">
                        {Array.from({ length: 5 }, (_, i) => (
                          <i
                            key={i}
                            className={`bi bi-star${i < Number(r.rating) ? '-fill' : ''} me-1`}
                          ></i>
                        ))}
                      </span>
                    </div>
                  </div>
                  <span className="text-muted small">{formatDate(r.createdAt)}</span>
                </div>
                <p className="mb-0 text-secondary small" style={{ whiteSpace: 'pre-line' }}>
                  {r.comment}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
