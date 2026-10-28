import { useState } from 'react';
import { Button, Card, Col, Form, Image, Row, Spinner } from 'react-bootstrap';
import { handleImageError } from '../../utils/image';

/**
 * Validate toàn bộ trường dữ liệu của Laptop theo bảng ràng buộc G3, BR-03, BR-10
 */
export const validateLaptop = (values) => {
  const errors = {};

  if (!values.name?.trim()) {
    errors.name = 'Tên laptop không được để trống';
  }

  if (!values.brandId) {
    errors.brandId = 'Vui lòng chọn hãng sản xuất';
  }

  if (!values.categoryId) {
    errors.categoryId = 'Vui lòng chọn loại laptop';
  }

  const priceNum = Number(values.price);
  if (!values.price || isNaN(priceNum) || priceNum <= 0) {
    errors.price = 'Giá niêm yết phải là số lớn hơn 0';
  }

  if (values.salePrice !== '' && values.salePrice !== null && values.salePrice !== undefined) {
    const saleNum = Number(values.salePrice);
    if (isNaN(saleNum) || saleNum <= 0) {
      errors.salePrice = 'Giá khuyến mãi phải là số lớn hơn 0';
    } else if (!errors.price && saleNum >= priceNum) {
      // BR-03: Giá khuyến mãi phải nhỏ hơn giá niêm yết
      errors.salePrice = 'Giá khuyến mãi phải nhỏ hơn giá niêm yết';
    }
  }

  if (!values.cpu?.trim()) {
    errors.cpu = 'Vui lòng nhập thông số CPU';
  }

  const ramNum = Number(values.ram);
  if (!values.ram || isNaN(ramNum) || ramNum <= 0) {
    errors.ram = 'RAM phải là số nguyên dương (GB)';
  }

  const storageNum = Number(values.storage);
  if (!values.storage || isNaN(storageNum) || storageNum <= 0) {
    errors.storage = 'Dung lượng ổ cứng phải là số nguyên dương (GB)';
  }

  if (!values.screen?.trim()) {
    errors.screen = 'Vui lòng nhập thông số màn hình';
  }

  if (!values.gpu?.trim()) {
    errors.gpu = 'Vui lòng nhập card đồ họa (GPU)';
  }

  const weightNum = Number(values.weight);
  if (!values.weight || isNaN(weightNum) || weightNum <= 0) {
    errors.weight = 'Trọng lượng phải là số lớn hơn 0 (kg)';
  }

  // BR-10: Tồn kho là số nguyên không âm (>= 0)
  const stockNum = Number(values.stock);
  if (values.stock === '' || values.stock === null || isNaN(stockNum) || stockNum < 0) {
    errors.stock = 'Tồn kho phải là số nguyên không âm (>= 0)';
  }

  if (!values.image?.trim()) {
    errors.image = 'Vui lòng nhập link ảnh sản phẩm';
  }

  if (!values.description?.trim()) {
    errors.description = 'Vui lòng nhập mô tả sản phẩm';
  }

  return errors;
};

