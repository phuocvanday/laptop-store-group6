# LaptopStore — Dự Án Cửa Hàng Laptop Trực Tuyến

> **Môn học:** FER202 — Lập trình Web với React  
> **Bài tập:** Exercise 27 mở rộng  
> **Nhóm thực hiện:** Nhóm 6  
> **Thành viên:**
> - **A (Leader):** `@phuocvanday` (Khởi tạo dự án, API lõi, Đăng nhập, Routing, Hooks, Quản trị laptop)
> - **B (Catalog):** `@quyvan21012005` (Format utils, Common UI, Navbar, Card/Grid, Trang chủ, Danh sách, Chi tiết, Đánh giá, README)
> - **C (Commerce & Test):** `@nhan2005mk` (Seed data, Cart/Order API, Toast/Modal, Giỏ hàng, Đặt hàng, Quản lý đơn, Kiểm thử)

---

## 1. Công nghệ sử dụng

- **Frontend:** React 18, Vite 8, React Router DOM v6
- **Giao diện:** React-Bootstrap 2.10, Bootstrap 5.3, Bootstrap Icons
- **HTTP Client:** Axios với Custom Client & Interceptors
- **Mock Backend:** `json-server` (0.17.4) với `concurrently`

---

## 2. Hướng dẫn cài đặt và khởi chạy dự án

### Yêu cầu môi trường
- **Node.js:** 20.19+ hoặc 22 LTS
- **Trình quản lý gói:** `npm` (đi kèm Node.js)
- **Git** (hỗ trợ Git Bash trên Windows)

### Các bước khởi chạy

1. **Clone repository về máy:**
   ```bash
   git clone https://github.com/phuocvanday/laptop-store-group6.git
   cd laptop-store-group6
   ```

2. **Cài đặt các gói phụ thuộc:**
   ```bash
   npm install
   ```

3. **Cấu hình file môi trường (.env):**
   Tạo file `.env` từ file mẫu `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Nội dung mặc định trong `.env`:*
   ```properties
   VITE_API_URL=http://localhost:3001
   VITE_API_TIMEOUT=8000
   ```

4. **Khởi tạo dữ liệu mẫu cho Database:**
   ```bash
   npm run reset-db
   ```
   *Lệnh này sẽ sao chép dữ liệu từ `db.backup.json` sang `db.json` sạch sẽ.*

5. **Khởi chạy ứng dụng (Web + Mock API):**
   ```bash
   npm start
   ```
   *Lệnh này sử dụng `concurrently` để chạy song song:*
   - **Giao diện Web:** [http://localhost:5173](http://localhost:5173)
   - **Mock API Server:** [http://localhost:3001](http://localhost:3001)

6. **Kiểm tra build cho production:**
   ```bash
   npm run build
   ```

---

## 3. Danh sách tài khoản Demo

Hệ thống có sẵn 2 tài khoản mẫu phục vụ kiểm thử phân quyền:

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn và tính năng |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin@laptopstore.vn` | `123456` | Toàn quyền truy cập `/admin/*`: bảng quản trị laptop, sửa nhanh tồn kho, xoá đơn lẻ & hàng loạt, thêm/sửa laptop, quản lý trạng thái đơn hàng. |
| **Khách hàng (Customer)** | `khach@laptopstore.vn` | `123456` | Mua sắm, quản lý giỏ hàng lưu backend, thanh toán đặt hàng kiểm tra kho, xem lịch sử đơn hàng, hủy đơn `pending`, viết đánh giá sản phẩm. |

---

## 4. Kết quả đo lường hiệu năng tải Trang chủ (Phần H1)

Trang chủ (`HomePage.jsx`) cần tải 4 khối dữ liệu: 8 laptop mới nhất, 4 laptop bán chạy, danh sách hãng và danh sách loại.  
Dưới đây là bảng số liệu so sánh thời gian thực tế đo được bằng `performance.now()` trên môi trường DEV (với độ trễ giả lập 500ms của `json-server`):

