import { useCallback, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import laptopApi from '../../api/laptopApi';
import catalogApi from '../../api/catalogApi';
import { getErrorMessage, isCancel } from '../../api/axiosClient';
import usePageTitle from '../../hooks/usePageTitle';
import LaptopForm from '../../components/laptop/LaptopForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

export default function AdminLaptopFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  usePageTitle(isEdit ? 'Sửa thông tin laptop' : 'Thêm laptop mới');

  const navigate = useNavigate();

  const [laptop, setLaptop] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Tải dữ liệu ban đầu (hãng, loại và laptop nếu đang ở chế độ sửa)
  const loadData = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const requests = [
        catalogApi.getBrands(signal),
        catalogApi.getCategories(signal),
      ];

      if (isEdit) {
        requests.push(laptopApi.getById(id, signal));
      }

      const results = await Promise.all(requests);
      if (signal?.aborted) return;

      const brandsData = results[0]?.data ?? results[0];
      const categoriesData = results[1]?.data ?? results[1];

      setBrands(Array.isArray(brandsData) ? brandsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      if (isEdit) {
        const laptopData = results[2]?.data ?? results[2];
        setLaptop(laptopData);
      }
    } catch (err) {
      if (isCancel(err) || signal?.aborted) return;
      setError(getErrorMessage(err));
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [id, isEdit]);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  // Xử lý gửi form thêm mới (POST) hoặc sửa (PUT)
  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError(null);

    try {
      if (isEdit) {
        // PUT: Gửi đầy đủ object, giữ nguyên sold, rating, createdAt ban đầu
        const fullPayload = {
          ...laptop,
          ...formData,
          id: Number(id),
          sold: laptop?.sold ?? 0,
          rating: laptop?.rating ?? 0,
          createdAt: laptop?.createdAt ?? new Date().toISOString(),
        };

        await laptopApi.update(id, fullPayload);
      } else {
        // POST: Tự gán sold: 0, rating: 0, createdAt: new Date().toISOString()
        const fullPayload = {
          ...formData,
          sold: 0,
          rating: 0,
          createdAt: new Date().toISOString(),
        };

        await laptopApi.create(fullPayload);
      }

      // Lưu xong chuyển về danh sách kèm flash message
      navigate('/admin/laptops', {
        state: {
          message: `Đã lưu "${formData.name}"`,
        },
      });
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">
          {isEdit ? `Sửa laptop: ${laptop?.name || `#${id}`}` : 'Thêm laptop mới'}
        </h3>
      </div>

      {error && (
        <ErrorAlert
          message={error}
          onRetry={() => {
            const controller = new AbortController();
            loadData(controller.signal);
          }}
        />
      )}

      {loading ? (
        <LoadingSpinner text="Đang tải thông tin biểu mẫu..." />
      ) : (
        <LaptopForm
          initialValues={laptop || {}}
          brands={brands}
          categories={categories}
          loading={submitting}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/laptops')}
        />
      )}
    </Container>
  );
}