export default function LaptopForm({
  initialValues = {},
  brands = [],
  categories = [],
  loading = false,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    name: initialValues.name || '',
    brandId: initialValues.brandId ? String(initialValues.brandId) : '',
    categoryId: initialValues.categoryId ? String(initialValues.categoryId) : '',
    price: initialValues.price !== undefined && initialValues.price !== null ? String(initialValues.price) : '',
    salePrice:
      initialValues.salePrice !== undefined && initialValues.salePrice !== null
        ? String(initialValues.salePrice)
        : '',
    cpu: initialValues.cpu || '',
    ram: initialValues.ram !== undefined && initialValues.ram !== null ? String(initialValues.ram) : '',
    storage:
      initialValues.storage !== undefined && initialValues.storage !== null
        ? String(initialValues.storage)
        : '',
    screen: initialValues.screen || '',
    gpu: initialValues.gpu || '',
    weight: initialValues.weight !== undefined && initialValues.weight !== null ? String(initialValues.weight) : '',
    stock: initialValues.stock !== undefined && initialValues.stock !== null ? String(initialValues.stock) : '0',
    image: initialValues.image || '',
    description: initialValues.description || '',
  });

  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const errors = validateLaptop(form);
  // E5: Chỉ hiển thị lỗi khi đã chạm vào ô (blur) hoặc sau khi bấm submit
  const showError = (field) => (touched[field] || submitted) && errors[field];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (Object.keys(errors).length > 0) {
      return;
    }

    // Chuyển đổi các trường số sang kiểu Number đúng chuẩn trước khi gửi
    const payload = {
      name: form.name.trim(),
      brandId: Number(form.brandId),
      categoryId: Number(form.categoryId),
      price: Number(form.price),
      salePrice: form.salePrice.trim() !== '' ? Number(form.salePrice) : null,
      cpu: form.cpu.trim(),
      ram: Number(form.ram),
      storage: Number(form.storage),
      screen: form.screen.trim(),
      gpu: form.gpu.trim(),
      weight: Number(form.weight),
      stock: Number(form.stock),
      image: form.image.trim(),
      description: form.description.trim(),
    };

    onSubmit(payload);
  };

  return (
    <Form noValidate onSubmit={handleSubmit}>
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-4">
          <h5 className="fw-bold mb-3 border-bottom pb-2">Thông tin chung</h5>

          <Row className="g-3 mb-3">
            <Col xs={12}>
              <Form.Group controlId="laptop-name">
                <Form.Label>
                  Tên laptop <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="name"
                  type="text"
                  placeholder="Ví dụ: Dell XPS 13 9340"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={Boolean(showError('name'))}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="laptop-brand">
                <Form.Label>
                  Hãng sản xuất <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="brandId"
                  value={form.brandId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={Boolean(showError('brandId'))}
                  disabled={loading}
                >
                  <option value="">-- Chọn hãng --</option>
                  {(Array.isArray(brands) ? brands : []).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.brandId}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="laptop-category">
                <Form.Label>
                  Loại laptop <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={Boolean(showError('categoryId'))}
                  disabled={loading}
                >
                  <option value="">-- Chọn loại laptop --</option>
                  {(Array.isArray(categories) ? categories : []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.categoryId}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <h5 className="fw-bold mb-3 border-bottom pb-2 pt-2">Giá & Tồn kho</h5>

          <Row className="g-3 mb-3">
            <Col md={4}>
              <Form.Group controlId="laptop-price">
                <Form.Label>
                  Giá niêm yết (₫) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="price"
                  type="number"
                  min="0"
                  step="10000"
                  placeholder="Ví dụ: 25000000"
                  value={form.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={Boolean(showError('price'))}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="laptop-salePrice">
                <Form.Label>Giá khuyến mãi (₫)</Form.Label>
                <Form.Control
                  name="salePrice"
                  type="number"
                  min="0"
                  step="10000"
                  placeholder="Để trống nếu không giảm"
                  value={form.salePrice}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={Boolean(showError('salePrice'))}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">{errors.salePrice}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="laptop-stock">
                <Form.Label>
                  Số lượng tồn kho <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="stock"
                  type="number"
                  min="0"
                  placeholder="Ví dụ: 10"
                  value={form.stock}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={Boolean(showError('stock'))}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">{errors.stock}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <h5 className="fw-bold mb-3 border-bottom pb-2 pt-2">Thông số kỹ thuật</h5>

          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Group controlId="laptop-cpu">
                <Form.Label>
                  CPU <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="cpu"
                  type="text"
                  placeholder="Ví dụ: Intel Core i7 13700H"
                  value={form.cpu}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={Boolean(showError('cpu'))}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">{errors.cpu}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="laptop-gpu">
                <Form.Label>
                  Card đồ họa (GPU) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="gpu"
                  type="text"
                  placeholder="Ví dụ: NVIDIA RTX 4060 8GB"
                  value={form.gpu}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={Boolean(showError('gpu'))}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">{errors.gpu}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="laptop-ram">
                <Form.Label>
                  RAM (GB) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="ram"
                  type="number"
                  min="1"
                  placeholder="Ví dụ: 16"
                  value={form.ram}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={Boolean(showError('ram'))}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">{errors.ram}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="laptop-storage">
                <Form.Label>
                  Ổ cứng (GB) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="storage"
                  type="number"
                  min="64"
                  placeholder="Ví dụ: 512"
                  value={form.storage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={Boolean(showError('storage'))}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">{errors.storage}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="laptop-weight">
                <Form.Label>
                  Trọng lượng (kg) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="weight"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ví dụ: 1.45"
                  value={form.weight}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={Boolean(showError('weight'))}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">{errors.weight}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group controlId="laptop-screen">
                <Form.Label>
                  Màn hình <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="screen"
                  type="text"
                  placeholder="Ví dụ: 14 inch FHD+ 120Hz IPS"
                  value={form.screen}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={Boolean(showError('screen'))}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">{errors.screen}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <h5 className="fw-bold mb-3 border-bottom pb-2 pt-2">Hình ảnh & Mô tả</h5>

          {/* Ô nhập ảnh và Khung ảnh xem trước cạnh ô image */}
          <Row className="g-3 mb-3 align-items-center">
            <Col md={8}>
              <Form.Group controlId="laptop-image">
                <Form.Label>
                  Đường dẫn ảnh (URL) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="image"
                  type="text"
                  placeholder="https://example.com/laptop.jpg hoặc /no-image.svg"
                  value={form.image}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={Boolean(showError('image'))}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">{errors.image}</Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Dán đường dẫn ảnh sản phẩm hoặc dùng ảnh mẫu.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
              <div className="text-center p-2 border rounded bg-light">
                <div className="small text-muted mb-1">Ảnh xem trước:</div>
                <Image
                  src={form.image || '/no-image.svg'}
                  alt="Xem trước ảnh laptop"
                  rounded
                  className="border"
                  style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain' }}
                  onError={handleImageError}
                />
              </div>
            </Col>
          </Row>

          <Row className="g-3">
            <Col xs={12}>
              <Form.Group controlId="laptop-description">
                <Form.Label>
                  Mô tả chi tiết <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="description"
                  as="textarea"
                  rows={4}
                  placeholder="Mô tả ưu điểm, tính năng nổi bật..."
                  value={form.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={Boolean(showError('description'))}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Nút hành động */}
      <div className="d-flex justify-content-end gap-3 mb-5">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Hủy bỏ
        </Button>
        <Button variant="primary" type="submit" disabled={loading} className="px-4">
          {loading ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Đang lưu...
            </>
          ) : (
            'Lưu sản phẩm'
          )}
        </Button>
      </div>
    </Form>
  );
}
