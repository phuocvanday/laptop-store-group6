import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Button, Col, Container, Form, InputGroup, Offcanvas, Row } from 'react-bootstrap';
import laptopApi from '../api/laptopApi';
import catalogApi from '../api/catalogApi';
import { getErrorMessage, isCancel } from '../api/axiosClient';
import useDebounce from '../hooks/useDebounce';
import usePageTitle from '../hooks/usePageTitle';
import LaptopFilter from '../components/laptop/LaptopFilter';
import LaptopGrid from '../components/laptop/LaptopGrid';
import Pagination from '../components/common/Pagination';

const PAGE_SIZE = 8;

export default function LaptopListPage() {
  usePageTitle('Danh sách laptop');

  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Đọc bộ lọc từ URL
  const brandId = searchParams.get('brandId') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const priceMin = searchParams.get('priceMin') || '';
  const priceMax = searchParams.get('priceMax') || '';
  const ramMin = searchParams.get('ramMin') || '';
  const sort = searchParams.get('sort') || 'newest';
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // 2. State danh mục & dữ liệu laptop
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [laptops, setLaptops] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. State mobile Offcanvas
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  // 4. Ô tìm kiếm trên trang với debounce 500ms (H2)
  const [searchInput, setSearchInput] = useState(q);
  const debouncedSearch = useDebounce(searchInput, 500);

  // Đồng bộ ô tìm kiếm khi URL thay đổi (ví dụ nút Back hoặc tìm kiếm từ Navbar)
  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  // Cập nhật URL khi người dùng ngừng gõ 500ms
  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (trimmed !== q) {
      const nextParams = new URLSearchParams(searchParams);
      if (trimmed) {
        nextParams.set('q', trimmed);
      } else {
        nextParams.delete('q');
      }
      nextParams.set('page', '1');
      setSearchParams(nextParams);
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // 5. Tải danh sách Hãng và Loại laptop (1 lần khi mount)
  useEffect(() => {
    const controller = new AbortController();

    const loadCatalogs = async () => {
      try {
        const [bRes, cRes] = await Promise.all([
          catalogApi.getBrands(controller.signal),
          catalogApi.getCategories(controller.signal),
        ]);
        if (!controller.signal.aborted) {
          const rawBrands = bRes?.data ?? bRes;
          const rawCategories = cRes?.data ?? cRes;
          setBrands(Array.isArray(rawBrands) ? rawBrands : []);
          setCategories(Array.isArray(rawCategories) ? rawCategories : []);
        }
      } catch (err) {
        if (!isCancel(err) && !controller.signal.aborted) {
          console.error('Không tải được danh mục lọc:', err);
        }
      }
    };

    loadCatalogs();

    return () => {
      controller.abort();
    };
  }, []);

  // 6. Hàm cập nhật bộ lọc (luôn reset page về 1)
  const handleFilterChange = (patch) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        nextParams.set(key, String(val));
      } else {
        nextParams.delete(key);
      }
    });
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  // 7. Xóa toàn bộ bộ lọc
  const handleResetFilters = () => {
    const nextParams = new URLSearchParams();
    if (sort && sort !== 'newest') {
      nextParams.set('sort', sort);
    }
    setSearchInput('');
    setSearchParams(nextParams);
  };

  // 8. Đổi trang
  const handlePageChange = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 9. Đổi sắp xếp
  const handleSortChange = (newSort) => {
    handleFilterChange({ sort: newSort });
  };

  // 10. Chuyển đổi bộ lọc URL sang tham số json-server (F3, E6)
  const apiParams = useMemo(() => {
    const params = {
      _page: page,
      _limit: PAGE_SIZE,
    };

    if (brandId) params.brandId = brandId;
    if (categoryId) params.categoryId = categoryId;
    if (priceMin) params.price_gte = Number(priceMin);
    if (priceMax) params.price_lte = Number(priceMax);
    if (ramMin) params.ram_gte = Number(ramMin);
    if (q) params.q = q;

    switch (sort) {
      case 'price_asc':
        params._sort = 'salePrice,price';
        params._order = 'asc,asc';
        break;
      case 'price_desc':
        params._sort = 'salePrice,price';
        params._order = 'desc,desc';
        break;
      case 'bestseller':
        params._sort = 'sold';
        params._order = 'desc';
        break;
      case 'newest':
      default:
        params._sort = 'createdAt';
        params._order = 'desc';
        break;
    }

    return params;
  }, [brandId, categoryId, priceMin, priceMax, ramMin, sort, q, page]);

  // 11. Tải danh sách laptop kèm AbortController (D1, TECH-03)
  const [reloadToken, setReloadToken] = useState(0);
  const handleRetry = () => setReloadToken((prev) => prev + 1);

  useEffect(() => {
    const controller = new AbortController();

    const fetchLaptops = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await laptopApi.getAll(apiParams, controller.signal);
        if (controller.signal.aborted) return;
        setLaptops(res.data || []);
        setTotal(res.total || 0);
      } catch (err) {
        // Bỏ qua lỗi hủy request khi đổi bộ lọc nhanh (D4, TECH-03)
        if (isCancel(err) || controller.signal.aborted) return;
        setError(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchLaptops();

    return () => {
      controller.abort();
    };
  }, [apiParams, reloadToken]);

  const currentFilters = { brandId, categoryId, priceMin, priceMax, ramMin };

  return (
    <Container className="py-4">
      {/* Header & Tiêu đề */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Danh sách sản phẩm</h2>
          <p className="text-muted small mb-0">
            {loading ? (
              'Đang tải danh sách...'
            ) : (
              <>
                Hiển thị <strong>{laptops.length}</strong> / <strong>{total}</strong> sản phẩm
                {q && (
                  <span>
                    {' '}
                    cho từ khóa &quot;<strong>{q}</strong>&quot;
                  </span>
                )}
              </>
            )}
          </p>
        </div>

        {/* Nút lọc cho mobile & Sắp xếp */}
        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-primary"
            className="d-lg-none btn-sm"
            onClick={() => setShowOffcanvas(true)}
          >
            <i className="bi bi-funnel me-1"></i> Bộ lọc
          </Button>

          <div className="d-flex align-items-center gap-2">
            <label htmlFor="sort-select" className="small text-muted text-nowrap mb-0">
              Sắp xếp:
            </label>
            <Form.Select
              id="sort-select"
              size="sm"
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              style={{ width: '160px' }}
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="bestseller">Bán chạy nhất</option>
            </Form.Select>
          </div>
        </div>
      </div>

      <Row>
        {/* Cột trái: Bộ lọc Desktop (Col lg={3}) */}
        <Col lg={3} className="d-none d-lg-block">
          <div className="card border-0 shadow-sm p-3 mb-4 sticky-top" style={{ top: '80px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fs-6 fw-bold mb-0">
                <i className="bi bi-funnel me-1"></i> Bộ lọc tìm kiếm
              </h5>
              {(brandId || categoryId || priceMin || priceMax || ramMin || q) && (
                <button
                  type="button"
                  className="btn btn-link text-danger p-0 text-decoration-none small"
                  onClick={handleResetFilters}
                >
                  Đặt lại
                </button>
              )}
            </div>

            <LaptopFilter
              brands={brands}
              categories={categories}
              filters={currentFilters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              idPrefix="desktop"
            />
          </div>
        </Col>

        {/* Cột phải: Danh sách sản phẩm (Col lg={9}) */}
        <Col lg={9}>
          {/* Ô tìm kiếm từ khóa trên trang (H2: debounce 500ms) */}
          <div className="mb-4">
            <InputGroup>
              <InputGroup.Text className="bg-white">
                <i className="bi bi-search text-muted"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Tìm kiếm theo tên laptop, CPU..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Tìm kiếm laptop"
              />
              {searchInput && (
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setSearchInput('');
                    handleFilterChange({ q: '' });
                  }}
                  title="Xóa từ khóa"
                >
                  ✕
                </Button>
              )}
            </InputGroup>
          </div>

          {/* Trạng thái lỗi */}
          {error && (
            <Alert variant="danger" className="d-flex align-items-center justify-content-between">
              <span>{error}</span>
              <Button variant="outline-danger" size="sm" onClick={handleRetry}>
                Thử lại
              </Button>
            </Alert>
          )}

          {/* Lưới sản phẩm */}
          {!error && <LaptopGrid laptops={laptops} loading={loading} />}

          {/* Phân trang */}
          {!loading && !error && total > PAGE_SIZE && (
            <Pagination
              currentPage={page}
              totalItems={total}
              pageSize={PAGE_SIZE}
              onPageChange={handlePageChange}
            />
          )}
        </Col>
      </Row>

      {/* Offcanvas bộ lọc cho màn hình nhỏ (< lg) */}
      <Offcanvas
        show={showOffcanvas}
        onHide={() => setShowOffcanvas(false)}
        placement="start"
        className="d-lg-none"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="fs-6 fw-bold">
            <i className="bi bi-funnel me-1"></i> Bộ lọc tìm kiếm
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <LaptopFilter
            brands={brands}
            categories={categories}
            filters={currentFilters}
            onChange={(patch) => {
              handleFilterChange(patch);
              setShowOffcanvas(false);
            }}
            onReset={() => {
              handleResetFilters();
              setShowOffcanvas(false);
            }}
            idPrefix="offcanvas"
          />
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
}
