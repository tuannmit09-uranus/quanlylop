import React, { useState } from 'react';
import {
  FileText,
  FileDown,
  Youtube,
  ExternalLink,
  CheckCircle2,
  X,
  Search,
  BookOpen,
  Smartphone,
  School,
  BookMarked,
  Users,
  Key,
  Calendar,
  CheckSquare,
  CreditCard,
  FileSpreadsheet,
  Link2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSection?: number;
}

export const YOUTUBE_BANK_STATEMENT_GUIDE_URL = 'https://www.youtube.com/watch?v=lBMk39wyZzU';
export const DEFAULT_GUIDE_PDF_URL = '/Huong_Dan_Su_Dung_EduTutor_Pro.pdf';

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  defaultSection = 1,
}) => {
  const [activeSection, setActiveSection] = useState<number>(defaultSection);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);

  if (!isOpen) return null;

  const guideSections = [
    { id: 1, title: 'Bìa & Thông tin tài liệu v2.5.0-PRO', icon: BookOpen },
    { id: 2, title: '1. Đăng nhập, Đăng ký & Cài đặt App điện thoại', icon: Smartphone },
    { id: 3, title: '2. Thêm Trường học & 3. Thêm Môn học', icon: School },
    { id: 4, title: '4. Thêm Lớp học & 5. Thêm Học sinh (3 cách)', icon: Users },
    { id: 5, title: '6. Cấp tài khoản cho Học sinh & Phụ huynh', icon: Key },
    { id: 6, title: '7. Xếp lịch học cố định & Buổi học thực tế', icon: Calendar },
    { id: 7, title: '8. Điểm danh buổi học trên di động', icon: CheckSquare },
    { id: 8, title: '9. Cài đặt Tài khoản Ngân hàng nhận tiền VietQR', icon: CreditCard },
    { id: 9, title: '10. Bảng kê & Tính học phí tự động', icon: FileSpreadsheet },
    { id: 10, title: '11. Xuất thông báo thu tiền PDF gửi Zalo PH', icon: FileDown },
    { id: 11, title: '12. Sao kê & Đối soát tự động (Kèm Video YouTube)', icon: Link2, highlight: true },
    { id: 12, title: '13. Đối soát thủ công (Lọc thông minh)', icon: Link2 },
    { id: 13, title: '14. Giảng dạy: Bài học, Nhận xét & Điểm số', icon: GraduationCap },
    { id: 14, title: '15. Giao bài tập về nhà & Chấm điểm nộp bài', icon: Sparkles },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-6 py-4 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <BookOpen className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  Tài Liệu Hướng Dẫn Sử Dụng EduTutor Pro
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  v2.5.0-PRO
                </span>
              </div>
              <p className="text-xs text-slate-300">
                14 trang hướng dẫn vận hành chi tiết: Điểm danh, Học phí VietQR, Đối soát sao kê
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Bar: PDF Download & YouTube Video Guide */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center flex-wrap gap-2">
            {/* Download PDF button */}
            <a
              href={DEFAULT_GUIDE_PDF_URL}
              download="Huong_Dan_Su_Dung_EduTutor_Pro.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Tải file PDF Hướng dẫn sử dụng (14 trang A4)</span>
            </a>
          </div>

          {/* YouTube Video Guide Link */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowVideoModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer shrink-0"
              title="Xem video hướng dẫn trích xuất sao kê ngân hàng trên YouTube"
            >
              <Youtube className="w-4 h-4" />
              <span>Video HD trích xuất sao kê</span>
            </button>
            <a
              href={YOUTUBE_BANK_STATEMENT_GUIDE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-100 transition-colors"
              title="Mở video YouTube trên tab mới"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>


        {/* Main Content Area: Sidebar + Reading Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation: 14 chapters */}
          <div className="w-72 shrink-0 border-r border-slate-200 bg-slate-50/60 p-3 overflow-y-auto hidden md:block space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Mục lục 14 chương
            </div>
            {guideSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : sec.highlight
                      ? 'text-red-700 bg-red-50/80 hover:bg-red-100/80 border border-red-200/60 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : sec.highlight ? 'text-red-600' : 'text-slate-400'}`} />
                  <span className="truncate">{sec.title}</span>
                </button>
              );
            })}
          </div>

          {/* Right Reading Canvas */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-700 text-sm leading-relaxed">
            {/* Section 1: Cover */}
            {activeSection === 1 && (
              <div className="space-y-6">
                <div className="bg-linear-to-br from-blue-50 via-indigo-50 to-white p-6 rounded-3xl border border-blue-200 text-center space-y-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-black tracking-wide">
                    EDUTUTOR PRO
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    HỆ THỐNG QUẢN LÝ DẠY HỌC THÊM & TRUNG TÂM ĐÀO TẠO THÔNG MINH
                  </h2>
                  <div className="text-sm font-bold text-blue-700">
                    TÀI LIỆU HƯỚNG DẪN SỬ DỤNG CHI TIẾT (v2.5.0-PRO)
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-white font-bold">
                      <tr>
                        <th className="py-2.5 px-4 w-1/3">THÔNG TIN TÀI LIỆU</th>
                        <th className="py-2.5 px-4">CHI TIẾT VẬN HÀNH</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-600">Sản phẩm ứng dụng</td>
                        <td className="py-2.5 px-4 font-medium text-slate-900">EduTutor Pro (Phiên bản Web SPA, PWA Mobile & Desktop)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-600">Mã phát hành</td>
                        <td className="py-2.5 px-4 font-bold text-blue-700">v2.5.0-PRO (Tháng 10/2026)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-600">Đối tượng sử dụng</td>
                        <td className="py-2.5 px-4 text-slate-700">Ban Giám đốc, Giáo viên, Nhân viên Vận hành, Phụ huynh, Học sinh</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-600">Cơ sở dữ liệu & Xác thực</td>
                        <td className="py-2.5 px-4 text-slate-700">Google Cloud Platform & Firebase Authentication / Cloud Firestore</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-600">Tiêu chuẩn thanh toán</td>
                        <td className="py-2.5 px-4 font-semibold text-emerald-700">VietQR Napas 247 Dynamic Matching</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-600">SĐT/Zalo/Email</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900">0986.07.07.68 - tuannmit09@gmail.com</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-600">Ngày xuất bản</td>
                        <td className="py-2.5 px-4 text-slate-700">05/10/2026</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Section 2: Đăng nhập & Trường học */}
            {activeSection === 2 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <span>1. Đăng nhập & Đăng ký</span>
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 text-xs">
                  <li>Truy cập link chính thức: <strong className="text-blue-600">https://aquanlylop.vercel.app/</strong></li>
                  <li>Có thể quét mã QR trên màn hình đăng nhập để cài đặt ứng dụng trên Điện thoại (PWA), thuận tiện điểm danh mọi lúc mọi nơi.</li>
                </ul>
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <img src="/manual_assets/01_login_authentication.png" alt="Đăng nhập" className="w-full object-cover" />
                </div>

                <h3 className="text-base font-bold text-slate-900 pt-4 flex items-center gap-2">
                  <School className="w-5 h-5 text-indigo-600" />
                  <span>2. Thêm Trường học</span>
                </h3>
                <p className="text-xs text-slate-600">
                  Dành cho giáo viên muốn quản lý học sinh theo từng trường phổ thông (Mã trường sẽ được đưa vào mã VietQR để phân biệt).
                </p>
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <img src="/manual_assets/06_school_management.png" alt="Trường học" className="w-full object-cover" />
                </div>
              </div>
            )}

            {/* Section 3: Môn học & Lớp học */}
            {activeSection === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">3. Thêm Môn học</h3>
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <img src="/manual_assets/07_subject_management.png" alt="Môn học" className="w-full object-cover" />
                </div>

                <h3 className="text-base font-bold text-slate-900 pt-4">4. Thêm Lớp học</h3>
                <p className="text-xs text-slate-600">
                  Cấu hình tên lớp, khối học, đơn giá mỗi buổi (feePerSession) để hệ thống tự động nhân số buổi tính học phí.
                </p>
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <img src="/manual_assets/08_class_management.png" alt="Lớp học" className="w-full object-cover" />
                </div>
              </div>
            )}

            {/* Section 4: Thêm học sinh (3 cách) */}
            {activeSection === 4 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">5. Thêm Học sinh</h3>
                <p className="text-xs text-slate-700">Bạn có thể thêm Học sinh bằng 3 cách linh hoạt:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <strong className="block text-blue-900 mb-1">Cách 1: Từng học sinh</strong>
                    <span>Nhập trực tiếp họ tên, năm sinh, trường, phụ huynh, SĐT.</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <strong className="block text-emerald-900 mb-1">Cách 2: File Excel</strong>
                    <span>Tải file Excel mẫu (.xlsx), điền danh sách rồi tải lên.</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <strong className="block text-amber-900 mb-1">Cách 3: Copy - Parse</strong>
                    <span>Copy trực tiếp danh sách tên từ Zalo/Word và dán vào phần mềm.</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <img src="/manual_assets/09_student_management.png" alt="Học sinh" className="w-full object-cover" />
                </div>
              </div>
            )}

            {/* Section 5: Cấp tài khoản */}
            {activeSection === 5 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">6. Cấp tài khoản cho Học sinh & Phụ Huynh</h3>
                <p className="text-xs text-slate-700">
                  Thầy cô có thể cấp tài khoản cho HS và PH vào phần mềm. Khi đăng nhập, HS và PH sẽ nhìn thấy Học phí hàng tháng, mã VietQR thanh toán, theo dõi điểm danh từng buổi và điểm số/nhận xét của Thầy cô.
                </p>
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <img src="/manual_assets/10_account_management.png" alt="Cấp tài khoản" className="w-full object-cover" />
                </div>
              </div>
            )}

            {/* Section 6: Lịch học */}
            {activeSection === 6 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">7. Xếp lịch học</h3>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                  <li><strong>Bước 1:</strong> Tạo lịch học cố định theo thứ trong tuần và khung giờ.</li>
                  <li><strong>Bước 2:</strong> Nhấn nút <strong>"Sinh buổi học tháng"</strong> để tạo danh sách buổi học thực tế phục vụ điểm danh.</li>
                  <li>Thầy cô có thể thêm ca học phát sinh, đổi lịch học, hủy lịch hoặc xóa buổi học linh hoạt.</li>
                </ul>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <img src="/manual_assets/11_schedule_management.png" alt="Lịch học" className="rounded-xl border border-slate-200" />
                  <img src="/manual_assets/12_session_management.png" alt="Buổi học" className="rounded-xl border border-slate-200" />
                </div>
              </div>
            )}

            {/* Section 7: Điểm danh */}
            {activeSection === 7 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">8. Điểm danh buổi học</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
                  <li>Chọn Lớp &rarr; Chọn Tháng &rarr; Chọn buổi học cần điểm danh.</li>
                  <li>Thầy cô có thể tích chọn từng em, hoặc chọn <strong>"Điểm danh có mặt tất cả"</strong>, hoặc <strong>"Đặt lại"</strong>.</li>
                  <li><em>Mẹo nhanh:</em> Chọn "Điểm danh có mặt tất cả", sau đó chỉ cần tích chọn các bạn vắng mặt.</li>
                  <li><strong>Ghi chú:</strong> Giáo viên nên cài đặt ứng dụng trên Điện thoại để điểm danh ngay tại lớp rất thuận tiện.</li>
                </ul>
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <img src="/manual_assets/13_attendance_management.png" alt="Điểm danh" className="w-full object-cover" />
                </div>
              </div>
            )}

            {/* Section 8: Tài khoản ngân hàng VietQR */}
            {activeSection === 8 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">9. Cài đặt Tài khoản Ngân hàng nhận tiền</h3>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                  <li>Điền số tài khoản ngân hàng và chọn ngân hàng để hệ thống tự động tạo mã QR VietQR Napas 247 cho phụ huynh quét thanh toán.</li>
                  <li>Hệ thống tự động sinh cú pháp chuyển khoản chuẩn ngân hàng không dấu gạch dưới: <code>[Mã trường]K[Khóa][Tên]T[Tháng][Năm]</code> (Ví dụ: <code>SCHK09DucAnhT92026</code>).</li>
                  <li className="text-red-600 font-bold">Lưu ý quan trọng: Tên chủ tài khoản phải ghi đầy đủ họ tên có dấu hoặc không dấu in hoa (ví dụ: NGUYEN MINH TUAN). Không ghi Thầy A, Cô B.</li>
                </ul>
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <img src="/manual_assets/18_vietqr_payment.png" alt="Cấu hình VietQR" className="w-full object-cover" />
                </div>
              </div>
            )}

            {/* Section 9: Bảng kê học phí */}
            {activeSection === 9 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">10. Bảng kê và tính học phí</h3>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                  <li>Sau khi điểm danh, học phí từng học sinh được tự động tổng hợp từ số buổi học thực tế &times; đơn giá.</li>
                  <li>Giáo viên vào chức năng để xem bảng kê, gửi mã QR cho PH và theo dõi trạng thái.</li>
                  <li>Hệ thống tách biệt rõ ràng 2 kênh thu: <strong>Thu qua ngân hàng (Quét QR sao kê)</strong> và <strong>Thu Tiền mặt (Thủ công)</strong>.</li>
                  <li>Khi phụ huynh nộp tiền mặt, giáo viên bấm nút "Thu tiền mặt" để xác nhận.</li>
                </ul>
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <img src="/manual_assets/17_tuition_management.png" alt="Bảng kê học phí" className="w-full object-cover" />
                </div>
              </div>
            )}

            {/* Section 10: Xuất PDF */}
            {activeSection === 10 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">11. Xuất thông báo thu tiền PDF gửi nhóm PH</h3>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                  <li>Giáo viên nhấn nút <strong>"Xuất PDF Thu Tiền Theo Lớp"</strong> để sinh file PDF gồm phiếu thu của từng em học sinh.</li>
                  <li>Mỗi học sinh là 1 trang A4 hoàn chỉnh có sẵn mã VietQR nạp sẵn số tiền và nội dung chuyển khoản.</li>
                  <li className="text-red-600 font-bold">Nhắc phụ huynh: Chỉ cần mở app ngân hàng quét mã QR và bấm chuyển, tuyệt đối không chỉnh sửa nội dung chuyển khoản.</li>
                  <li>Thầy cô nên quét thử mã QR để kiểm tra lại tài khoản trước khi gửi vào nhóm lớp.</li>
                </ul>
              </div>
            )}

            {/* Section 11: Sao kê & Video YouTube */}
            {activeSection === 11 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-red-600" />
                    <span>12. Sao kê và Đối soát học phí tự động</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowVideoModal(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>Xem video hướng dẫn</span>
                  </button>
                </div>

                {/* Video highlight box */}
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Youtube className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        Video YouTube hướng dẫn trích xuất sao kê ngân hàng
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Hướng dẫn cách đăng nhập website Vietcombank/ngân hàng và tải file sao kê Excel chuẩn 4 cột.
                      </p>
                    </div>
                  </div>
                  <a
                    href={YOUTUBE_BANK_STATEMENT_GUIDE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold border border-red-200 transition-colors shrink-0"
                  >
                    <span>Mở trên YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <p><strong>Quy trình 5 bước đối soát chuẩn:</strong></p>
                  <ol className="list-decimal pl-5 space-y-1.5">
                    <li><strong>Bước 1:</strong> Đăng nhập website ngân hàng, vào Lịch sử giao dịch &rarr; chọn khoảng thời gian cần đối soát &rarr; Tải file sao kê Excel.</li>
                    <li><strong>Bước 2:</strong> Mở file sao kê, để lại 4 cột: STT, Ngày giao dịch, Số tiền, Nội dung.</li>
                    <li><strong>Bước 3:</strong> Vào mục <em>"Sao Kê Ngân Hàng & Đối Soát"</em> &rarr; Nhấn nút <strong>"Import Sao Kê Excel"</strong>.</li>
                    <li><strong>Bước 4:</strong> Chọn đúng kỳ Tháng/Năm đối soát (ví dụ Tháng 9/2026).</li>
                    <li><strong>Bước 5:</strong> Nhấn nút <strong>"Chạy đối soát tự động"</strong>.</li>
                  </ol>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <img src="/manual_assets/19_bank_reconciliation.png" alt="Đối soát sao kê" className="w-full object-cover" />
                </div>
              </div>
            )}

            {/* Section 12: Đối soát thủ công */}
            {activeSection === 12 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">13. Đối soát thủ công các giao dịch chưa khớp</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
                  <li>Với các giao dịch phụ huynh chuyển khoản không ghi đúng cú pháp QR, hệ thống sẽ gắn nhãn: <strong>"Chưa gán học phí"</strong>.</li>
                  <li>Giáo viên bấm nút <strong>"Khớp"</strong> để mở hộp thoại gán thủ công.</li>
                  <li><strong>Cải tiến thông minh:</strong> Hệ thống tự động lọc chỉ hiện danh sách học sinh của đúng tháng đang đối soát và chỉ hiện các bạn <em>Chưa nộp</em>, đồng thời ưu tiên học sinh có số tiền khớp chính xác lên đầu.</li>
                </ul>
              </div>
            )}

            {/* Section 13: Giảng dạy */}
            {activeSection === 13 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">14. Phần dành cho Giảng dạy</h3>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                  <li><strong>Tạo bài học:</strong> Soạn bài giảng, tóm tắt lý thuyết trọng tâm theo từng khối lớp để học sinh nắm bắt trước khi đến lớp.</li>
                  <li><strong>Nhận xét & Điểm số:</strong> Chấm điểm trên lớp và ghi lời phê chi tiết. Phụ huynh và học sinh có thể theo dõi tiến độ qua ứng dụng riêng.</li>
                </ul>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <img src="/manual_assets/14_lesson_management.png" alt="Bài học" className="rounded-xl border border-slate-200" />
                  <img src="/manual_assets/16_evaluation_management.png" alt="Nhận xét điểm số" className="rounded-xl border border-slate-200" />
                </div>
              </div>
            )}

            {/* Section 14: Bài tập về nhà */}
            {activeSection === 14 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900">15. Quản lý Bài tập về nhà</h3>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                  <li>Giáo viên giao bài tập về nhà đính kèm đề bài hoặc file ảnh.</li>
                  <li>Học sinh làm bài, chụp ảnh bài làm và tải lên để nộp trực tiếp trên ứng dụng.</li>
                  <li>Giáo viên chấm điểm, nhận xét và gửi phản hồi cho học sinh và phụ huynh.</li>
                </ul>
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <img src="/manual_assets/15_homework_management.png" alt="Bài tập về nhà" className="w-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Tài liệu vận hành EduTutor Pro • Hotline hỗ trợ 24/7: <strong>0986.07.07.68</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Embedded YouTube Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-3xl w-full p-4 border border-slate-800 shadow-2xl flex flex-col space-y-3">
            <div className="flex items-center justify-between text-white px-2">
              <div className="flex items-center space-x-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <h4 className="font-bold text-sm">
                  Hướng Dẫn Trích Xuất Sao Kê Từ Tài Khoản Ngân Hàng
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800">
              <iframe
                src="https://www.youtube.com/embed/lBMk39wyZzU?autoplay=1"
                title="Hướng dẫn trích xuất sao kê ngân hàng"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-400">
              <span>Link video: <a href={YOUTUBE_BANK_STATEMENT_GUIDE_URL} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{YOUTUBE_BANK_STATEMENT_GUIDE_URL}</a></span>
              <a
                href={YOUTUBE_BANK_STATEMENT_GUIDE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-red-400 hover:text-red-300 font-bold"
              >
                <span>Xem trên YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
