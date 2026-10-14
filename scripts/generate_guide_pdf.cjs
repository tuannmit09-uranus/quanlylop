const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

function generatePdf() {
  const fontRegular = fs.readFileSync('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf').toString('base64');
  const fontBold = fs.readFileSync('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf').toString('base64');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  doc.addFileToVFS('LiberationSans-Regular.ttf', fontRegular);
  doc.addFont('LiberationSans-Regular.ttf', 'LiberationSans', 'normal');
  doc.addFileToVFS('LiberationSans-Bold.ttf', fontBold);
  doc.addFont('LiberationSans-Bold.ttf', 'LiberationSans', 'bold');

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  function addHeaderFooter(pageNum, totalPages = 14) {
    if (pageNum === 1) return; // Skip cover
    doc.setFont('LiberationSans', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 160);
    doc.text('EDUTUTOR PRO — TÀI LIỆU HƯỚNG DẪN SỬ DỤNG v2.5.0-PRO', margin, 10);
    doc.text(`Trang ${pageNum} / ${totalPages}`, pageWidth - margin, 10, { align: 'right' });
    doc.setDrawColor(220, 225, 230);
    doc.line(margin, 12, pageWidth - margin, 12);

    // Footer
    doc.setDrawColor(235, 238, 242);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text('Hệ thống Quản lý Dạy học thêm & Đối soát Học phí Thông minh — Hotline/Zalo: 0986.07.07.68', margin, pageHeight - 8);
    doc.text('https://aquanlylop.vercel.app/', pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  function addImg(assetName, x, y, w, h) {
    const assetPath = path.join(__dirname, '..', 'public', 'manual_assets', assetName);
    if (fs.existsSync(assetPath)) {
      const b64 = fs.readFileSync(assetPath).toString('base64');
      doc.addImage('data:image/png;base64,' + b64, 'PNG', x, y, w, h);
    }
  }

  // ================= PAGE 1: COVER =================
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative header band
  doc.setFillColor(37, 99, 235);
  doc.rect(margin, 25, contentWidth, 3, 'F');

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(30, 58, 138);
  doc.text('EDUTUTOR PRO', 105, 45, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(71, 85, 105);
  doc.text('HỆ THỐNG QUẢN LÝ DẠY HỌC THÊM & TRUNG TÂM ĐÀO TẠO THÔNG MINH', 105, 54, { align: 'center' });

  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.8);
  doc.line(65, 62, 145, 62);

  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text('TÀI LIỆU HƯỚNG DẪN SỬ DỤNG', 105, 85, { align: 'center' });

  // Table header
  const tableY = 115;
  const col1W = 60;
  const col2W = contentWidth - col1W;

  doc.setFillColor(15, 23, 42);
  doc.rect(margin, tableY, contentWidth, 10, 'F');
  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('THÔNG TIN TÀI LIỆU', margin + col1W / 2, tableY + 6.5, { align: 'center' });
  doc.text('CHI TIẾT VẬN HÀNH', margin + col1W + col2W / 2, tableY + 6.5, { align: 'center' });

  const rows = [
    ['Sản phẩm ứng dụng', 'EduTutor Pro (Phiên bản Web SPA, PWA Mobile & Desktop)'],
    ['Mã phát hành', 'v2.5.0-PRO (Tháng 10/2026)'],
    ['Đối tượng sử dụng', 'Ban Giám đốc, Giáo viên, Nhân viên Vận hành, Phụ huynh, Học sinh'],
    ['Cơ sở dữ liệu & Xác thực', 'Google Cloud Platform & Firebase Authentication / Cloud Firestore'],
    ['Tiêu chuẩn thanh toán', 'VietQR Napas 247 Dynamic Matching'],
    ['SĐT/Zalo/Email', '0986.07.07.68 - tuannmit09@gmail.com'],
    ['Ngày xuất bản', '05/10/2026'],
  ];

  let currentY = tableY + 10;
  rows.forEach(([c1, c2], idx) => {
    const rowH = 10;
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, currentY, contentWidth, rowH, 'F');

    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, currentY, col1W, rowH, 'S');
    doc.rect(margin + col1W, currentY, col2W, rowH, 'S');

    doc.setFont('LiberationSans', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(c1, margin + 4, currentY + 6.5);

    doc.setFont('LiberationSans', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(c2, margin + col1W + 4, currentY + 6.5);

    currentY += rowH;
  });

  // Footer note on cover
  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Bản quyền © 2026 EduTutor Pro. Tài liệu hỗ trợ vận hành và hướng dẫn nghiệp vụ chuẩn.', 105, 275, { align: 'center' });

  // ================= PAGE 2 =================
  doc.addPage();
  addHeaderFooter(2);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Đăng nhập & Đăng ký', margin, 20);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('- Truy cập link: https://aquanlylop.vercel.app/', margin, 27);

  addImg('01_login_authentication.png', margin, 31, contentWidth, 80);

  doc.text('- Có thể quét mã QR để cài đặt trên Điện thoại: Thuận tiện cho việc điểm danh mọi lúc mọi nơi.', margin, 116);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Thêm Trường học', margin, 126);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('- Nếu bạn muốn quản lý học sinh của bạn đang học ở Trường nào', margin, 133);

  addImg('06_school_management.png', margin, 137, contentWidth, 75);

  // ================= PAGE 3 =================
  doc.addPage();
  addHeaderFooter(3);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Thêm Môn học', margin, 20);
  addImg('07_subject_management.png', margin, 24, contentWidth, 68);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.text('4. Thêm Lớp học', margin, 98);
  addImg('08_class_management.png', margin, 102, contentWidth, 68);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.text('5. Thêm Học sinh', margin, 176);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('- Bạn thêm Học sinh bằng 3 cách:', margin, 183);
  doc.text('    o Thêm từng học sinh một', margin, 189);
  doc.text('    o Thêm nhiều học sinh từ file excel', margin, 195);
  doc.text('    o Thêm nhiều học sinh = copy – parse', margin, 201);

  doc.setFont('LiberationSans', 'bold');
  doc.text('5.1. Thêm từng học sinh', margin, 210);
  doc.setFont('LiberationSans', 'normal');
  doc.text('- Bạn có thể thêm thông tin phụ huynh để liên hệ và sau này cấp tài khoản cho PH vào xem học phí và bài tập của con', margin, 217);

  // ================= PAGE 4 =================
  doc.addPage();
  addHeaderFooter(4);

  addImg('09_student_management.png', margin, 18, contentWidth, 68);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('5.2. Thêm nhiều học sinh từ file excel', margin, 92);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('- Tải file excel mẫu xuống -> Điền thông tin -> Tải file excel lên', margin, 99);

  addImg('09_student_management.png', margin, 104, contentWidth, 80);

  // ================= PAGE 5 =================
  doc.addPage();
  addHeaderFooter(5);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('5.3. Thêm nhiều học sinh = copy – parse', margin, 20);

  addImg('09_student_management.png', margin, 25, contentWidth, 85);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('6. Cấp tài khoản cho Học sinh & Phụ Huynh', margin, 116);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('Bạn có thể cấp tài khoản cho HS và PH để vào phần mềm. HS và PH sẽ nhìn thấy', margin, 123);
  doc.text('Học phí hàng tháng, theo dõi điểm số từng buổi học và nhận xét của Thầy cô.', margin, 129);

  addImg('10_account_management.png', margin, 134, contentWidth, 80);

  // ================= PAGE 6 =================
  doc.addPage();
  addHeaderFooter(6);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('7. Xếp lịch học', margin, 20);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('- Bước 1: Tạo lịch học', margin, 27);
  doc.text('- Bước 2: Nhấn Sinh buổi học tháng để thực hiện điểm danh được', margin, 33);

  addImg('11_schedule_management.png', margin, 37, contentWidth, 55);

  doc.text('- Bạn có thể thêm lịch học phát sinh, hoặc đổi lịch học – huỷ lịch học – xoá lịch học', margin, 97);
  addImg('12_session_management.png', margin, 101, contentWidth, 55);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('8. Điểm danh', margin, 162);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('- Chọn Lớp -> chọn Tháng -> Chọn buổi học', margin, 169);
  doc.text('- Thầy cô có thể điểm danh từng em. Hoặc chọn Điểm danh có mặt tất cả, hoặc Đặt lại (Chưa điểm danh)', margin, 175);
  doc.text('- Điểm danh có mặt tất cả: nếu số HS đi học nhiều hơn số HS nghỉ học, lúc đó GV tích chọn HS nghỉ học', margin, 181);
  doc.setFont('LiberationSans', 'bold');
  doc.text('- Ghi chú: GV nên cài app trên Điện thoại, tiện dụng Điểm danh mọi lúc mọi nơi.', margin, 187);

  // ================= PAGE 7 =================
  doc.addPage();
  addHeaderFooter(7);

  addImg('13_attendance_management.png', margin, 18, contentWidth, 68);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('9. Cài đặt Tài khoản Ngân hàng để tạo QR code nhận tiền', margin, 92);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('- Điền tài khoản Ngân hàng để hệ thống tạo mã QR code cho Phụ Huynh quét', margin, 99);
  doc.text('  Thanh toán Học phí của con em mình.', margin, 105);
  doc.text('- Hệ thống sẽ tự sinh mã QR: theo học sinh, tháng học, số tiền học', margin, 111);
  doc.setFont('LiberationSans', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text('- Lưu ý: Tên chủ tài khoản: đầy đủ họ tên. Không ghi Thầy A, Cô B.', margin, 117);

  addImg('18_vietqr_payment.png', margin, 122, contentWidth, 80);

  // ================= PAGE 8 =================
  doc.addPage();
  addHeaderFooter(8);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('10. Bảng kê và tính học phí', margin, 20);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('- Sau khi điểm danh thì học phí của từng HS sẽ được tính tự động.', margin, 27);
  doc.text('- Giáo viên vào chức năng để xem học phí, gửi học phí cho PH và đánh dấu những PH đã Nộp học phí.', margin, 33);
  doc.text('- Chọn kỳ thu để xem', margin, 39);
  doc.text('- Có thể chọn theo lớp để xem, hoặc xem tất cả', margin, 45);
  doc.text('- Khi phụ huynh (PH) nộp tiền mặt hoặc chuyển khoản qua Zalo, không theo cú pháp QR thì', margin, 51);
  doc.text('  giáo viên (GV) đánh dấu đã nộp thủ công.', margin, 57);

  addImg('17_tuition_management.png', margin, 63, contentWidth, 90);

  // ================= PAGE 9 =================
  doc.addPage();
  addHeaderFooter(9);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('- Giáo viên muốn xuất toàn bộ Học phí của một lớp tất cả các HS ra file Pdf để gửi vào nhóm PH thu tiền.', margin, 20);
  doc.text('  Hệ thống sẽ sinh ra file Pdf, mỗi em HS là 1 trang Pdf thông báo Học phí.', margin, 26);
  doc.setFont('LiberationSans', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text('  Lưu ý: nhắc PH chỉ việc Quét QR và thực hiện chuyển khoản. Không thực hiện thay đổi nội dung chuyển tiền.', margin, 32);

  addImg('18_vietqr_payment.png', margin, 38, contentWidth, 80);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('- Sau khi tải file pdf về, GV mở file kiểm tra lại 1 lần cho chính xác.', margin, 124);
  doc.text('- Đặc biệt GV nên quét thử mã QR để xem có Hiện đúng thông tin Tài khoản của mình không.', margin, 130);
  doc.text('- Tránh trường hợp vô tình GV cài đặt sai số TK nhận tiền.', margin, 136);

  // ================= PAGE 10 =================
  doc.addPage();
  addHeaderFooter(10);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('11. Sao kê và Đối soát học phí tự động', margin, 20);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('- Mục đích: giảm thiểu thời gian đối chiếu thủ công việc nhận được tiền của PH. Vì công việc này hiện nay', margin, 27);
  doc.text('  tốn rất nhiều thời gian của GV, và không thể kiểm soát hết những PH nào đã nộp tiền.', margin, 33);

  // Video guide callout box
  doc.setFillColor(254, 242, 242);
  doc.rect(margin, 38, contentWidth, 14, 'F');
  doc.setDrawColor(248, 113, 113);
  doc.rect(margin, 38, contentWidth, 14, 'S');
  doc.setFont('LiberationSans', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text('🎬 Video hướng dẫn trích xuất sao kê từ tài khoản ngân hàng (YouTube):', margin + 4, 44);
  doc.setFont('LiberationSans', 'normal');
  doc.setTextColor(37, 99, 235);
  doc.text('https://www.youtube.com/watch?v=lBMk39wyZzU', margin + 4, 49.5);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('- Bước 1:', margin, 58);
  doc.text('    o Bạn đăng nhập vào website ngân hàng bạn đang dùng. Nếu không rõ bạn có thể ra Ngân hàng hỏi', margin, 64);
  doc.text('      cách đăng nhập trên website.', margin, 70);
  doc.text('    o Bạn vào phần lịch sử giao dịch -> chọn khoảng thời gian giao dịch. Khoảng thời gian đủ dài để đảm bảo', margin, 76);
  doc.text('      các giao dịch xuất hiện. Vd bạn thu học phí tháng 9, Nghĩa là đầu tháng 10 bạn mới gửi bảng học phí', margin, 82);
  doc.text('      cho PH, vì vậy các giao dịch nên chọn: 01/10/2026 – 31/10/2026.', margin, 88);
  doc.text('    o Tải file sao kê của bạn về máy tính.', margin, 94);
  doc.text('- Bước 2:', margin, 102);
  doc.text('    o Mở file sao kê, xoá các dữ liệu không cần thiết, để lại mỗi bảng sao kê thôi.', margin, 108);
  doc.text('      Để lại các cột trong bảng: STT, Ngày giao dịch, Số tiền, Nội dung.', margin, 114);
  doc.text('- Bước 3: Tải sao kê đó lên Phần mềm (Nút Import Sao Kê Excel).', margin, 122);
  doc.text('- Bước 4: Chọn kỳ Sao kê đối soát. Vd chọn tháng 9.', margin, 128);
  doc.text('- Bước 5: Nhấn nút: Chạy đối soát tự động.', margin, 134);

  // ================= PAGE 11 =================
  doc.addPage();
  addHeaderFooter(11);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Sau bước này hệ thống sẽ báo kết quả:', margin, 20);

  doc.setFont('LiberationSans', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('• Các giao dịch khớp hệ thống sẽ báo: Khớp (Khớp nội dung & tiền)', margin, 28);
  doc.setTextColor(217, 119, 6);
  doc.text('• Các giao dịch không khớp hệ thống sẽ báo: Chưa gán học phí', margin, 35);

  addImg('19_bank_reconciliation.png', margin, 42, contentWidth, 80);

  // ================= PAGE 12 =================
  doc.addPage();
  addHeaderFooter(12);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('- Lúc này GV sẽ nhìn nội dung chuyển tiền để biết là Học sinh nào đóng.', margin, 20);
  doc.text('- Sau đó nhấn vào Nút Khớp để gán thủ công. Bảng danh sách học sinh hiện lên: GV có thể tìm theo', margin, 26);
  doc.text('  tên HS và gán cho HS.', margin, 32);

  doc.setFont('LiberationSans', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('• Tính năng nâng cấp: Hệ thống tự động lọc chỉ hiển thị học sinh của tháng đang đối soát và chỉ hiện', margin, 40);
  doc.text('  các học sinh chưa nộp học phí, giúp giáo viên gán cực kỳ nhanh chóng và không nhầm lẫn.', margin, 46);

  addImg('19_bank_reconciliation.png', margin, 52, contentWidth, 85);

  // ================= PAGE 13 =================
  doc.addPage();
  addHeaderFooter(13);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138);
  doc.text('PHẦN DÀNH CHO GIẢNG DẠY', 105, 20, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Tạo bài học', margin, 32);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('- Giáo viên tạo bài học theo khối: để học sinh nắm bắt được trước khi đi học.', margin, 39);

  addImg('14_lesson_management.png', margin, 43, contentWidth, 68);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Nhận xét và Điểm số', margin, 118);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('- Với mỗi bài học: GV nhận xét về khả năng tiếp thu bài học của từng học sinh và cho điểm số trên lớp.', margin, 125);
  doc.text('- Phụ huynh và Học sinh khi có tài khoản vào phần mềm sẽ theo dõi được nhận xét và điểm số', margin, 131);
  doc.text('  theo từng buổi học đó.', margin, 137);

  addImg('16_evaluation_management.png', margin, 142, contentWidth, 68);

  // ================= PAGE 14 =================
  doc.addPage();
  addHeaderFooter(14);

  doc.setFont('LiberationSans', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Bài tập về nhà', margin, 20);

  doc.setFont('LiberationSans', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('- Giáo viên giao bài tập về nhà cho HS.', margin, 27);
  doc.text('- HS làm bài tập về nhà và tải ảnh bài tập lên để nộp.', margin, 33);
  doc.text('- GV sẽ cho điểm bài tập về nhà của HS.', margin, 39);

  addImg('15_homework_management.png', margin, 44, contentWidth, 85);

  const outPath = path.join(__dirname, '..', 'public', 'Huong_Dan_Su_Dung_EduTutor_Pro.pdf');
  const pdfBytes = doc.output('arraybuffer');
  fs.writeFileSync(outPath, Buffer.from(pdfBytes));
  console.log('Successfully generated:', outPath, 'Bytes:', pdfBytes.byteLength);
}

generatePdf();
