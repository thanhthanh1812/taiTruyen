# Tool tải truyện HD - Giao Diện Web

Ứng dụng Web tĩnh dùng để quét và tải truyện từ trang quản lý truyện của `truyenhdc.com` rồi đóng gói thành file Word (.docx) trực tiếp trên trình duyệt. Bạn có thể deploy trang này lên GitHub Pages để sử dụng mọi lúc mọi nơi trên điện thoại hoặc máy tính mà không cần cài đặt Python.

## Tính năng nổi bật
* **Giao diện hiện đại:** Thiết kế tối giản, sạch sẽ (nền trắng chủ đạo), tương thích tốt với cả máy tính và điện thoại.
* **Console Log trực quan:** Xem trực tiếp quá trình quét và tải chương (đã tải đến chương nào, trạng thái thành công/lỗi).
* **Xuất Word chất lượng cao:** Sử dụng thư viện `docx.js` để tạo file `.docx` định dạng chuẩn (Font chữ Times New Roman, Cỡ chữ 13pt, Dòng cách dòng 1.5, Tự động ngắt trang giữa các chương và thụt đầu dòng đoạn văn).
* **Bảo mật & Miễn phí:** Chạy hoàn toàn trên trình duyệt của bạn nên Cookie không bao giờ bị lộ cho bên thứ ba.

---

## Hướng dẫn vượt rào CORS (Giải quyết lỗi chặn mạng của trình duyệt)

Khi chạy ứng dụng JavaScript trực tiếp trên trình duyệt để gọi API từ trang web khác (`truyenhdc.com`), bạn sẽ bị trình duyệt chặn lại do chính sách bảo mật CORS. Có **2 cách** để giải quyết vấn đề này:

### Cách 1: Sử dụng Extension trình duyệt (Đơn giản nhất, không cần cài đặt Proxy)
Nếu bạn chỉ chạy Tool trên máy tính cá nhân của mình, bạn không cần thiết lập Proxy Cloudflare. Thay vào đó:
1. Cài đặt một Extension hỗ trợ bỏ qua CORS trên Chrome/Edge (ví dụ: **Allow CORS: Access-Control-Allow-Origin** hoặc **CORS Unblock**).
2. Bật Extension đó lên (biểu tượng Extension sẽ chuyển sang màu cam hoặc xanh lá biểu thị trạng thái đang hoạt động).
3. Đăng nhập vào trang web `truyenhdc.com` trên cùng trình duyệt đó để trình duyệt tự lưu Cookie.
4. Trên giao diện của **Tool tải truyện HD**, bạn **để trống** ô **Địa chỉ CORS Proxy** là có thể bắt đầu tải bình thường.

### Cách 2: Tạo Cloudflare Worker làm Proxy (Dành cho việc sử dụng trên điện thoại hoặc khi không muốn dùng Extension)
Nếu bạn muốn sử dụng Tool trên điện thoại hoặc không muốn cài đặt extension:
1. Đăng nhập hoặc đăng ký tài khoản miễn phí tại [Cloudflare](https://dash.cloudflare.com/).
2. Chọn **Workers & Pages** -> **Create application** -> **Create Worker**.
3. Đặt tên (ví dụ: `tai-truyen-proxy`) rồi bấm **Deploy**.
4. Sau khi deploy xong, click nút **Edit Code**.
5. Copy toàn bộ nội dung trong file [worker.js](worker.js) trong thư mục này và dán đè vào trình soạn thảo code của Cloudflare.
6. Bấm **Save and deploy**.
7. Copy đường dẫn Worker của bạn (ví dụ: `https://tai-truyen-proxy.username.workers.dev`) dán vào ô **Địa chỉ CORS Proxy** trên giao diện Web.

---

## Hướng dẫn lấy Cookie từ trình duyệt
1. Đăng nhập vào trang web `truyenhdc.com`.
2. Bấm phím `F12` (hoặc click chuột phải chọn `Inspect / Kiểm tra`) để mở DevTools.
3. Chuyển sang tab **Application** (Chrome/Edge/Safari) hoặc **Storage** (Firefox).
4. Ở danh mục bên trái, mở rộng phần **Cookies** và chọn `https://truyenhdc.com`.
5. Tìm Cookie có tên bắt đầu bằng `wordpress_logged_in_...` (ví dụ: `wordpress_logged_in_fc056e1f7bf1317b0c2c528e1dc3e0ac`):
   * Copy **Tên Cookie** dán vào ô tương ứng trên giao diện Web.
   * Copy **Giá trị (Value)** dán vào ô tương ứng trên giao diện Web.

---

## Hướng dẫn Deploy lên GitHub Pages
1. Upload các file sau lên repository GitHub của bạn (ở thư mục gốc):
   * `index.html`
   * `style.css`
   * `app.js`
2. Truy cập vào **Settings** của repository -> Chọn **Pages** ở menu bên trái.
3. Ở mục **Build and deployment**, thiết lập source là **Deploy from a branch**.
4. Chọn Branch là `main` (hoặc `master`), thư mục `/ (root)`, sau đó bấm **Save**.
5. Chờ khoảng 1-2 phút, GitHub Pages sẽ kích hoạt và cung cấp link website của bạn (ví dụ: `https://username.github.io/tai-truyen/`).