| Phương pháp thực hiện | Cơ chế xử lý các request | Thời gian trung bình | Phân tích tab Network (Waterfall) |
|---|---|---|---|
| **Tuần tự (`loadSequential`)** | Gửi từng request nối tiếp nhau (`await` lần lượt 4 lần) | **~2.140 ms** | 4 thanh request xếp bậc thang nối đuôi nhau. Thời gian tổng bằng tổng 4 request cộng lại. |
| **Song song (`Promise.all`)** | Gửi cả 4 request đồng thời qua `Promise.all` | **~535 ms** | Cả 4 thanh request xuất phát cùng lúc và chạy song song (thẳng hàng ở cột Waterfall). |
| **Hiệu quả tối ưu** | — | **Nhanh hơn ~75% (gấp 4 lần)** | Giảm thiểu tối đa thời gian chờ đợi của người dùng khi vào trang chủ. |

> **Lưu ý:** Hàm `loadSequential()` chỉ được chạy ở chế độ phát triển (`import.meta.env.DEV`) để đo lường hiển thị Badge thống kê; hoàn toàn **không chạy ở môi trường production** để tối ưu tài nguyên.

---

## 5. Trả lời 4 câu hỏi lý thuyết chuyên sâu (Phần H3)

### Câu 1: Cơ chế hủy request bằng `AbortController`
- **Vì sao cần hủy request cũ:**  
  Khi người dùng tương tác liên tục (gõ từ khóa tìm kiếm nhanh, bấm liên tiếp giữa các bộ lọc hãng, chuyển đổi qua lại giữa các trang chi tiết sản phẩm), mỗi thao tác sẽ kích hoạt một request mạng mới. Nếu mạng chậm (Slow 3G), các request trước có thể phản hồi sau các request mới, dẫn đến tình trạng **Race Condition** (dữ liệu cũ ghi đè lên dữ liệu mới nhất). Hủy request cũ giúp tiết kiệm băng thông và đảm bảo giao diện luôn phản ánh đúng thao tác mới nhất.
- **Cách xử lý lỗi hủy không để hiện lỗi giả:**  
  Khi `controller.abort()` được kích hoạt, Axios sẽ ném ra một ngoại lệ có kiểu `CanceledError`.
  1. Trong `axiosClient.js` (Response Interceptor): kiểm tra `if (axios.isCancel(error)) return Promise.reject(error);` ở đầu tiên để trả nguyên vẹn lỗi hủy, không bọc thành thông báo lỗi hệ thống.
  2. Trong Component hoặc Hook (`useAxios`): ở khối `catch`, ta kiểm tra `if (isCancel(err) || controller.signal.aborted) return;`. Nhờ vậy, component sẽ im lặng bỏ qua lỗi này, không hiển thị `Alert` đỏ hay thông báo "Lỗi kết nối", và không ngắt trạng thái loading của request đang chạy sau đó.

---

### Câu 2: So sánh `Promise.all` và `Promise.allSettled`

| Tiêu chí | `Promise.all` | `Promise.allSettled` |
|---|---|---|
| **Cơ chế hoạt động** | **Fail-fast:** Chờ tất cả promises thành công. Chỉ cần **1 promise bị reject** thì lập tức reject toàn bộ mảng. | **All-inclusive:** Chờ **tất cả** promises hoàn tất bất kể thành công hay thất bại. Luôn resolve một mảng các object `{ status, value / reason }`. |
| **Trường hợp nên dùng** | Khi các tác vụ phụ thuộc lẫn nhau hoặc cùng bắt buộc phải có để trang/nghiệp vụ hoạt động trọn vẹn. | Khi các tác vụ độc lập nhau và sự thất bại của một phần không được làm gián đoạn các phần còn lại. |
| **Áp dụng trong dự án** | 1. **Trang chủ (`HomePage.jsx`):** Cần cả 4 khối dữ liệu để dựng giao diện trang chủ đồng nhất.<br>2. **Thanh toán (`CheckoutPage.jsx`):** Kiểm tra tồn kho của tất cả mặt hàng trong giỏ; chỉ cần 1 mặt hàng thiếu tồn kho là phải hủy đơn. | 1. **Chi tiết laptop (`LaptopDetailPage.jsx`):** Tải reviews và laptop liên quan. Nếu reviews lỗi thì tab đánh giá hiện cảnh báo vàng, nhưng thông tin chi tiết laptop và sản phẩm liên quan vẫn hiển thị bình thường.<br>2. **Xóa hàng loạt (`AdminLaptopPage.jsx`):** Xóa nhiều laptop cùng lúc, dòng nào xóa được thì ghi nhận, dòng nào lỗi thì báo riêng. |

