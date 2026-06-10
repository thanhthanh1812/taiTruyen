# Trình Tải Truyện Hùng Bá - Giao Diện Web

Ứng dụng Web tĩnh dùng để quét và tải truyện từ trang quản lý truyện của `truyenhdc.com` rồi đóng gói thành file Word (.docx) trực tiếp trên trình duyệt. Bạn có thể deploy trang này lên GitHub Pages để sử dụng mọi lúc mọi nơi trên điện thoại hoặc máy tính mà không cần cài đặt Python.

## Tính năng nổi bật
* **Giao diện hiện đại:** Thiết kế tối giản, sạch sẽ (nền trắng chủ đạo), tương thích tốt với cả máy tính và điện thoại.
* **Console Log trực quan:** Xem trực tiếp quá trình quét và tải chương (đã tải đến chương nào, trạng thái thành công/lỗi).
* **Xuất Word chất lượng cao:** Sử dụng thư viện `docx.js` để tạo file `.docx` định dạng chuẩn (Font chữ Times New Roman, Cỡ chữ 13pt, Dòng cách dòng 1.5, Tự động ngắt trang giữa các chương và thụt đầu dòng đoạn văn).
* **Bảo mật & Miễn phí:** Chạy hoàn toàn trên trình duyệt của bạn và qua Cloudflare Worker cá nhân nên Cookie không bao giờ bị lộ cho bên thứ ba.

---

## Hướng dẫn thiết lập chi tiết

### Bước 1: Tạo Cloudflare Worker làm Proxy (Bắt buộc để bypass CORS)
Vì các trình duyệt áp đặt chính sách bảo mật CORS và không cho phép JavaScript gửi Header Cookie tùy chỉnh tới trang web khác, bạn cần một proxy trung chuyển:
1. Đăng nhập hoặc đăng ký tài khoản miễn phí tại [Cloudflare](https://dash.cloudflare.com/).
2. Chọn **Workers & Pages** -> **Create application** -> **Create Worker**.
3. Đặt tên (ví dụ: `tai-truyen-proxy`) rồi bấm **Deploy**.
4. Sau khi deploy xong, click nút **Edit Code**.
5. Copy toàn bộ nội dung trong file [worker.js](worker.js) trong thư mục này và dán đè vào trình soạn thảo code của Cloudflare.
6. Bấm **Save and deploy**.
7. Copy đường dẫn Worker của bạn (ví dụ: `https://tai-truyen-proxy.username.workers.dev`).

### Bước 2: Cách lấy Cookie từ trình duyệt
1. Đăng nhập vào trang web `truyenhdc.com`.
2. Bấm phím `F12` (hoặc click chuột phải chọn `Inspect / Kiểm tra`) để mở DevTools.
3. Chuyển sang tab **Application** (Chrome/Edge/Safari) hoặc **Storage** (Firefox).
4. Ở danh mục bên trái, mở rộng phần **Cookies** và chọn `https://truyenhdc.com`.
5. Tìm Cookie có tên bắt đầu bằng `wordpress_logged_in_...` (ví dụ: `wordpress_logged_in_fc056e1f7bf1317b0c2c528e1dc3e0ac`):
   * Copy **Tên Cookie** dán vào ô tương ứng trên giao diện Web.
   * Copy **Giá trị (Value)** dán vào ô tương ứng trên giao diện Web.

### Bước 3: Deploy lên GitHub Pages để sử dụng Online
1. Tạo một repository mới trên GitHub (ví dụ: đặt tên là `tai-truyen`).
2. Upload các file sau lên repo:
   * `index.html`
   * `style.css`
   * `app.js`
3. Truy cập vào **Settings** của repository -> Chọn **Pages** ở menu bên trái.
4. Ở mục **Build and deployment**, thiết lập source là **Deploy from a branch**.
5. Chọn Branch là `main` (hoặc `master`), thư mục `/ (root)`, sau đó bấm **Save**.
6. Chờ khoảng 1-2 phút, GitHub Pages sẽ kích hoạt và cung cấp link website của bạn (ví dụ: `https://username.github.io/tai-truyen/`).

---

## Hướng dẫn sử dụng trên Web
1. Mở link trang web (hoặc chạy trực tiếp file `index.html` trên máy).
2. Nhập các thông tin cấu hình:
   * **Tên Cookie** và **Giá trị Cookie** (đã lấy ở Bước 2).
   * **ID Truyện** (ví dụ: `16756956`).
   * **Số trang** muốn quét (mặc định là `2`).
   * **Tên file** muốn đặt khi tải xuống.
   * **Địa chỉ CORS Proxy** (link Cloudflare Worker đã lấy ở Bước 1).
3. Nhấp nút **Tải Truyện và Xuất Word**.
4. Theo dõi quá trình chạy trên bảng **Console Log**. Khi chạy xong, file Word sẽ tự động tải xuống thiết bị của bạn.
