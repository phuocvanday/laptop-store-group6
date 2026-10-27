# Hướng dẫn nhóm LaptopStore (repo `laptop-store-group6`)

> **Đọc file này thay vì copy cứng số `#1`…`#31` trong Assignment_guide / Assignment_readme.**  
> Trên GitHub của nhóm, số issue **lệch +2**.

---

## 1. Vì sao bị lệch số?

| Việc đã xảy ra | Hệ quả |
|---|---|
| Trước khi script tạo 31 issue, repo đã có issue `#1`, `#2` (rồi đóng) | GitHub **không tái dùng** số cũ |
| Script tạo lại 31 issue mới | Issue thật = **`#3` → `#33`** |

**Công thức (bắt buộc nhớ):**

```
Số GitHub thật = Số trong đề (guide/readme) + 2
```

Ví dụ: đề nói issue `#5` axiosClient → GitHub **`#7`** · nhánh `feature/7-axios-client` · `Refs #7` · `Closes #7`.

Guide cũng cho phép: *lệch số thì dùng **số thật** trên GitHub*.

---

## 2. Thành viên

| Vai | Họ tên (gọi) | GitHub | Việc chính |
|---|---|---|---|
| **A** Leader | Phước | `phuocvanday` | Templates, setup, axios, auth, routes, hooks, filter, search, admin table, bulk delete, release |
| **B** Catalog | Quý | `quyvan21012005` | Format, laptop API, UI chung, navbar, card, home, list, detail, review, README |
| **C** Commerce | Nhân | `nhan2005mk` | Seed, cart/order API, toast/modal, cart/checkout/orders, admin form/orders, test |

Repo: https://github.com/phuocvanday/laptop-store-group6  
Default branch làm việc: **`develop`** (PR feature luôn vào `develop`, **không** vào `main`).

---

## 3. Quy tắc vàng khi đọc guide

Khi guide / `Assignment_code.md` viết:

| Guide viết | Nhóm mình làm |
|---|---|
| Issue `#N` | Issue GitHub **`#(N+2)`** |
| Nhánh `feature/N-...` | Nhánh `feature/(N+2)-...` (cùng phần mô tả kebab) |
| `Refs #N` | `Refs #(N+2)` |
| `Closes #N` | `Closes #(N+2)` |
| Phụ thuộc `#A, #B` | Phụ thuộc `#(A+2), #(B+2)` |
| Reviewer A/B/C | Giữ nguyên người; chỉ đổi **số issue** |

**Không** đặt nhánh `chore/1-...` chỉ vì guide ghi `#1` — phải theo số GitHub.

---

## 4. Bảng map đầy đủ (đề → GitHub)

Cột **Nhánh (dùng số này)** và **Cần merge trước (số GitHub)** là chuẩn để làm việc.

### Sprint 0 — Foundation

| Đề | GitHub | Title ngắn | Người | Reviewer | Nhánh (đúng) | Cần merge trước (GH) |
|---:|---:|---|---|---|---|---|
| 1 | **3** | Repo templates & CODEOWNERS | A | B | `chore/3-repo-templates` | — |
| 2 | **4** | Project setup | A | C | `feature/4-project-setup` | #3 |
| 3 | **5** | Seed data db.json | C | A | `chore/5-seed-data` | #4 |
| 4 | **6** | Format utils | B | C | `feature/6-format-utils` | #4 |
| 5 | **7** | axiosClient & interceptors | A | B | `feature/7-axios-client` | #4 |
| 6 | **8** | Laptop/catalog/review API | B | C | `feature/8-laptop-catalog-review-api` | #7 |
| 7 | **9** | Cart & order API | C | A | `feature/9-cart-order-api` | #7 |

### Sprint 1 — Core UI & Auth

| Đề | GitHub | Title ngắn | Người | Reviewer | Nhánh (đúng) | Cần merge trước (GH) |
|---:|---:|---|---|---|---|---|
| 8 | **10** | Fake login & AuthContext | A | C | `feature/10-login` | #7, #11 |
| 9 | **11** | Routes, layouts & 404 | A | B | `feature/11-routes-layout` | #4 |
| 10 | **12** | ProtectedRoute | A | C | `feature/12-protected-route` | #10, #11, #14 |
| 11 | **13** | Common components | B | A | `feature/13-common-components` | #6 |
| 12 | **14** | ToastContext & ConfirmModal | C | B | `feature/14-toast-confirm-modal` | #4 |
| 13 | **15** | useAxios & useDebounce | A | B | `feature/15-use-axios-debounce` | #7 |
| 14 | **16** | AppNavbar & Footer | B | C | `feature/16-navbar-footer` | #10, #11, #14 |
| 15 | **17** | LaptopCard & LaptopGrid | B | A | `feature/17-laptop-card-grid` | #13, #16 |

### Sprint 2 — Catalog & Detail

| Đề | GitHub | Title ngắn | Người | Reviewer | Nhánh (đúng) | Cần merge trước (GH) |
|---:|---:|---|---|---|---|---|
| 16 | **18** | Home page | B | C | `feature/18-home-page` | #8, #15, #17 |
| 17 | **19** | Laptop list | B | A | `feature/19-laptop-list` | #8, #15, #17, #20 |
| 18 | **20** | LaptopFilter | A | B | `feature/20-laptop-filter` | #8 |
| 19 | **21** | Navbar search suggest | A | C | `feature/21-search-suggest` | #15, #16 |
| 20 | **22** | Laptop detail | B | A | `feature/22-laptop-detail` | #8, #15, #17 |
| 21 | **23** | Review list & form | B | C | `feature/23-reviews` | #22 |

