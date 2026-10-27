import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import reviewApi from '../../api/reviewApi';
import { getErrorMessage } from '../../api/axiosClient';

export default function ReviewForm({ laptopId, onReviewSubmitted }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState(false);

  // Nếu chưa đăng nhập: Hiển thị lời nhắc đăng nhập
  if (!user) {
    return (
      <div className="card border-0 bg-light p-4 text-center my-3">
        <h6 className="fw-semibold mb-2">Bạn cần đăng nhập để viết đánh giá</h6>
        <p className="text-muted small mb-3">
          Chia sẻ trải nghiệm thực tế của bạn về sản phẩm này để giúp cộng đồng mua sắm tốt hơn.
        </p>
        <div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => navigate('/login', { state: { from: location } })}
          >
            <i className="bi bi-box-arrow-in-right me-1"></i> Đăng nhập để đánh giá
          </Button>
        </div>
      </div>
    );
  }

  // Kiểm tra tính hợp lệ của nhận xét (ít nhất 10 ký tự)
  const isCommentTooShort = touched && comment.trim().length > 0 && comment.trim().length < 10;
  const isCommentEmpty = touched && comment.trim().length === 0;
  const isValid = rating >= 1 && rating <= 5 && comment.trim().length >= 10 && comment.trim().length <= 500;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    if (!isValid || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        laptopId: Number(laptopId),
        userId: user.id,
        userName: user.fullName || user.username || 'Khách hàng',
        rating: Number(rating),
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      };

      const res = await reviewApi.create(payload);

      showToast('Đã gửi đánh giá thành công! Cảm ơn bạn.', 'success');
      setComment('');
      setRating(5);
      setTouched(false);

      if (onReviewSubmitted) {
        onReviewSubmitted(res.data || res || payload);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card border-0 bg-light p-4 mb-4">
      <h5 className="fw-bold fs-6 mb-3">
        <i className="bi bi-pencil-square me-2 text-primary"></i>
        Viết đánh giá của bạn
      </h5>

      {error && (
        <Alert variant="danger" className="py-2 small">
          <i className="bi bi-exclamation-triangle me-1"></i>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Chọn số sao */}
        <div className="mb-3">
          <Form.Label className="small fw-semibold mb-1">
            Đánh giá của bạn về sản phẩm:
          </Form.Label>
          <div className="d-flex align-items-center gap-2">
            <div className="d-flex align-items-center fs-4 text-warning" style={{ cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`bi bi-star${star <= rating ? '-fill' : ''} me-1`}
                  onClick={() => setRating(star)}
                  title={`${star} sao`}
                  role="button"
                ></i>
              ))}
            </div>
            <span className="small text-muted fw-semibold">
              {rating === 5 && 'Tuyệt vời'}
              {rating === 4 && 'Rất tốt'}
              {rating === 3 && 'Bình thường'}
              {rating === 2 && 'Chưa hài lòng'}
              {rating === 1 && 'Rất tệ'}
            </span>
          </div>
        </div>

        {/* Ô nhập nhận xét */}
        <Form.Group className="mb-3" controlId="reviewComment">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <Form.Label className="small fw-semibold mb-0">
              Nhận xét chi tiết:
            </Form.Label>
            <span className="text-muted small">
              {comment.trim().length}/500 ký tự (tối thiểu 10)
            </span>
          </div>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Hãy chia sẻ cảm nhận của bạn về hiệu năng, thiết kế, thời lượng pin..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onBlur={() => setTouched(true)}
            isInvalid={isCommentEmpty || isCommentTooShort}
            maxLength={500}
            disabled={submitting}
          />
          <Form.Control.Feedback type="invalid">
            {isCommentEmpty && 'Vui lòng nhập nội dung nhận xét.'}
            {isCommentTooShort && 'Nội dung nhận xét quá ngắn (tối thiểu 10 ký tự).'}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Nút gửi */}
        <div className="text-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={submitting || (touched && !isValid)}
            className="px-4 fw-semibold"
          >
            {submitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                Đang gửi...
              </>
            ) : (
              <>
                <i className="bi bi-send me-1"></i> Gửi đánh giá
              </>
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
}
