import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('public/manual_assets');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Helper to wrap SVG in sharp and save as PNG
async function saveSvgAsPng(filename, svgContent) {
  const filePath = path.join(OUT_DIR, filename);
  // Sanitize any unescaped & to &amp; for valid XML
  const cleanSvg = svgContent.replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;');
  const buffer = Buffer.from(cleanSvg);
  await sharp(buffer)
    .png({ quality: 95 })
    .toFile(filePath);
  console.log(`Saved ${filename} (${fs.statSync(filePath).size} bytes)`);
}

// Common UI templates
function getAppShell({ title, activeNav, userRole = 'Giáo viên', contentSvg }) {
  return `
  <svg width="1100" height="640" viewBox="0 0 1100 640" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
    <defs>
      <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#2563EB" />
        <stop offset="100%" stop-color="#1D4ED8" />
      </linearGradient>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0F172A" />
        <stop offset="100%" stop-color="#1E293B" />
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.08"/>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="1100" height="640" fill="#F8FAFC" />

    <!-- Top Navbar -->
    <rect x="0" y="0" width="1100" height="56" fill="url(#headerGrad)" />
    <!-- Logo -->
    <rect x="20" y="12" width="32" height="32" rx="8" fill="#3B82F6" />
    <text x="36" y="33" fill="#FFFFFF" font-size="18" font-weight="bold" text-anchor="middle">E</text>
    <text x="62" y="33" fill="#FFFFFF" font-size="16" font-weight="bold">EduTutor</text>
    <text x="135" y="33" fill="#60A5FA" font-size="16" font-weight="bold">PRO</text>
    <rect x="180" y="18" width="130" height="22" rx="6" fill="#334155" />
    <text x="245" y="33" fill="#94A3B8" font-size="11" text-anchor="middle">Cơ sở: CS1 - Cầu Giấy</text>

    <!-- Top Right User Info -->
    <rect x="880" y="14" width="200" height="30" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1" />
    <circle cx="900" cy="29" r="10" fill="#3B82F6" />
    <text x="900" y="33" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">GV</text>
    <text x="918" y="27" fill="#F1F5F9" font-size="11" font-weight="bold">Thầy Quang</text>
    <text x="918" y="38" fill="#94A3B8" font-size="9">${userRole}</text>
    <rect x="1035" y="19" width="36" height="18" rx="4" fill="#059669" />
    <text x="1053" y="31" fill="#FFFFFF" font-size="9" font-weight="bold" text-anchor="middle">ONLINE</text>

    <!-- Left Sidebar -->
    <rect x="0" y="56" width="200" height="584" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
    
    <!-- Sidebar Items -->
    ${[
      { id: 'dashboard', label: 'Tổng quan (Dashboard)' },
      { id: 'classes', label: 'Quản lý Lớp học' },
      { id: 'students', label: 'Danh sách Học sinh' },
      { id: 'schedules', label: 'Thời khóa biểu' },
      { id: 'sessions', label: 'Quản lý Buổi học' },
      { id: 'attendance', label: 'Điểm danh Chuyên cần' },
      { id: 'homework', label: 'Bài tập về nhà' },
      { id: 'evaluations', label: 'Đánh giá & Nhận xét' },
      { id: 'tuition', label: 'Học phí & VietQR' },
      { id: 'reconciliation', label: 'Đối soát Ngân hàng' },
      { id: 'accounts', label: 'Quản lý Tài khoản' },
      { id: 'settings', label: 'Cấu hình Hệ thống' }
    ].map((item, idx) => {
      const isActive = activeNav === item.id;
      const y = 72 + idx * 38;
      return `
        <rect x="10" y="${y}" width="180" height="32" rx="6" fill="${isActive ? '#EFF6FF' : 'transparent'}" />
        <circle cx="26" cy="${y + 16}" r="4" fill="${isActive ? '#2563EB' : '#94A3B8'}" />
        <text x="38" y="${y + 20}" fill="${isActive ? '#1D4ED8' : '#475569'}" font-size="11" font-weight="${isActive ? 'bold' : 'normal'}">${item.label}</text>
      `;
    }).join('')}

    <!-- Main Content Area -->
    <g transform="translate(216, 70)">
      <!-- Page Header -->
      <text x="0" y="20" fill="#0F172A" font-size="18" font-weight="bold">${title}</text>
      ${contentSvg}
    </g>
  </svg>
  `;
}