### Sprint 3 — Cart, Order & Admin

| Đề | GitHub | Title ngắn | Người | Reviewer | Nhánh (đúng) | Cần merge trước (GH) |
|---:|---:|---|---|---|---|---|
| 22 | **24** | CartContext | C | A | `feature/24-cart-context` | #9, #10, #17 |
| 23 | **25** | Cart page | C | B | `feature/25-cart-page` | #14, #24 |
| 24 | **26** | Checkout | C | A | `feature/26-checkout` | #25 |
| 25 | **27** | My orders | C | B | `feature/27-my-orders` | #15, #26 |
| 26 | **28** | Admin laptop table | A | C | `feature/28-admin-laptops` | #8, #12, #15 |
| 27 | **29** | Admin laptop form | C | A | `feature/29-admin-laptop-form` | #8, #12, #15 |
| 28 | **30** | Admin orders | C | B | `feature/30-admin-orders` | #9, #12, #15, #27 |
| 29 | **31** | Bulk delete | A | B | `feature/31-bulk-delete` | #28 |

### Sprint 4 — Test & Release

| Đề | GitHub | Title ngắn | Người | Reviewer | Nhánh (đúng) | Cần merge trước (GH) |
|---:|---:|---|---|---|---|---|
| 30 | **32** | README | B | A | `docs/32-readme` | #18 |
| 31 | **33** | Test report & video | C | A | `test/33-test-report` | #3–#32 (hết chức năng) |

Release `v1.0.0`: A làm · B + C approve (cần 2) · back-merge `main` → `develop` (B review).

---

## 5. Ai làm issue nào (theo số GitHub)

### Phước (A) — code

`#3` → `#4` → `#7` → `#11` → `#10` → `#15` → `#12` → `#20` → `#21` → `#28` → `#31` → release

### Quý (B) — code

`#6` → `#8` → `#13` → `#16` → `#17` → `#18` → `#19` → `#22` → `#23` → `#32`

### Nhân (C) — code

`#5` → `#9` → `#14` → `#24` → `#25` → `#26` → `#27` → `#29` → `#30` → `#33`

### Review (xoay vòng — số GitHub)

| Người | Review PR của issue |
|---|---|
| **A** | #5, #9, #13, #17, #19, #22, #24, #26, #29, #32, #33 |
| **B** | #3, #7, #11, #14, #15, #20, #25, #27, #30, #31 |
| **C** | #4, #6, #8, #10, #12, #16, #18, #21, #23, #28 |

---

## 6. Cách tra cứu nhanh khi đọc guide

1. Mở guide / code → thấy **đề #N**.
2. Tính **GH = N + 2**.
3. Mở issue trên GitHub: `.../issues/GH` — đọc tiêu chí chấp nhận tại đó.
4. Đặt nhánh / commit / PR theo **GH**, không theo N.
5. Code vẫn copy từ `Assignment_code.md` mục đề `#N` (nội dung code không đổi, chỉ số issue đổi).

**Checklist mỗi commit / PR:**

- [ ] Tên nhánh có **đúng số GitHub**
- [ ] Message có `Refs #<số-GitHub>`
- [ ] PR body có `Closes #<số-GitHub>`
- [ ] base = **`develop`**
- [ ] Đúng reviewer theo bảng trên

---

## 7. Nếu đã đặt nhánh sai số

| Tình huống | Cách xử lý |
|---|---|
| Nhánh local chưa push | `git branch -m ten-cu ten-dung` |
| Đã push nhánh sai | Đổi tên local → `git push -u origin ten-dung` → xóa remote cũ: `git push origin --delete ten-cu` |
| PR đang mở | Đổi base/compare hoặc đóng PR cũ, mở PR mới từ nhánh đúng; vẫn `Closes #<số-GitHub-đúng>` |
| Commit ghi `Refs #sai` | Commit mới không cần sửa cũ nếu PR sẽ squash; **tiêu đề PR + `Closes #` phải đúng** |

---

## 8. Thứ tự găng (Sprint 0) — số GitHub

```
#3 templates (A) → #4 setup (A)
                      ├→ #5 seed (C)
                      ├→ #6 format (B)
                      └→ #7 axios (A) → #8 laptop API (B)
                                      → #9 cart/order API (C)
```

A ưu tiên merge sớm: **`#3`, `#4`, `#7`** (và sau này `#11`, `#15`).

---

## 9. Link hữu ích

- Issues: https://github.com/phuocvanday/laptop-store-group6/issues
- Board: project **LaptopStore Board**
- Đề gốc (số “ảo” 1–31): `docs/ASSIGNMENT.md`
- Code từng issue (theo số đề 1–31): `Assignment_code.md` (Downloads) — nhớ **+2** khi đặt tên nhánh/Refs/Closes

---

**Tóm một câu:** *Guide nói `#N` → nhóm mình luôn dùng GitHub `#(N+2)`.*
