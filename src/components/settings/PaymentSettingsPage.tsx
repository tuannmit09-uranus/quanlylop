import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VIETNAMESE_BANKS, formatVND, getVietQRUrl } from '../../utils/vietqr';
import {
  Building,
  CreditCard,
  User,
  Save,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Copy,
  ExternalLink,
  Download,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Layers,
  FileCheck,
  RefreshCw,
  Check,
} from 'lucide-react';

export const PaymentSettingsPage: React.FC = () => {
  const {
    paymentAccount,
    updatePaymentAccount,
    currentTenant,
    tenants,
    switchTenant,
    resetData,
    students,
  } = useApp();

  const [bankCode, setBankCode] = useState(paymentAccount.bankCode || 'VCB');
  const [bankName, setBankName] = useState(paymentAccount.bankName || 'Vietcombank');
  const [accountNumber, setAccountNumber] = useState(paymentAccount.accountNumber || '0123456789');
  const [accountName, setAccountName] = useState(paymentAccount.accountName || 'NGUYEN VAN TUAN');
  const [branch, setBranch] = useState(paymentAccount.branch || 'Hà Nội');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Live Test QR State
  const [testAmount, setTestAmount] = useState(800000);
  const [testMemo, setTestMemo] = useState('PBC_K10_Tuan_T7_2026');
  const [selectedStudentForTest, setSelectedStudentForTest] = useState(students[0]?.id || '');

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentAccount({
      bankName,
      bankCode,
      accountNumber,
      accountName: accountName.toUpperCase(),
      branch,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleBankSelect = (code: string) => {
    setBankCode(code);
    const matched = VIETNAMESE_BANKS.find((b) => b.code === code);
    if (matched) {
      setBankName(matched.shortName);
    }
  };

  const handleStudentSelectForTest = (studentId: string) => {
    setSelectedStudentForTest(studentId);
    const stu = students.find((s) => s.id === studentId);
    if (stu) {
      const birthSuffix = String(stu.birthYear || 2010).slice(-2);
      const parts = stu.fullName.trim().split(/\s+/);
      const shortName = parts[parts.length - 1] || 'HocSinh';
      setTestMemo(`${stu.schoolCode || 'PBC'}_K${birthSuffix}_${shortName}_T7_2026`);
    }
  };

  const liveQRUrl = getVietQRUrl(bankCode, accountNumber, testAmount, testMemo, accountName);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-1 border border-blue-200">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Cấu hình Hệ thống & Thanh toán</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Tài Khoản Nhận Tiền & Cấu Hình VietQR
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý tài khoản ngân hàng thụ hưởng nhận học phí, tạo mã VietQR chuẩn NAPAS 24/7 và kiểm tra cú pháp chuyển khoản.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Chuẩn NAPAS / VietQR 2.0</span>
          </span>
        </div>
      </div>

      {/* Grid: Bank Config Form & Live QR Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bank Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Account Settings Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Thông Tin Tài Khoản Thụ Hưởng
                </h3>
                <p className="text-xs text-slate-400">
                  Tài khoản của Giáo viên nhận tiền chuyển khoản học phí từ Phụ huynh.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveBank} className="space-y-4 text-xs">
              {/* Bank Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chọn Ngân Hàng Thụ Hưởng (NAPAS):
                </label>
                <select
                  value={bankCode}
                  onChange={(e) => handleBankSelect(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer"
                >
                  {VIETNAMESE_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.shortName} - {b.name} ({b.code})
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {VIETNAMESE_BANKS.slice(0, 6).map((b) => (
                    <button
                      key={b.code}
                      type="button"
                      onClick={() => handleBankSelect(b.code)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        bankCode === b.code
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {b.logo} {b.shortName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Số Tài Khoản Nhận Tiền:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\s+/g, ''))}
                    placeholder="Ví dụ: 0123456789..."
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-sm text-blue-700 focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50/50"
                    required
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Nhập chính xác số tài khoản ngân hàng không chứa khoảng cách.
                </p>
              </div>

              {/* Account Holder Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên Chủ Tài Khoản (In Hoa Không Dấu):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                    placeholder="Ví dụ: NGUYEN VAN TUAN"
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-xs uppercase text-slate-900 focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50/50"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Theo tiêu chuẩn Napas/VietQR, tên chủ tài khoản viết hoa không dấu.
                </p>
              </div>

              {/* Branch */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chi Nhánh Ngân Hàng (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="Ví dụ: Chi nhánh Ba Đình, Hà Nội"
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50/50"
                />
              </div>

              {/* Save Button & Status */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Dữ liệu lưu tự động và áp dụng cho toàn bộ mã VietQR</span>
                </div>

                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center space-x-2 ${
                    saved
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 active:scale-98 cursor-pointer'
                  }`}
                >
                  {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>{saved ? 'Đã lưu thành công!' : 'Lưu tài khoản ngân hàng'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Payment Reference Specification Guide (BR-010) */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center space-x-2 text-blue-300 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Quy Chuẩn Cú Pháp Nội Dung Chuyển Khoản (BR-010)</span>
            </div>

            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 space-y-2">
              <div className="text-xs font-mono font-bold text-amber-300 tracking-wider">
                [Mã trường]_K[2 số cuối năm sinh]_[Tên học sinh]_T[Tháng]_[Năm]
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ví dụ: Cháu <strong>Nguyễn Minh Tuấn</strong> học trường <strong>Phan Bội Châu (PBC)</strong>, sinh năm <strong>2010 (K10)</strong> nộp học phí <strong>Tháng 7/2026</strong> sẽ có cú pháp:
              </p>
              <div className="inline-block bg-slate-950 px-3 py-1.5 rounded-xl font-mono text-emerald-400 text-xs font-bold border border-slate-800">
                PBC_K10_Tuan_T7_2026
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-300">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Hệ thống tự động khớp sao kê khi phụ huynh quét mã VietQR.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Không cần đối soát thủ công nếu nội dung chuyển khoản đúng mã.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live VietQR Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* VietQR Live Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Xem Trước Mã VietQR Thật</h3>
                  <p className="text-[11px] text-slate-400">Tạo theo cấu hình đang lưu</p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                NAPAS 247
              </span>
            </div>

            {/* Test Controls */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl text-xs border border-slate-200/80">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">
                  Chọn học sinh để mô phỏng:
                </label>
                <select
                  value={selectedStudentForTest}
                  onChange={(e) => handleStudentSelectForTest(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2 bg-white font-medium outline-hidden text-xs"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.schoolCode} - K{String(s.birthYear).slice(-2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Số tiền (VNĐ):</label>
                  <input
                    type="number"
                    step="50000"
                    value={testAmount}
                    onChange={(e) => setTestAmount(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-1.5 bg-white font-bold text-xs outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Tháng học phí:</label>
                  <div className="p-1.5 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-700 text-center">
                    Tháng 7/2026
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Cú pháp chuyển khoản:</label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    value={testMemo}
                    onChange={(e) => setTestMemo(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-1.5 bg-white font-mono font-bold text-xs text-blue-700 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(testMemo)}
                    className="p-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700 transition-colors"
                    title="Sao chép cú pháp"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Generated QR Code Card */}
            <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50/50 to-slate-50 rounded-2xl border border-blue-100 text-center space-y-3">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
                <img
                  src={liveQRUrl}
                  alt="Mã VietQR Thanh toán học phí"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
                  onError={(e) => {
                    // Fallback to stylized display if network image fails
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              <div className="text-xs space-y-1">
                <div className="font-bold text-slate-900 text-sm">
                  {formatVND(testAmount)}
                </div>
                <div className="text-slate-500 font-medium">
                  {bankName} • <span className="font-mono font-bold text-blue-700">{accountNumber}</span>
                </div>
                <div className="text-[11px] font-bold text-slate-700 uppercase">
                  {accountName}
                </div>
                <div className="inline-block px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-mono text-[11px] font-bold">
                  {testMemo}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => copyToClipboard(liveQRUrl)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Đã chép link QR' : 'Chép link VietQR'}</span>
                </button>
                <a
                  href={liveQRUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở ảnh QR</span>
                </a>
              </div>
            </div>
          </div>

          {/* Multi-tenant Workspace Switcher Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xs">
                  Không Gian Dạy Học (Multi-Tenant)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Chuyển đổi giữa các giáo viên hoặc môn học độc lập.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {tenants.map((t) => {
                const isCurrent = t.id === currentTenant.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => switchTenant(t.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-blue-50/80 border-blue-300 shadow-xs'
                        : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                        <span>{t.name}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[9px]">
                            Hiện tại
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        {t.teacherName} • Môn {t.schoolSubject}
                      </p>
                    </div>

                    <div className="text-right text-[11px] text-slate-400">
                      ID: <span className="font-mono">{t.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reset Data Zone */}
          <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>Khôi Phục Dữ Liệu Ban Đầu</span>
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Đặt lại toàn bộ dữ liệu mẫu (trường học, học sinh, điểm danh, bảng kê học phí, sao kê ngân hàng) về trạng thái ban đầu để kiểm thử.
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirm('Bạn có chắc muốn đặt lại toàn bộ dữ liệu về trạng thái ban đầu?')) {
                  resetData();
                  alert('Đã khôi phục toàn bộ dữ liệu mẫu thành công!');
                }
              }}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại dữ liệu mẫu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