async function run() {
  console.log('Generating 20 UI mockups for user manual...');

  // 1. Login & Auth
  await saveSvgAsPng('01_login_authentication.png', `
  <svg width="1100" height="640" viewBox="0 0 1100 640" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
    <defs>
      <linearGradient id="loginBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F172A" />
        <stop offset="50%" stop-color="#1E293B" />
        <stop offset="100%" stop-color="#0284C7" />
      </linearGradient>
    </defs>
    <rect width="1100" height="640" fill="url(#loginBg)" />
    
    <!-- Login Card -->
    <rect x="350" y="60" width="400" height="520" rx="16" fill="#FFFFFF" />
    
    <!-- Logo Badge -->
    <rect x="525" y="85" width="50" height="50" rx="12" fill="#2563EB" />
    <text x="550" y="118" fill="#FFFFFF" font-size="28" font-weight="bold" text-anchor="middle">E</text>
    
    <text x="550" y="160" fill="#0F172A" font-size="20" font-weight="bold" text-anchor="middle">EduTutor PRO</text>
    <text x="550" y="180" fill="#64748B" font-size="12" text-anchor="middle">Hệ thống Quản lý Dạy học &amp; Trung tâm Đào tạo</text>
    
    <!-- Role selector tabs -->
    <rect x="380" y="200" width="340" height="34" rx="8" fill="#F1F5F9" />
    <rect x="382" y="202" width="82" height="30" rx="6" fill="#2563EB" />
    <text x="423" y="221" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">Giáo viên</text>
    <text x="508" y="221" fill="#475569" font-size="11" text-anchor="middle">Quản trị viên</text>
    <text x="593" y="221" fill="#475569" font-size="11" text-anchor="middle">Phụ huynh</text>
    <text x="678" y="221" fill="#475569" font-size="11" text-anchor="middle">Học sinh</text>

    <!-- Input: Account -->
    <text x="380" y="260" fill="#334155" font-size="12" font-weight="600">Số điện thoại hoặc Email</text>
    <rect x="380" y="270" width="340" height="42" rx="8" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5" />
    <text x="395" y="296" fill="#0F172A" font-size="13">thayquang.toan@edututor.vn</text>
    
    <!-- Input: Password -->
    <text x="380" y="335" fill="#334155" font-size="12" font-weight="600">Mật khẩu</text>
    <rect x="380" y="345" width="340" height="42" rx="8" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5" />
    <text x="395" y="371" fill="#64748B" font-size="13">• • • • • • • • • • • •</text>

    <!-- Remember Account Checkbox -->
    <rect x="380" y="402" width="18" height="18" rx="4" fill="#2563EB" />
    <path d="M384 411 L388 415 L394 406" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round" />
    <text x="408" y="415" fill="#1E293B" font-size="12" font-weight="500">Ghi nhớ tài khoản trên thiết bị này</text>
    
    <!-- Clear saved account badge -->
    <rect x="635" y="402" width="85" height="18" rx="4" fill="#FEE2E2" />
    <text x="677" y="414" fill="#DC2626" font-size="10" font-weight="bold" text-anchor="middle">Xóa đã nhớ ✕</text>

    <!-- Login Button -->
    <rect x="380" y="435" width="340" height="44" rx="8" fill="#2563EB" />
    <text x="550" y="462" fill="#FFFFFF" font-size="14" font-weight="bold" text-anchor="middle">ĐĂNG NHẬP VÀO HỆ THỐNG</text>

    <!-- Forgot password & help -->
    <text x="550" y="505" fill="#2563EB" font-size="12" text-anchor="middle" text-decoration="underline">Quên mật khẩu hoặc cần hỗ trợ tài khoản?</text>
    
    <!-- Security guarantee badge -->
    <rect x="380" y="525" width="340" height="35" rx="6" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1" />
    <text x="550" y="546" fill="#166534" font-size="11" text-anchor="middle">🔒 Bảo mật đa tầng: Không lưu mật khẩu &amp; Phiên Firebase an toàn</text>
  </svg>
  `);

  // 2. Account Activation
  await saveSvgAsPng('02_account_activation.png', `
  <svg width="1100" height="640" viewBox="0 0 1100 640" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
    <rect width="1100" height="640" fill="#0F172A" opacity="0.9" />
    
    <!-- Modal Card -->
    <rect x="320" y="90" width="460" height="460" rx="16" fill="#FFFFFF" />
    
    <!-- Header -->
    <circle cx="550" cy="140" r="28" fill="#EFF6FF" />
    <path d="M542 140 L548 146 L558 134" stroke="#2563EB" stroke-width="3" fill="none" stroke-linecap="round" />
    <text x="550" y="190" fill="#0F172A" font-size="18" font-weight="bold" text-anchor="middle">Kích hoạt Tài khoản EduTutor</text>
    <text x="550" y="210" fill="#64748B" font-size="12" text-anchor="middle">Chào mừng bạn gia nhập hệ thống đào tạo thông minh</text>

    <!-- Account Details -->
    <rect x="350" y="230" width="400" height="65" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
    <text x="365" y="252" fill="#475569" font-size="11">Email kích hoạt: <tspan fill="#0F172A" font-weight="bold">phuhuynh.nam@gmail.com</tspan></text>
    <text x="365" y="272" fill="#475569" font-size="11">Vai trò được cấp: <tspan fill="#2563EB" font-weight="bold">Phụ huynh học sinh (Nguyễn Hoàng Nam)</tspan></text>
    <text x="365" y="287" fill="#059669" font-size="10">✓ Mã kích hoạt token hợp lệ và sẵn sàng</text>

    <!-- Password form -->
    <text x="350" y="320" fill="#334155" font-size="12" font-weight="600">Thiết lập mật khẩu mới (tối thiểu 6 ký tự)</text>
    <rect x="350" y="328" width="400" height="40" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5" />
    <text x="365" y="352" fill="#0F172A" font-size="12">• • • • • • • • • •</text>

    <text x="350" y="390" fill="#334155" font-size="12" font-weight="600">Xác nhận lại mật khẩu</text>
    <rect x="350" y="398" width="400" height="40" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5" />
    <text x="365" y="422" fill="#0F172A" font-size="12">• • • • • • • • • •</text>

    <!-- Action button -->
    <rect x="350" y="460" width="400" height="44" rx="8" fill="#059669" />
    <text x="550" y="487" fill="#FFFFFF" font-size="14" font-weight="bold" text-anchor="middle">HOÀN TẤT KÍCH HOẠT &amp; ĐĂNG NHẬP NGAY</text>
  </svg>
  `);

  // 3. Teacher Dashboard
  await saveSvgAsPng('03_teacher_dashboard.png', getAppShell({
    title: 'Bảng điều khiển Trung tâm Giáo viên &amp; Quản trị viên',
    activeNav: 'dashboard',
    contentSvg: `
      <!-- Top 4 Stats -->
      <g transform="translate(0, 35)">
        <!-- Stat 1 -->
        <rect x="0" y="0" width="200" height="90" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
        <rect x="15" y="15" width="36" height="36" rx="8" fill="#EFF6FF" />
        <text x="33" y="38" fill="#2563EB" font-size="16" text-anchor="middle" font-weight="bold">📚</text>
        <text x="60" y="28" fill="#64748B" font-size="11">Lớp đang dạy</text>
        <text x="60" y="52" fill="#0F172A" font-size="22" font-weight="bold">6 lớp</text>
        <text x="15" y="76" fill="#059669" font-size="10">↑ Hoạt động 100%</text>

        <!-- Stat 2 -->
        <rect x="215" y="0" width="200" height="90" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
        <rect x="230" y="15" width="36" height="36" rx="8" fill="#F0FDF4" />
        <text x="248" y="38" fill="#16A34A" font-size="16" text-anchor="middle" font-weight="bold">👥</text>
        <text x="275" y="28" fill="#64748B" font-size="11">Tổng học sinh</text>
        <text x="275" y="52" fill="#0F172A" font-size="22" font-weight="bold">142 em</text>
        <text x="230" y="76" fill="#059669" font-size="10">✓ 100% đã xếp lớp</text>

        <!-- Stat 3 -->
        <rect x="430" y="0" width="200" height="90" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
        <rect x="445" y="15" width="36" height="36" rx="8" fill="#FEF3C7" />
        <text x="463" y="38" fill="#D97706" font-size="16" text-anchor="middle" font-weight="bold">📅</text>
        <text x="490" y="28" fill="#64748B" font-size="11">Buổi dạy / Tháng</text>
        <text x="490" y="52" fill="#0F172A" font-size="22" font-weight="bold">48 buổi</text>
        <text x="445" y="76" fill="#2563EB" font-size="10">Đã xong: 34 buổi</text>

        <!-- Stat 4 -->
        <rect x="645" y="0" width="215" height="90" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
        <rect x="660" y="15" width="36" height="36" rx="8" fill="#F5F3FF" />
        <text x="678" y="38" fill="#7C3AED" font-size="16" text-anchor="middle" font-weight="bold">💰</text>
        <text x="705" y="28" fill="#64748B" font-size="11">Doanh thu thu về</text>
        <text x="705" y="52" fill="#0F172A" font-size="20" font-weight="bold">42.500.000 đ</text>
        <text x="660" y="76" fill="#059669" font-size="10">Đã thu: 92.4%</text>
      </g>

      <!-- Middle row: Quick Action Checklist & Financial Chart -->
      <g transform="translate(0, 145)">
        <!-- Left: Action box -->
        <rect x="0" y="0" width="480" height="350" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
        <text x="20" y="30" fill="#0F172A" font-size="14" font-weight="bold">Cần xử lý hôm nay (To-do List)</text>
        <rect x="400" y="14" width="60" height="22" rx="6" fill="#FEE2E2" />
        <text x="430" y="29" fill="#DC2626" font-size="10" font-weight="bold" text-anchor="middle">3 việc gấp</text>

        <!-- Action Item 1 -->
        <rect x="15" y="50" width="450" height="60" rx="8" fill="#FEF2F2" stroke="#FECACA" stroke-width="1" />
        <text x="30" y="72" fill="#991B1B" font-size="12" font-weight="bold">🔴 Điểm danh ca tối: Lớp 10A1 - Toán Chuyên</text>
        <text x="30" y="92" fill="#7F1D1D" font-size="11">Thời gian: 18:00 - 20:00 • 24 học sinh đang chờ điểm danh</text>
        <rect x="360" y="65" width="90" height="30" rx="6" fill="#DC2626" />
        <text x="405" y="84" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">Điểm danh ngay</text>

        <!-- Action Item 2 -->
        <rect x="15" y="120" width="450" height="60" rx="8" fill="#FFFBEB" stroke="#FDE68A" stroke-width="1" />
        <text x="30" y="142" fill="#92400E" font-size="12" font-weight="bold">🟡 4 giao dịch VietQR mới cần đối soát sao kê</text>
        <text x="30" y="162" fill="#78350F" font-size="11">Phụ huynh vừa thanh toán qua ngân hàng • Tổng 4.800.000 đ</text>
        <rect x="360" y="135" width="90" height="30" rx="6" fill="#D97706" />
        <text x="405" y="154" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">Đối soát ngay</text>

        <!-- Action Item 3 -->
        <rect x="15" y="190" width="450" height="60" rx="8" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1" />
        <text x="30" y="212" fill="#1E40AF" font-size="12" font-weight="bold">🔵 Đánh giá năng lực: Buổi học số 12 - Lớp 12A2</text>
        <text x="30" y="232" fill="#1E3A8A" font-size="11">Chủ đề Hình học Oxyz • Cần gửi nhận xét tới phụ huynh</text>
        <rect x="360" y="205" width="90" height="30" rx="6" fill="#2563EB" />
        <text x="405" y="224" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">Chấm &amp; Đánh giá</text>

        <!-- Right: Recent Activity / Class list -->
        <rect x="500" y="0" width="360" height="350" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
        <text x="520" y="30" fill="#0F172A" font-size="14" font-weight="bold">Tiến độ Lớp học Trọng điểm</text>
        
        <!-- Class 1 -->
        <rect x="515" y="50" width="330" height="85" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
        <text x="530" y="72" fill="#0F172A" font-size="12" font-weight="bold">Lớp 12A1 - Luyện thi Đại học CLC</text>
        <text x="530" y="90" fill="#64748B" font-size="10">Phòng 302 • Sĩ số: 26/28 • GV: Thầy Quang</text>
        <rect x="530" y="105" width="240" height="12" rx="6" fill="#E2E8F0" />
        <rect x="530" y="105" width="215" height="12" rx="6" fill="#059669" />
        <text x="780" y="115" fill="#059669" font-size="10" font-weight="bold">90% Chuyên cần</text>

        <!-- Class 2 -->
        <rect x="515" y="145" width="330" height="85" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
        <text x="530" y="167" fill="#0F172A" font-size="12" font-weight="bold">Lớp 11B2 - Toán Nâng Cao Ôn Chuyên</text>
        <text x="530" y="185" fill="#64748B" font-size="10">Phòng 201 • Sĩ số: 22/22 • GV: Thầy Quang</text>
        <rect x="530" y="200" width="240" height="12" rx="6" fill="#E2E8F0" />
        <rect x="530" y="200" width="230" height="12" rx="6" fill="#2563EB" />
        <text x="780" y="210" fill="#2563EB" font-size="10" font-weight="bold">96% Chuyên cần</text>
      </g>
    `
  }));

  // 4. Parent Dashboard
  await saveSvgAsPng('04_parent_dashboard.png', getAppShell({
    title: 'Giao diện Dành cho Phụ huynh Học sinh',
    activeNav: 'dashboard',
    userRole: 'Phụ huynh',
    contentSvg: `
      <g transform="translate(0, 35)">
        <!-- Student Switcher Bar -->
        <rect x="0" y="0" width="860" height="50" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
        <text x="20" y="30" fill="#64748B" font-size="12">Đang theo dõi học sinh:</text>
        <rect x="160" y="10" width="200" height="30" rx="8" fill="#EFF6FF" stroke="#3B82F6" stroke-width="1" />
        <circle cx="180" cy="25" r="8" fill="#2563EB" />
        <text x="180" y="29" fill="#FFFFFF" font-size="9" font-weight="bold" text-anchor="middle">N</text>
        <text x="198" y="29" fill="#1D4ED8" font-size="12" font-weight="bold">Nguyễn Hoàng Nam</text>
        <text x="375" y="30" fill="#64748B" font-size="11">Khối 10 • THPT Chuyên PBC</text>
        <rect x="710" y="10" width="135" height="30" rx="6" fill="#10B981" />
        <text x="777" y="29" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">Đóng học phí VietQR</text>

        <!-- 3 Highlights -->
        <g transform="translate(0, 65)">
          <!-- Chuyên cần -->
          <rect x="0" y="0" width="270" height="100" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
          <text x="20" y="28" fill="#64748B" font-size="11">Chuyên cần tháng này</text>
          <text x="20" y="60" fill="#059669" font-size="26" font-weight="bold">100%</text>
          <text x="20" y="85" fill="#475569" font-size="11">8/8 buổi đi học đúng giờ</text>

          <!-- Bài tập -->
          <rect x="295" y="0" width="270" height="100" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
          <text x="315" y="28" fill="#64748B" font-size="11">Bài tập về nhà</text>
          <text x="315" y="60" fill="#2563EB" font-size="26" font-weight="bold">6/6 bài</text>
          <text x="315" y="85" fill="#475569" font-size="11">Điểm TB bài tập: 9.2/10</text>

          <!-- Học phí -->
          <rect x="590" y="0" width="270" height="100" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
          <text x="610" y="28" fill="#64748B" font-size="11">Học phí Tháng 10/2026</text>
          <text x="610" y="60" fill="#D97706" font-size="24" font-weight="bold">960.000 đ</text>
          <rect x="610" y="72" width="110" height="20" rx="4" fill="#FEF3C7" />
          <text x="665" y="86" fill="#92400E" font-size="10" font-weight="bold" text-anchor="middle">Chờ phụ huynh nộp</text>
        </g>

        <!-- Teacher's latest note -->
        <g transform="translate(0, 185)">
          <rect x="0" y="0" width="860" height="110" rx="10" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1" />
          <text x="20" y="30" fill="#166534" font-size="13" font-weight="bold">💬 Nhận xét gần nhất của Giáo viên (Thầy Quang - 04/10/2026):</text>
          <text x="20" y="58" fill="#14532D" font-size="12">"Em Nam nắm chắc chuyên đề Hình học không gian, giải quyết bài toán tính khoảng cách rất linh hoạt. Cần chú ý tốc độ bấm máy tính trong phần lượng giác để đạt điểm tuyệt đối."</text>
          <text x="20" y="90" fill="#059669" font-size="11" font-weight="bold">Đánh giá chung buổi học: Xuất sắc (5/5 sao ⭐⭐⭐⭐⭐)</text>
        </g>
      </g>
    `
  }));

  // 5. Student Dashboard
  await saveSvgAsPng('05_student_dashboard.png', getAppShell({
    title: 'Giao diện Học tập dành cho Học sinh',
    activeNav: 'dashboard',
    userRole: 'Học sinh',
    contentSvg: `
      <g transform="translate(0, 35)">
        <!-- Top banner -->
        <rect x="0" y="0" width="860" height="70" rx="10" fill="url(#primaryGrad)" />
        <text x="25" y="32" fill="#FFFFFF" font-size="16" font-weight="bold">Chào Nam! Chúc em một buổi học hiệu quả hôm nay 🚀</text>
        <text x="25" y="52" fill="#BFDBFE" font-size="12">Lớp đang theo học: 10A1 Toán Chuyên • Giáo viên phụ trách: Thầy Đặng Minh Quang</text>

        <!-- Homework & Schedules grid -->
        <g transform="translate(0, 90)">
          <!-- Homework Card -->
          <rect x="0" y="0" width="540" height="340" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
          <text x="20" y="30" fill="#0F172A" font-size="14" font-weight="bold">Bài tập cần hoàn thành</text>
          
          <rect x="15" y="50" width="510" height="80" rx="8" fill="#FFFBEB" stroke="#FDE68A" stroke-width="1" />
          <text x="30" y="75" fill="#92400E" font-size="13" font-weight="bold">Bài tập Tuần 9: Hình học không gian - Thể tích khối chóp</text>
          <text x="30" y="95" fill="#78350F" font-size="11">Hạn nộp: 23:59 Thứ 5 (08/10) • Gồm 10 câu trắc nghiệm &amp; 2 bài tự luận</text>
          <rect x="420" y="70" width="90" height="32" rx="6" fill="#2563EB" />
          <text x="465" y="90" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">Nộp bài ngay</text>

          <rect x="15" y="145" width="510" height="80" rx="8" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1" />
          <text x="30" y="170" fill="#166534" font-size="13" font-weight="bold">Bài tập Tuần 8: Bất đẳng thức &amp; Cực trị đại số</text>
          <text x="30" y="190" fill="#14532D" font-size="11">Đã nộp lúc 19:30 01/10 • Giáo viên đã chấm: <tspan font-weight="bold" fill="#059669">9.5/10 điểm</tspan></text>
          <rect x="420" y="165" width="90" height="32" rx="6" fill="#059669" />
          <text x="465" y="185" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">Xem bài giải</text>

          <!-- Right column: My Schedule -->
          <rect x="560" y="0" width="300" height="340" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
          <text x="580" y="30" fill="#0F172A" font-size="14" font-weight="bold">Lịch học trong tuần</text>
          
          <rect x="575" y="50" width="270" height="60" rx="6" fill="#EFF6FF" />
          <text x="590" y="72" fill="#1D4ED8" font-size="12" font-weight="bold">Thứ 3: 18:00 - 20:00</text>
          <text x="590" y="92" fill="#475569" font-size="11">Hình học Oxyz • Phòng 201</text>

          <rect x="575" y="125" width="270" height="60" rx="6" fill="#EFF6FF" />
          <text x="590" y="147" fill="#1D4ED8" font-size="12" font-weight="bold">Thứ 7: 14:30 - 16:30</text>
          <text x="590" y="167" fill="#475569" font-size="11">Đại số &amp; Lượng giác • Phòng 201</text>
        </g>
      </g>
    `
  }));

  // 6. School Management
  await saveSvgAsPng('06_school_management.png', getAppShell({
    title: 'Quản lý Danh mục Trường học &amp; Cơ sở Đào tạo',
    activeNav: 'classes',
    contentSvg: `
      <g transform="translate(0, 30)">
        <!-- Toolbar -->
        <rect x="0" y="0" width="860" height="44" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1" />
        <text x="15" y="27" fill="#64748B" font-size="12">🔍 Tìm kiếm theo tên trường, mã trường hoặc địa chỉ...</text>
        <rect x="710" y="6" width="140" height="32" rx="6" fill="#2563EB" />
        <text x="780" y="26" fill="#FFFFFF" font-size="12" font-weight="bold" text-anchor="middle">+ Thêm trường mới</text>

        <!-- Table -->
        <g transform="translate(0, 55)">
          <rect x="0" y="0" width="860" height="36" fill="#F1F5F9" rx="6" />
          <text x="20" y="22" fill="#475569" font-size="11" font-weight="bold">MÃ TRƯỜNG</text>
          <text x="140" y="22" fill="#475569" font-size="11" font-weight="bold">TÊN TRƯỜNG / CƠ SỞ</text>
          <text x="420" y="22" fill="#475569" font-size="11" font-weight="bold">ĐỊA CHỈ</text>
          <text x="680" y="22" fill="#475569" font-size="11" font-weight="bold">SỐ HỌC SINH</text>
          <text x="790" y="22" fill="#475569" font-size="11" font-weight="bold">THAO TÁC</text>

          <!-- Row 1 -->
          <rect x="0" y="40" width="860" height="48" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <rect x="15" y="52" width="60" height="22" rx="4" fill="#EFF6FF" />
          <text x="45" y="67" fill="#1D4ED8" font-size="11" font-weight="bold" text-anchor="middle">PBC</text>
          <text x="140" y="68" fill="#0F172A" font-size="12" font-weight="bold">THPT Chuyên Phan Bội Châu</text>
          <text x="420" y="68" fill="#475569" font-size="11">Số 119 Bạch Liêu, TP. Vinh</text>
          <text x="710" y="68" fill="#059669" font-size="12" font-weight="bold">64 em</text>
          <text x="805" y="68" fill="#2563EB" font-size="12">Sửa • Xóa</text>

          <!-- Row 2 -->
          <rect x="0" y="92" width="860" height="48" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <rect x="15" y="104" width="60" height="22" rx="4" fill="#EFF6FF" />
          <text x="45" y="119" fill="#1D4ED8" font-size="11" font-weight="bold" text-anchor="middle">LQD</text>
          <text x="140" y="120" fill="#0F172A" font-size="12" font-weight="bold">THPT Lê Quý Đôn</text>
          <text x="420" y="120" fill="#475569" font-size="11">Số 45 Lê Duẩn, TP. Vinh</text>
          <text x="710" y="120" fill="#059669" font-size="12" font-weight="bold">48 em</text>
          <text x="805" y="120" fill="#2563EB" font-size="12">Sửa • Xóa</text>

          <!-- Row 3 -->
          <rect x="0" y="144" width="860" height="48" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <rect x="15" y="156" width="60" height="22" rx="4" fill="#EFF6FF" />
          <text x="45" y="171" fill="#1D4ED8" font-size="11" font-weight="bold" text-anchor="middle">HTK</text>
          <text x="140" y="172" fill="#0F172A" font-size="12" font-weight="bold">THPT Huỳnh Thúc Kháng</text>
          <text x="420" y="172" fill="#475569" font-size="11">Số 62 Lê Hồng Phong, TP. Vinh</text>
          <text x="710" y="172" fill="#059669" font-size="12" font-weight="bold">30 em</text>
          <text x="805" y="172" fill="#2563EB" font-size="12">Sửa • Xóa</text>
        </g>
      </g>
    `
  }));

  // 7. Subject Management
  await saveSvgAsPng('07_subject_management.png', getAppShell({
    title: 'Quản lý Danh mục Môn học &amp; Cấp độ',
    activeNav: 'classes',
    contentSvg: `
      <g transform="translate(0, 30)">
        <rect x="0" y="0" width="860" height="44" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1" />
        <text x="15" y="27" fill="#64748B" font-size="12">🔍 Lọc theo môn học, khối lớp (Khối 10, Khối 11, Khối 12)...</text>
        <rect x="700" y="6" width="150" height="32" rx="6" fill="#2563EB" />
        <text x="775" y="26" fill="#FFFFFF" font-size="12" font-weight="bold" text-anchor="middle">+ Thêm môn học mới</text>

        <!-- Grid of Subject Cards -->
        <g transform="translate(0, 60)">
          <!-- Card 1 -->
          <rect x="0" y="0" width="270" height="150" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
          <rect x="15" y="15" width="40" height="40" rx="8" fill="#EFF6FF" />
          <text x="35" y="40" fill="#2563EB" font-size="18" text-anchor="middle">📐</text>
          <text x="65" y="32" fill="#0F172A" font-size="14" font-weight="bold">Toán học 10</text>
          <text x="65" y="48" fill="#64748B" font-size="11">Mã: TOAN-10 • Khối 10</text>
          <text x="15" y="80" fill="#475569" font-size="11">Chương trình đại số &amp; hình học không gian nâng cao ôn thi chuyên.</text>
          <rect x="15" y="105" width="80" height="24" rx="4" fill="#F0FDF4" />
          <text x="55" y="121" fill="#166534" font-size="10" font-weight="bold" text-anchor="middle">3 lớp học</text>

          <!-- Card 2 -->
          <rect x="295" y="0" width="270" height="150" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
          <rect x="310" y="15" width="40" height="40" rx="8" fill="#FEF3C7" />
          <text x="330" y="40" fill="#D97706" font-size="18" text-anchor="middle">⚡</text>
          <text x="360" y="32" fill="#0F172A" font-size="14" font-weight="bold">Vật lý 11</text>
          <text x="360" y="48" fill="#64748B" font-size="11">Mã: VATLY-11 • Khối 11</text>
          <text x="310" y="80" fill="#475569" font-size="11">Điện từ học, quang hình &amp; thí nghiệm giải bài tập chuyên sâu.</text>
          <rect x="310" y="105" width="80" height="24" rx="4" fill="#F0FDF4" />
          <text x="350" y="121" fill="#166534" font-size="10" font-weight="bold" text-anchor="middle">2 lớp học</text>

          <!-- Card 3 -->
          <rect x="590" y="0" width="270" height="150" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
          <rect x="605" y="15" width="40" height="40" rx="8" fill="#F5F3FF" />
          <text x="625" y="40" fill="#7C3AED" font-size="18" text-anchor="middle">🌐</text>
          <text x="655" y="32" fill="#0F172A" font-size="14" font-weight="bold">Tiếng Anh IELTS</text>
          <text x="655" y="48" fill="#64748B" font-size="11">Mã: ENG-IELTS • Cấp 3</text>
          <text x="605" y="80" fill="#475569" font-size="11">Luyện 4 kỹ năng chuẩn đề thi quốc tế, mục tiêu Band 7.0+.</text>
          <rect x="605" y="105" width="80" height="24" rx="4" fill="#F0FDF4" />
          <text x="645" y="121" fill="#166534" font-size="10" font-weight="bold" text-anchor="middle">1 lớp học</text>
        </g>
      </g>
    `
  }));

  // 8. Class Management
  await saveSvgAsPng('08_class_management.png', getAppShell({
    title: 'Quản lý Lớp học &amp; Cấu hình Học phí',
    activeNav: 'classes',
    contentSvg: `
      <g transform="translate(0, 30)">
        <rect x="0" y="0" width="860" height="44" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1" />
        <text x="15" y="27" fill="#64748B" font-size="12">Lọc theo cơ sở: CS1 - Cầu Giấy • Trạng thái: Đang hoạt động</text>
        <rect x="710" y="6" width="140" height="32" rx="6" fill="#2563EB" />
        <text x="780" y="26" fill="#FFFFFF" font-size="12" font-weight="bold" text-anchor="middle">+ Tạo lớp học mới</text>

        <!-- Table of Classes -->
        <g transform="translate(0, 55)">
          <rect x="0" y="0" width="860" height="36" fill="#F1F5F9" rx="6" />
          <text x="20" y="22" fill="#475569" font-size="11" font-weight="bold">LỚP HỌC</text>
          <text x="220" y="22" fill="#475569" font-size="11" font-weight="bold">GIÁO VIÊN</text>
          <text x="380" y="22" fill="#475569" font-size="11" font-weight="bold">SĨ SỐ</text>
          <text x="480" y="22" fill="#475569" font-size="11" font-weight="bold">ĐƠN GIÁ HỌC PHÍ</text>
          <text x="660" y="22" fill="#475569" font-size="11" font-weight="bold">TRẠNG THÁI</text>
          <text x="790" y="22" fill="#475569" font-size="11" font-weight="bold">THAO TÁC</text>

          <!-- Class Row 1 -->
          <rect x="0" y="42" width="860" height="55" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <text x="20" y="66" fill="#0F172A" font-size="13" font-weight="bold">Lớp 10A1 - Toán Chuyên</text>
          <text x="20" y="84" fill="#64748B" font-size="10">Mã: TOAN10_A1 • Phòng 201</text>
          <text x="220" y="73" fill="#334155" font-size="12">Thầy Đặng Minh Quang</text>
          <text x="380" y="73" fill="#059669" font-size="12" font-weight="bold">24 / 25 em</text>
          <text x="480" y="73" fill="#2563EB" font-size="12" font-weight="bold">120.000 đ / buổi</text>
          <rect x="655" y="60" width="80" height="22" rx="4" fill="#DCFCE7" />
          <text x="695" y="75" fill="#15803D" font-size="10" font-weight="bold" text-anchor="middle">Đang học</text>
          <text x="800" y="73" fill="#2563EB" font-size="11">Cấu hình • Sửa</text>

          <!-- Class Row 2 -->
          <rect x="0" y="103" width="860" height="55" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <text x="20" y="127" fill="#0F172A" font-size="13" font-weight="bold">Lớp 12A1 - Luyện thi Đại học</text>
          <text x="20" y="145" fill="#64748B" font-size="10">Mã: TOAN12_A1 • Phòng 302</text>
          <text x="220" y="134" fill="#334155" font-size="12">Thầy Đặng Minh Quang</text>
          <text x="380" y="134" fill="#059669" font-size="12" font-weight="bold">28 / 30 em</text>
          <text x="480" y="134" fill="#2563EB" font-size="12" font-weight="bold">150.000 đ / buổi</text>
          <rect x="655" y="121" width="80" height="22" rx="4" fill="#DCFCE7" />
          <text x="695" y="136" fill="#15803D" font-size="10" font-weight="bold" text-anchor="middle">Đang học</text>
          <text x="800" y="134" fill="#2563EB" font-size="11">Cấu hình • Sửa</text>
        </g>
      </g>
    `
  }));

  // 9. Student Management & Excel Import
  await saveSvgAsPng('09_student_management.png', getAppShell({
    title: 'Quản lý Hồ sơ Học sinh &amp; Nhập dữ liệu Excel',
    activeNav: 'students',
    contentSvg: `
      <g transform="translate(0, 30)">
        <!-- Toolbar -->
        <rect x="0" y="0" width="860" height="44" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1" />
        <text x="15" y="27" fill="#64748B" font-size="12">🔍 Tìm kiếm tên học sinh, số điện thoại phụ huynh...</text>
        <rect x="570" y="6" width="130" height="32" rx="6" fill="#10B981" />
        <text x="635" y="26" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">📥 Nhập từ Excel</text>
        <rect x="710" y="6" width="140" height="32" rx="6" fill="#2563EB" />
        <text x="780" y="26" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">+ Thêm học sinh</text>

        <!-- Students Table -->
        <g transform="translate(0, 55)">
          <rect x="0" y="0" width="860" height="36" fill="#F1F5F9" rx="6" />
          <text x="20" y="22" fill="#475569" font-size="11" font-weight="bold">HỌ VÀ TÊN</text>
          <text x="200" y="22" fill="#475569" font-size="11" font-weight="bold">LỚP HỌC</text>
          <text x="360" y="22" fill="#475569" font-size="11" font-weight="bold">PHỤ HUYNH / SĐT</text>
          <text x="560" y="22" fill="#475569" font-size="11" font-weight="bold">CHUYÊN CẦN</text>
          <text x="690" y="22" fill="#475569" font-size="11" font-weight="bold">TÌNH TRẠNG PHÍ</text>
          <text x="800" y="22" fill="#475569" font-size="11" font-weight="bold">HỒ SƠ</text>

          <!-- Student Row 1 -->
          <rect x="0" y="42" width="860" height="52" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <circle cx="35" cy="68" r="14" fill="#EFF6FF" />
          <text x="35" y="73" fill="#2563EB" font-size="11" font-weight="bold" text-anchor="middle">HN</text>
          <text x="60" y="68" fill="#0F172A" font-size="12" font-weight="bold">Nguyễn Hoàng Nam</text>
          <text x="200" y="68" fill="#334155" font-size="11">10A1 Toán Chuyên</text>
          <text x="360" y="68" fill="#475569" font-size="11">Bác Hùng - 0988 123 456</text>
          <text x="560" y="68" fill="#059669" font-size="12" font-weight="bold">100% (8/8)</text>
          <rect x="685" y="56" width="85" height="22" rx="4" fill="#FEF3C7" />
          <text x="727" y="71" fill="#92400E" font-size="10" font-weight="bold" text-anchor="middle">Còn 960k</text>
          <text x="805" y="68" fill="#2563EB" font-size="11">Chi tiết →</text>

          <!-- Student Row 2 -->
          <rect x="0" y="100" width="860" height="52" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <circle cx="35" cy="126" r="14" fill="#F0FDF4" />
          <text x="35" y="131" fill="#059669" font-size="11" font-weight="bold" text-anchor="middle">ML</text>
          <text x="60" y="126" fill="#0F172A" font-size="12" font-weight="bold">Trần Mai Linh</text>
          <text x="200" y="126" fill="#334155" font-size="11">10A1 Toán Chuyên</text>
          <text x="360" y="126" fill="#475569" font-size="11">Cô Nga - 0912 345 678</text>
          <text x="560" y="126" fill="#059669" font-size="12" font-weight="bold">100% (8/8)</text>
          <rect x="685" y="114" width="85" height="22" rx="4" fill="#DCFCE7" />
          <text x="727" y="129" fill="#15803D" font-size="10" font-weight="bold" text-anchor="middle">Đã thu đủ</text>
          <text x="805" y="126" fill="#2563EB" font-size="11">Chi tiết →</text>
        </g>
      </g>
    `
  }));

  // 10. Account Management
  await saveSvgAsPng('10_account_management.png', getAppShell({
    title: 'Quản trị Tài khoản Người dùng &amp; Phân quyền Phụ huynh',
    activeNav: 'accounts',
    contentSvg: `
      <g transform="translate(0, 30)">
        <rect x="0" y="0" width="860" height="44" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1" />
        <text x="15" y="27" fill="#64748B" font-size="12">Vai trò: Tất cả (Admin, Giáo viên, Phụ huynh, Học sinh)</text>
        <rect x="520" y="6" width="160" height="32" rx="6" fill="#059669" />
        <text x="600" y="26" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">🔗 Liên kết Phụ huynh</text>
        <rect x="690" y="6" width="160" height="32" rx="6" fill="#2563EB" />
        <text x="770" y="26" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">✉️ Tạo tài khoản mời</text>

        <!-- Table of Accounts -->
        <g transform="translate(0, 55)">
          <rect x="0" y="0" width="860" height="36" fill="#F1F5F9" rx="6" />
          <text x="20" y="22" fill="#475569" font-size="11" font-weight="bold">TÀI KHOẢN / EMAIL</text>
          <text x="250" y="22" fill="#475569" font-size="11" font-weight="bold">VAI TRÒ</text>
          <text x="420" y="22" fill="#475569" font-size="11" font-weight="bold">HỌC SINH LIÊN KẾT</text>
          <text x="640" y="22" fill="#475569" font-size="11" font-weight="bold">TRẠNG THÁI</text>
          <text x="780" y="22" fill="#475569" font-size="11" font-weight="bold">THAO TÁC</text>

          <!-- Account Row 1 -->
          <rect x="0" y="42" width="860" height="52" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <text x="20" y="66" fill="#0F172A" font-size="12" font-weight="bold">thayquang.toan@edututor.vn</text>
          <text x="20" y="82" fill="#64748B" font-size="10">Đặng Minh Quang</text>
          <rect x="245" y="56" width="85" height="22" rx="4" fill="#EFF6FF" />
          <text x="287" y="71" fill="#1D4ED8" font-size="10" font-weight="bold" text-anchor="middle">Giáo viên</text>
          <text x="420" y="71" fill="#64748B" font-size="11">-</text>
          <rect x="635" y="56" width="90" height="22" rx="4" fill="#DCFCE7" />
          <text x="680" y="71" fill="#15803D" font-size="10" font-weight="bold" text-anchor="middle">Đã kích hoạt</text>
          <text x="790" y="71" fill="#2563EB" font-size="11">Phân quyền</text>

          <!-- Account Row 2 -->
          <rect x="0" y="100" width="860" height="52" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <text x="20" y="124" fill="#0F172A" font-size="12" font-weight="bold">phuhuynh.nam@gmail.com</text>
          <text x="20" y="140" fill="#64748B" font-size="10">Nguyễn Văn Hùng</text>
          <rect x="245" y="114" width="85" height="22" rx="4" fill="#FEF3C7" />
          <text x="287" y="129" fill="#92400E" font-size="10" font-weight="bold" text-anchor="middle">Phụ huynh</text>
          <text x="420" y="129" fill="#059669" font-size="11" font-weight="bold">Nguyễn Hoàng Nam (10A1)</text>
          <rect x="635" y="114" width="90" height="22" rx="4" fill="#DCFCE7" />
          <text x="680" y="129" fill="#15803D" font-size="10" font-weight="bold" text-anchor="middle">Đã kích hoạt</text>
          <text x="790" y="129" fill="#2563EB" font-size="11">Đổi LK</text>
        </g>
      </g>
    `
  }));

  // 11. Schedule Manager
  await saveSvgAsPng('11_schedule_management.png', getAppShell({
    title: 'Thời khóa biểu &amp; Lịch dạy trong Tuần',
    activeNav: 'schedules',
    contentSvg: `
      <g transform="translate(0, 30)">
        <rect x="0" y="0" width="860" height="40" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1" />
        <text x="20" y="25" fill="#0F172A" font-size="13" font-weight="bold">Tuần 41: 05/10/2026 - 11/10/2026</text>
        <rect x="710" y="5" width="140" height="30" rx="6" fill="#2563EB" />
        <text x="780" y="24" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">+ Thêm ca học mới</text>

        <!-- Weekly Grid -->
        <g transform="translate(0, 50)">
          <!-- Day headers -->
          ${['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((d, i) => `
            <rect x="${i * 123}" y="0" width="118" height="32" rx="6" fill="#F1F5F9" />
            <text x="${i * 123 + 59}" y="20" fill="#334155" font-size="11" font-weight="bold" text-anchor="middle">${d}</text>
          `).join('')}

          <!-- Grid items -->
          <!-- Tue evening -->
          <rect x="123" y="45" width="118" height="90" rx="8" fill="#EFF6FF" stroke="#3B82F6" stroke-width="1" />
          <text x="133" y="65" fill="#1D4ED8" font-size="10" font-weight="bold">18:00 - 20:00</text>
          <text x="133" y="85" fill="#0F172A" font-size="11" font-weight="bold">10A1 - Toán Chuyên</text>
          <text x="133" y="103" fill="#64748B" font-size="9">Phòng 201 • Thầy Quang</text>

          <!-- Thu evening -->
          <rect x="369" y="45" width="118" height="90" rx="8" fill="#EFF6FF" stroke="#3B82F6" stroke-width="1" />
          <text x="379" y="65" fill="#1D4ED8" font-size="10" font-weight="bold">18:00 - 20:00</text>
          <text x="379" y="85" fill="#0F172A" font-size="11" font-weight="bold">10A1 - Toán Chuyên</text>
          <text x="379" y="103" fill="#64748B" font-size="9">Phòng 201 • Thầy Quang</text>

          <!-- Sat afternoon -->
          <rect x="615" y="45" width="118" height="90" rx="8" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1" />
          <text x="625" y="65" fill="#B45309" font-size="10" font-weight="bold">14:30 - 17:00</text>
          <text x="625" y="85" fill="#0F172A" font-size="11" font-weight="bold">12A1 - Luyện thi ĐH</text>
          <text x="625" y="103" fill="#64748B" font-size="9">Phòng 302 • Thầy Quang</text>
        </g>
      </g>
    `
  }));

  // 12. Session Manager
  await saveSvgAsPng('12_session_management.png', getAppShell({
    title: 'Quản lý Buổi học Thực tế &amp; Phát sinh Buổi bù',
    activeNav: 'sessions',
    contentSvg: `
      <g transform="translate(0, 30)">
        <rect x="0" y="0" width="860" height="44" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1" />
        <text x="15" y="27" fill="#64748B" font-size="12">Tháng 10/2026 • Lớp: 10A1 Toán Chuyên • Tổng: 8 buổi</text>
        <rect x="710" y="6" width="140" height="32" rx="6" fill="#2563EB" />
        <text x="780" y="26" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">+ Tạo buổi học bù</text>

        <!-- Sessions List -->
        <g transform="translate(0, 55)">
          <rect x="0" y="0" width="860" height="36" fill="#F1F5F9" rx="6" />
          <text x="20" y="22" fill="#475569" font-size="11" font-weight="bold">NGÀY HỌC</text>
          <text x="130" y="22" fill="#475569" font-size="11" font-weight="bold">CHỦ ĐỀ BÀI HỌC</text>
          <text x="440" y="22" fill="#475569" font-size="11" font-weight="bold">SĨ SỐ THAM DỰ</text>
          <text x="580" y="22" fill="#475569" font-size="11" font-weight="bold">TÍNH PHÍ</text>
          <text x="700" y="22" fill="#475569" font-size="11" font-weight="bold">TRẠNG THÁI</text>
          <text x="800" y="22" fill="#475569" font-size="11" font-weight="bold">THAO TÁC</text>

          <!-- Session 1 -->
          <rect x="0" y="42" width="860" height="52" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <text x="20" y="66" fill="#0F172A" font-size="12" font-weight="bold">Thứ 3, 06/10</text>
          <text x="20" y="82" fill="#64748B" font-size="10">18:00 - 20:00</text>
          <text x="130" y="72" fill="#0F172A" font-size="12">Chuyên đề: Khoảng cách trong không gian Oxyz</text>
          <text x="440" y="72" fill="#059669" font-size="12" font-weight="bold">24 / 24 học sinh</text>
          <text x="580" y="72" fill="#2563EB" font-size="11" font-weight="bold">✓ Có tính phí</text>
          <rect x="690" y="56" width="90" height="22" rx="4" fill="#DCFCE7" />
          <text x="735" y="71" fill="#15803D" font-size="10" font-weight="bold" text-anchor="middle">Đã hoàn thành</text>
          <text x="805" y="72" fill="#2563EB" font-size="11">Xem lại</text>

          <!-- Session 2 -->
          <rect x="0" y="100" width="860" height="52" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <text x="20" y="124" fill="#0F172A" font-size="12" font-weight="bold">Thứ 5, 08/10</text>
          <text x="20" y="140" fill="#64748B" font-size="10">18:00 - 20:00</text>
          <text x="130" y="130" fill="#0F172A" font-size="12">Luyện tập: Thể tích khối đa diện nâng cao</text>
          <text x="440" y="130" fill="#64748B" font-size="12">Chưa diễn ra</text>
          <text x="580" y="130" fill="#2563EB" font-size="11" font-weight="bold">✓ Có tính phí</text>
          <rect x="690" y="114" width="90" height="22" rx="4" fill="#EFF6FF" />
          <text x="735" y="129" fill="#1D4ED8" font-size="10" font-weight="bold" text-anchor="middle">Sắp diễn ra</text>
          <text x="805" y="130" fill="#2563EB" font-size="11">Điểm danh</text>
        </g>
      </g>
    `
  }));

  // 13. Attendance Manager
  await saveSvgAsPng('13_attendance_management.png', getAppShell({
    title: 'Điểm danh Chuyên cần &amp; Ghi nhận Lý do Vắng',
    activeNav: 'attendance',
    contentSvg: `
      <g transform="translate(0, 30)">
        <rect x="0" y="0" width="860" height="50" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1" />
        <text x="20" y="25" fill="#0F172A" font-size="13" font-weight="bold">Buổi học ngày 06/10/2026 • Lớp 10A1 Toán Chuyên</text>
        <text x="20" y="42" fill="#059669" font-size="11">Có mặt: 23 • Vắng phép: 1 • Vắng không phép: 0</text>
        <rect x="710" y="10" width="140" height="30" rx="6" fill="#059669" />
        <text x="780" y="29" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">Lưu bảng điểm danh</text>

        <!-- Attendance Sheet -->
        <g transform="translate(0, 60)">
          <rect x="0" y="0" width="860" height="36" fill="#F1F5F9" rx="6" />
          <text x="20" y="22" fill="#475569" font-size="11" font-weight="bold">STT</text>
          <text x="60" y="22" fill="#475569" font-size="11" font-weight="bold">HỌ VÀ TÊN HỌC SINH</text>
          <text x="320" y="22" fill="#475569" font-size="11" font-weight="bold">TRẠNG THÁI ĐIỂM DANH</text>
          <text x="640" y="22" fill="#475569" font-size="11" font-weight="bold">GHI CHÚ / LÝ DO</text>

          <!-- Row 1 -->
          <rect x="0" y="42" width="860" height="48" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <text x="25" y="70" fill="#64748B" font-size="11">1</text>
          <text x="60" y="70" fill="#0F172A" font-size="12" font-weight="bold">Nguyễn Hoàng Nam</text>
          
          <rect x="320" y="52" width="65" height="26" rx="4" fill="#059669" />
          <text x="352" y="68" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">Có mặt ✓</text>
          <rect x="390" y="52" width="65" height="26" rx="4" fill="#F1F5F9" />
          <text x="422" y="68" fill="#64748B" font-size="10" text-anchor="middle">Đi muộn</text>
          <rect x="460" y="52" width="65" height="26" rx="4" fill="#F1F5F9" />
          <text x="492" y="68" fill="#64748B" font-size="10" text-anchor="middle">Có phép</text>
          <rect x="530" y="52" width="65" height="26" rx="4" fill="#F1F5F9" />
          <text x="562" y="68" fill="#64748B" font-size="10" text-anchor="middle">Vắng mặt</text>

          <text x="640" y="70" fill="#64748B" font-size="11">Đến lớp đúng giờ, chuẩn bị bài tốt</text>

          <!-- Row 2 -->
          <rect x="0" y="96" width="860" height="48" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <text x="25" y="124" fill="#64748B" font-size="11">2</text>
          <text x="60" y="124" fill="#0F172A" font-size="12" font-weight="bold">Lê Quốc Bảo</text>
          
          <rect x="320" y="106" width="65" height="26" rx="4" fill="#F1F5F9" />
          <text x="352" y="122" fill="#64748B" font-size="10" text-anchor="middle">Có mặt</text>
          <rect x="390" y="106" width="65" height="26" rx="4" fill="#F1F5F9" />
          <text x="422" y="122" fill="#64748B" font-size="10" text-anchor="middle">Đi muộn</text>
          <rect x="460" y="106" width="65" height="26" rx="4" fill="#2563EB" />
          <text x="492" y="122" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">Có phép ✓</text>
          <rect x="530" y="106" width="65" height="26" rx="4" fill="#F1F5F9" />
          <text x="562" y="122" fill="#64748B" font-size="10" text-anchor="middle">Vắng mặt</text>

          <text x="640" y="124" fill="#B45309" font-size="11">Phụ huynh xin nghỉ sốt (bù vào buổi CN)</text>
        </g>
      </g>
    `
  }));

  // 14. Lesson Manager
  await saveSvgAsPng('14_lesson_management.png', getAppShell({
    title: 'Quản lý Giáo án &amp; Ngân hàng Bài giảng',
    activeNav: 'homework',
    contentSvg: `
      <g transform="translate(0, 30)">
        <rect x="0" y="0" width="860" height="44" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1" />
        <text x="15" y="27" fill="#64748B" font-size="12">Môn: Toán học 10 • 12 giáo án đã lưu trữ</text>
        <rect x="710" y="6" width="140" height="32" rx="6" fill="#2563EB" />
        <text x="780" y="26" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">+ Soạn giáo án mới</text>

        <!-- Lessons grid -->
        <g transform="translate(0, 60)">
          <!-- Lesson Card 1 -->
          <rect x="0" y="0" width="415" height="150" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
          <rect x="15" y="15" width="60" height="24" rx="4" fill="#EFF6FF" />
          <text x="45" y="31" fill="#1D4ED8" font-size="10" font-weight="bold" text-anchor="middle">BÀI 14</text>
          <text x="90" y="32" fill="#0F172A" font-size="13" font-weight="bold">Phương pháp Tọa độ trong Không gian</text>
          <text x="15" y="65" fill="#475569" font-size="11">Mục tiêu: Nắm vững hệ trục Oxyz, tích có hướng của 2 vectơ và ứng dụng tính diện tích, thể tích tứ diện.</text>
          <rect x="15" y="105" width="110" height="26" rx="4" fill="#F1F5F9" />
          <text x="70" y="121" fill="#475569" font-size="10" text-anchor="middle">📎 Slide_Oxyz.pdf</text>
          <rect x="290" y="105" width="110" height="26" rx="4" fill="#2563EB" />
          <text x="345" y="121" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">Đánh giá HS →</text>

          <!-- Lesson Card 2 -->
          <rect x="445" y="0" width="415" height="150" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
          <rect x="460" y="15" width="60" height="24" rx="4" fill="#EFF6FF" />
          <text x="490" y="31" fill="#1D4ED8" font-size="10" font-weight="bold" text-anchor="middle">BÀI 15</text>
          <text x="535" y="32" fill="#0F172A" font-size="13" font-weight="bold">Phương trình Mặt phẳng &amp; Khoảng cách</text>
          <text x="460" y="65" fill="#475569" font-size="11">Mục tiêu: Lập phương trình tổng quát mặt phẳng, công thức tính khoảng cách từ 1 điểm đến mặt phẳng.</text>
          <rect x="460" y="105" width="120" height="26" rx="4" fill="#F1F5F9" />
          <text x="520" y="121" fill="#475569" font-size="10" text-anchor="middle">📎 De_kiem_tra_15p.docx</text>
          <rect x="735" y="105" width="110" height="26" rx="4" fill="#2563EB" />
          <text x="790" y="121" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">Đánh giá HS →</text>
        </g>
      </g>
    `
  }));

  // 15. Homework Manager
  await saveSvgAsPng('15_homework_management.png', getAppShell({
    title: 'Giao Bài tập về nhà &amp; Chấm bài Trực tuyến',
    activeNav: 'homework',
    contentSvg: `
      <g transform="translate(0, 30)">
        <rect x="0" y="0" width="860" height="44" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1" />
        <text x="15" y="27" fill="#64748B" font-size="12">Lớp: 10A1 Toán Chuyên • 4 bài tập đã giao trong tháng 10</text>
        <rect x="710" y="6" width="140" height="32" rx="6" fill="#2563EB" />
        <text x="780" y="26" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">+ Giao bài tập mới</text>

        <!-- Homework list table -->
        <g transform="translate(0, 55)">
          <rect x="0" y="0" width="860" height="36" fill="#F1F5F9" rx="6" />
          <text x="20" y="22" fill="#475569" font-size="11" font-weight="bold">TIÊU ĐỀ BÀI TẬP</text>
          <text x="340" y="22" fill="#475569" font-size="11" font-weight="bold">HẠN NỘP</text>
          <text x="480" y="22" fill="#475569" font-size="11" font-weight="bold">ĐÃ NỘP</text>
          <text x="600" y="22" fill="#475569" font-size="11" font-weight="bold">ĐÃ CHẤM</text>
          <text x="760" y="22" fill="#475569" font-size="11" font-weight="bold">THAO TÁC</text>

          <!-- HW 1 -->
          <rect x="0" y="42" width="860" height="60" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <text x="20" y="68" fill="#0F172A" font-size="12" font-weight="bold">Bài tập Tuần 9: Bài toán Khoảng cách Oxyz</text>
          <text x="20" y="86" fill="#64748B" font-size="10">Đính kèm: 12_cau_trac_nghiem.pdf</text>
          <text x="340" y="75" fill="#D97706" font-size="11" font-weight="bold">23:59 08/10/2026</text>
          <text x="480" y="75" fill="#2563EB" font-size="12" font-weight="bold">22 / 24 em</text>
          <text x="600" y="75" fill="#059669" font-size="12" font-weight="bold">18 / 22 em</text>
          <rect x="740" y="58" width="90" height="28" rx="4" fill="#059669" />
          <text x="785" y="76" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">Chấm bài</text>

          <!-- HW 2 -->
          <rect x="0" y="110" width="860" height="60" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <text x="20" y="136" fill="#0F172A" font-size="12" font-weight="bold">Bài tập Tuần 8: Tích vô hướng &amp; Tọa độ vectơ</text>
          <text x="20" y="154" fill="#64748B" font-size="10">Đính kèm: Baitap_Tuan8.pdf</text>
          <text x="340" y="143" fill="#64748B" font-size="11">01/10/2026 (Hết hạn)</text>
          <text x="480" y="143" fill="#059669" font-size="12" font-weight="bold">24 / 24 em</text>
          <text x="600" y="143" fill="#059669" font-size="12" font-weight="bold">24 / 24 (100%)</text>
          <rect x="740" y="126" width="90" height="28" rx="4" fill="#F1F5F9" />
          <text x="785" y="144" fill="#475569" font-size="11" text-anchor="middle">Xem điểm</text>
        </g>
      </g>
    `
  }));

  // 16. Evaluation Manager
  await saveSvgAsPng('16_evaluation_management.png', getAppShell({
    title: 'Đánh giá Năng lực Học sinh &amp; Nhận xét Buổi dạy',
    activeNav: 'evaluations',
    contentSvg: `
      <g transform="translate(0, 30)">
        <rect x="0" y="0" width="860" height="44" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1" />
        <text x="15" y="27" fill="#64748B" font-size="12">Lớp 10A1 • Buổi học số 11: Phương trình Mặt phẳng Oxyz</text>
        <rect x="710" y="6" width="140" height="32" rx="6" fill="#059669" />
        <text x="780" y="26" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">Gửi cho Phụ huynh</text>

        <!-- Evaluation Table -->
        <g transform="translate(0, 55)">
          <rect x="0" y="0" width="860" height="36" fill="#F1F5F9" rx="6" />
          <text x="20" y="22" fill="#475569" font-size="11" font-weight="bold">HỌC SINH</text>
          <text x="200" y="22" fill="#475569" font-size="11" font-weight="bold">MỨC ĐỘ HIỂU BÀI</text>
          <text x="350" y="22" fill="#475569" font-size="11" font-weight="bold">THÁI ĐỘ HỌC TẬP</text>
          <text x="500" y="22" fill="#475569" font-size="11" font-weight="bold">NHẬN XÉT CỦA GIÁO VIÊN</text>
          <text x="780" y="22" fill="#475569" font-size="11" font-weight="bold">ĐIỂM</text>

          <!-- Eval Row 1 -->
          <rect x="0" y="42" width="860" height="56" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <text x="20" y="73" fill="#0F172A" font-size="12" font-weight="bold">Nguyễn Hoàng Nam</text>
          <text x="200" y="73" fill="#F59E0B" font-size="14">⭐⭐⭐⭐⭐</text>
          <rect x="345" y="60" width="75" height="22" rx="4" fill="#DCFCE7" />
          <text x="382" y="75" fill="#15803D" font-size="10" font-weight="bold" text-anchor="middle">Rất tích cực</text>
          <text x="500" y="73" fill="#334155" font-size="11">Hiểu bài xuất sắc, làm được bài nâng cao điểm 10.</text>
          <text x="790" y="73" fill="#059669" font-size="14" font-weight="bold">9.5</text>

          <!-- Eval Row 2 -->
          <rect x="0" y="104" width="860" height="56" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <text x="20" y="135" fill="#0F172A" font-size="12" font-weight="bold">Trần Mai Linh</text>
          <text x="200" y="135" fill="#F59E0B" font-size="14">⭐⭐⭐⭐☆</text>
          <rect x="345" y="122" width="75" height="22" rx="4" fill="#EFF6FF" />
          <text x="382" y="137" fill="#1D4ED8" font-size="10" font-weight="bold" text-anchor="middle">Tập trung</text>
          <text x="500" y="135" fill="#334155" font-size="11">Lý thuyết tốt, cần luyện thêm kỹ năng vẽ hình không gian.</text>
          <text x="790" y="135" fill="#2563EB" font-size="14" font-weight="bold">8.5</text>
        </g>
      </g>
    `
  }));

  // 17. Tuition Management
  await saveSvgAsPng('17_tuition_management.png', getAppShell({
    title: 'Quản lý Học phí &amp; Lập Phiếu báo Hàng tháng',
    activeNav: 'tuition',
    contentSvg: `
      <g transform="translate(0, 30)">
        <rect x="0" y="0" width="860" height="44" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1" />
        <text x="15" y="27" fill="#64748B" font-size="12">Kỳ thu: Tháng 10/2026 • Lớp 10A1 • Đơn giá: 120.000 đ/buổi</text>
        <rect x="560" y="6" width="130" height="32" rx="6" fill="#10B981" />
        <text x="625" y="26" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">📄 Xuất PDF Phiếu thu</text>
        <rect x="700" y="6" width="150" height="32" rx="6" fill="#2563EB" />
        <text x="775" y="26" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">⚡ Lập bảng tự động</text>

        <!-- Tuition Table -->
        <g transform="translate(0, 55)">
          <rect x="0" y="0" width="860" height="36" fill="#F1F5F9" rx="6" />
          <text x="20" y="22" fill="#475569" font-size="11" font-weight="bold">HỌC SINH</text>
          <text x="180" y="22" fill="#475569" font-size="11" font-weight="bold">SỐ BUỔI HỌC</text>
          <text x="290" y="22" fill="#475569" font-size="11" font-weight="bold">ĐƠN GIÁ</text>
          <text x="400" y="22" fill="#475569" font-size="11" font-weight="bold">GIẢM TRỪ / PHỤ PHÍ</text>
          <text x="560" y="22" fill="#475569" font-size="11" font-weight="bold">TỔNG TIỀN</text>
          <text x="680" y="22" fill="#475569" font-size="11" font-weight="bold">TRẠNG THÁI</text>
          <text x="790" y="22" fill="#475569" font-size="11" font-weight="bold">VIETQR</text>

          <!-- Row 1 -->
          <rect x="0" y="42" width="860" height="52" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <text x="20" y="72" fill="#0F172A" font-size="12" font-weight="bold">Nguyễn Hoàng Nam</text>
          <text x="180" y="72" fill="#059669" font-size="12" font-weight="bold">8 buổi</text>
          <text x="290" y="72" fill="#475569" font-size="11">120.000 đ</text>
          <text x="400" y="72" fill="#64748B" font-size="11">0 đ</text>
          <text x="560" y="72" fill="#0F172A" font-size="13" font-weight="bold">960.000 đ</text>
          <rect x="675" y="56" width="90" height="22" rx="4" fill="#FEF3C7" />
          <text x="720" y="71" fill="#92400E" font-size="10" font-weight="bold" text-anchor="middle">Chưa đóng</text>
          <rect x="785" y="56" width="60" height="22" rx="4" fill="#2563EB" />
          <text x="815" y="71" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">Mã QR</text>

          <!-- Row 2 -->
          <rect x="0" y="100" width="860" height="52" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <text x="20" y="130" fill="#0F172A" font-size="12" font-weight="bold">Trần Mai Linh</text>
          <text x="180" y="130" fill="#059669" font-size="12" font-weight="bold">8 buổi</text>
          <text x="290" y="130" fill="#475569" font-size="11">120.000 đ</text>
          <text x="400" y="130" fill="#059669" font-size="11">-100.000 đ (Học bổng)</text>
          <text x="560" y="130" fill="#0F172A" font-size="13" font-weight="bold">860.000 đ</text>
          <rect x="675" y="114" width="90" height="22" rx="4" fill="#DCFCE7" />
          <text x="720" y="129" fill="#15803D" font-size="10" font-weight="bold" text-anchor="middle">Đã thanh toán</text>
          <rect x="785" y="114" width="60" height="22" rx="4" fill="#059669" />
          <text x="815" y="129" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">Đã khớp</text>
        </g>
      </g>
    `
  }));

  // 18. VietQR Modal
  await saveSvgAsPng('18_vietqr_payment.png', `
  <svg width="1100" height="640" viewBox="0 0 1100 640" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
    <rect width="1100" height="640" fill="#0F172A" opacity="0.9" />

    <!-- QR Modal Card -->
    <rect x="330" y="50" width="440" height="540" rx="16" fill="#FFFFFF" />

    <!-- Modal Header -->
    <rect x="330" y="50" width="440" height="60" rx="16" fill="#2563EB" />
    <text x="550" y="86" fill="#FFFFFF" font-size="16" font-weight="bold" text-anchor="middle">Thanh toán Học phí qua VietQR Napas 247</text>

    <!-- Bank Logo & Name -->
    <text x="550" y="140" fill="#0F172A" font-size="14" font-weight="bold" text-anchor="middle">Ngân hàng TMCP Quân Đội (MBBank)</text>
    <text x="550" y="158" fill="#64748B" font-size="11" text-anchor="middle">Chủ tài khoản: DANG MINH QUANG</text>

    <!-- Simulated QR Code -->
    <rect x="445" y="175" width="210" height="210" rx="10" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2" />
    <!-- QR Finder patterns -->
    <rect x="460" y="190" width="40" height="40" fill="#0F172A" />
    <rect x="466" y="196" width="28" height="28" fill="#FFFFFF" />
    <rect x="472" y="202" width="16" height="16" fill="#0F172A" />

    <rect x="595" y="190" width="40" height="40" fill="#0F172A" />
    <rect x="601" y="196" width="28" height="28" fill="#FFFFFF" />
    <rect x="607" y="202" width="16" height="16" fill="#0F172A" />

    <rect x="460" y="325" width="40" height="40" fill="#0F172A" />
    <rect x="466" y="331" width="28" height="28" fill="#FFFFFF" />
    <rect x="472" y="337" width="16" height="16" fill="#0F172A" />

    <!-- Center Napas/MB Badge in QR -->
    <circle cx="550" cy="280" r="18" fill="#2563EB" />
    <text x="550" y="285" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">VietQR</text>

    <!-- Amount Display -->
    <rect x="360" y="400" width="380" height="50" rx="8" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1" />
    <text x="550" y="422" fill="#166534" font-size="12" text-anchor="middle">Số tiền thanh toán chính xác:</text>
    <text x="550" y="442" fill="#15803D" font-size="18" font-weight="bold" text-anchor="middle">960.000 VNĐ</text>

    <!-- Syntax box -->
    <rect x="360" y="460" width="380" height="55" rx="8" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1" />
    <text x="375" y="480" fill="#1E40AF" font-size="11" font-weight="bold">Cú pháp chuyển khoản tự động:</text>
    <text x="375" y="502" fill="#1D4ED8" font-size="13" font-weight="bold" font-family="monospace">PBC_K10_NAM_T10_2026</text>
    <rect x="655" y="475" width="75" height="30" rx="6" fill="#2563EB" />
    <text x="692" y="494" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">Sao chép</text>

    <text x="550" y="540" fill="#64748B" font-size="10" text-anchor="middle">💡 Quét bằng mọi ứng dụng ngân hàng hoặc ví điện tử (VNPAY, MoMo, ViettelMoney)</text>
  </svg>
  `);

  // 19. Bank Reconciliation
  await saveSvgAsPng('19_bank_reconciliation.png', getAppShell({
    title: 'Đối soát Sao kê Ngân hàng Tự động (Dual-Match)',
    activeNav: 'reconciliation',
    contentSvg: `
      <g transform="translate(0, 30)">
        <rect x="0" y="0" width="860" height="44" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1" />
        <text x="15" y="27" fill="#64748B" font-size="12">Kỳ đối soát: Tháng 10/2026 • 24 giao dịch đã so khớp thành công</text>
        <rect x="560" y="6" width="140" height="32" rx="6" fill="#10B981" />
        <text x="630" y="26" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">📥 Tải file sao kê Excel</text>
        <rect x="710" y="6" width="140" height="32" rx="6" fill="#2563EB" />
        <text x="780" y="26" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">⚡ Khớp tự động</text>

        <!-- Reconciliation Table -->
        <g transform="translate(0, 55)">
          <rect x="0" y="0" width="860" height="36" fill="#F1F5F9" rx="6" />
          <text x="20" y="22" fill="#475569" font-size="11" font-weight="bold">NGÀY GIAO DỊCH</text>
          <text x="140" y="22" fill="#475569" font-size="11" font-weight="bold">SỐ TIỀN</text>
          <text x="250" y="22" fill="#475569" font-size="11" font-weight="bold">NỘI DUNG CHUYỂN KHOẢN SAO KÊ</text>
          <text x="560" y="22" fill="#475569" font-size="11" font-weight="bold">HỌC SINH KHỚP</text>
          <text x="730" y="22" fill="#475569" font-size="11" font-weight="bold">KẾT QUẢ ĐỐI SOÁT</text>

          <!-- Recon Row 1 -->
          <rect x="0" y="42" width="860" height="52" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <text x="20" y="72" fill="#0F172A" font-size="11">06/10 14:22</text>
          <text x="140" y="72" fill="#059669" font-size="12" font-weight="bold">+860.000 đ</text>
          <text x="250" y="72" fill="#334155" font-size="11" font-family="monospace">MBVCB... PBC_K10_LINH_T10_2026</text>
          <text x="560" y="72" fill="#0F172A" font-size="12" font-weight="bold">Trần Mai Linh (10A1)</text>
          <rect x="725" y="56" width="115" height="24" rx="4" fill="#DCFCE7" />
          <text x="782" y="72" fill="#15803D" font-size="10" font-weight="bold" text-anchor="middle">✓ Khớp hoàn toàn</text>

          <!-- Recon Row 2 -->
          <rect x="0" y="100" width="860" height="52" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" rx="4" />
          <text x="20" y="130" fill="#0F172A" font-size="11">06/10 16:05</text>
          <text x="140" y="130" fill="#059669" font-size="12" font-weight="bold">+960.000 đ</text>
          <text x="250" y="130" fill="#334155" font-size="11" font-family="monospace">Phu huynh em Hoang Nam dong hoc phi</text>
          <text x="560" y="130" fill="#0F172A" font-size="12" font-weight="bold">Nguyễn Hoàng Nam</text>
          <rect x="725" y="114" width="115" height="24" rx="4" fill="#FEF3C7" />
          <text x="782" y="130" fill="#92400E" font-size="10" font-weight="bold" text-anchor="middle">Khớp thủ công ⚠️</text>
        </g>
      </g>
    `
  }));

  // 20. System Settings & Payment Setup
  await saveSvgAsPng('20_system_settings.png', getAppShell({
    title: 'Cài đặt Hệ thống, Tài khoản Thụ hưởng &amp; Nhật ký Audit Logs',
    activeNav: 'settings',
    contentSvg: `
      <g transform="translate(0, 30)">
        <!-- Tabs -->
        <rect x="0" y="0" width="860" height="38" rx="8" fill="#F1F5F9" />
        <rect x="4" y="4" width="160" height="30" rx="6" fill="#2563EB" />
        <text x="84" y="23" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">Cơ sở &amp; Thương hiệu</text>
        <text x="245" y="23" fill="#475569" font-size="11" text-anchor="middle">Cấu hình Ngân hàng VietQR</text>
        <text x="410" y="23" fill="#475569" font-size="11" text-anchor="middle">Nhật ký Audit Logs</text>
        <text x="580" y="23" fill="#475569" font-size="11" text-anchor="middle">Cloud Firestore Sync</text>

        <!-- Form settings -->
        <g transform="translate(0, 50)">
          <rect x="0" y="0" width="860" height="330" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
          
          <text x="30" y="40" fill="#0F172A" font-size="14" font-weight="bold">Thông tin Thương hiệu &amp; Trung tâm Đào tạo</text>

          <text x="30" y="75" fill="#334155" font-size="11" font-weight="600">Tên Trung tâm / Nhóm lớp</text>
          <rect x="30" y="85" width="380" height="38" rx="6" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1" />
          <text x="45" y="108" fill="#0F172A" font-size="12">Trung tâm Bồi dưỡng Văn hóa &amp; Luyện thi EduTutor Pro</text>

          <text x="440" y="75" fill="#334155" font-size="11" font-weight="600">Hotline / Số điện thoại liên hệ</text>
          <rect x="440" y="85" width="380" height="38" rx="6" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1" />
          <text x="455" y="108" fill="#0F172A" font-size="12">0988 888 999</text>

          <text x="30" y="145" fill="#334155" font-size="11" font-weight="600">Địa chỉ cơ sở chính</text>
          <rect x="30" y="155" width="790" height="38" rx="6" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1" />
          <text x="45" y="178" fill="#0F172A" font-size="12">Tầng 4, Tòa nhà Tri thức, Cầu Giấy, Hà Nội</text>

          <!-- Banking Settings Box -->
          <rect x="30" y="210" width="790" height="90" rx="8" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1" />
          <text x="45" y="235" fill="#166534" font-size="12" font-weight="bold">🏦 Tài khoản Ngân hàng thụ hưởng VietQR đã xác thực:</text>
          <text x="45" y="260" fill="#14532D" font-size="11">Ngân hàng: MBBank (Quân Đội) • Số tài khoản: 0988888999 • Chủ tài khoản: DANG MINH QUANG</text>
          <text x="45" y="280" fill="#059669" font-size="11">Cú pháp nhận diện: [Mã trường]_[Khối]_[Tên]_[Tháng]_[Năm] (Tỷ lệ khớp tự động 99.4%)</text>
        </g>
      </g>
    `
  }));

  console.log('Finished generating all 20 PNG images in public/manual_assets/');
}

run().catch(err => {
  console.error('Error generating images:', err);
  process.exit(1);
});