---

### Câu 3: So sánh `PATCH` và `PUT`

| Tiêu chí | `PUT` | `PATCH` |
|---|---|---|
| **Ý nghĩa HTTP** | Thay thế **toàn bộ** tài nguyên hiện tại bằng payload gửi lên (Idempotent). | Cập nhật **một phần** tài nguyên (Partial modification). |
| **Payload gửi đi** | Chứa đầy đủ tất cả các trường dữ liệu của object (nếu thiếu trường nào, backend có thể đặt về null/default). | Chỉ gửi đúng các trường cần thay đổi giá trị. |
| **Băng thông** | Lớn hơn vì phải gửi lại toàn bộ thông tin. | Rất nhỏ gọn và tối ưu. |
| **Áp dụng trong dự án** | **Form chỉnh sửa laptop (`AdminLaptopFormPage.jsx`):** Khi admin sửa sản phẩm, toàn bộ object laptop đầy đủ các trường (tên, hãng, loại, giá, tồn kho, cấu hình, mô tả) được gửi qua `PUT /laptops/:id`. | 1. **Cập nhật số lượng giỏ hàng:** Chỉ gửi `{ quantity: newQty }` qua `PATCH /carts/:id`.<br>2. **Đổi trạng thái đơn hàng:** Chỉ gửi `{ status: 'shipping' }` qua `PATCH /orders/:id`.<br>3. **Sửa nhanh tồn kho tại bảng:** Chỉ gửi `{ stock: newStock }` qua `PATCH /laptops/:id`. |

---

### Câu 4: React 18 StrictMode và Hàm Cleanup trong `useEffect`
- **Vì sao `useEffect` chạy 2 lần ở môi trường DEV:**  
  Trong chế độ phát triển (`StrictMode`), React cố tình thực hiện chu trình: **Mount $\rightarrow$ Unmount $\rightarrow$ Remount** cho mọi component. Mục đích là để lập trình viên phát hiện các side-effects không thuần khiết, các thao tác đăng ký sự kiện (event listener, timer) hoặc gọi API bị thiếu hàm dọn dẹp (cleanup function), từ đó phòng ngừa rò rỉ bộ nhớ (memory leaks).
- **Cách viết cleanup với `AbortController` để tránh lỗi:**  
  ```javascript
  useEffect(() => {
    // 1. Tạo controller đại diện cho lần render hiện tại
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const response = await laptopApi.getAll(params, controller.signal);
        // Kiểm tra an toàn trước khi cập nhật state
        if (!controller.signal.aborted) {
          setData(response.data);
        }
      } catch (err) {
        // Bỏ qua lỗi do hủy request khi StrictMode unmount lần 1
        if (isCancel(err) || controller.signal.aborted) return;
        setError(getErrorMessage(err));
      }
    };

    fetchData();

    // 2. Hàm cleanup: hủy request khi component unmount hoặc effect chạy lại
    return () => {
      controller.abort();
    };
  }, [deps]);
  ```
  Nhờ hàm cleanup này, khi React StrictMode unmount component ở lần chạy đầu tiên, request mạng dở dang sẽ bị hủy an toàn, không có thao tác `setState` nào được thực thi trên component đã unmount, đảm bảo ứng dụng vận hành mượt mà và không sinh lỗi Console.
