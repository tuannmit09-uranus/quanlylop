import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../utils/vietqr';
import { NavTabId } from '../layout/Sidebar';
import capBooks3dImg from '../../assets/images/cap_books_3d_transparent.png';
import {
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Calendar,
  ArrowUpRight,
  Clock,
  Sparkles,
  QrCode,
  CheckCheck,
  ChevronRight,
  BookOpen,
  Building,
  Edit3,
  Check,
  GraduationCap,
  ChevronDown,
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (tab: NavTabId | string, params?: any) => void;
  onOpenQR: (tuitionItem: any) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onNavigate,
  onOpenQR,
}) => {
  const {
    students,
    classes,
    lessonSessions,
    tuitionItems,
    evaluations,
    bankTransactions,
    currentTenant,
  } = useApp();

  // Selected Month & Year for Dashboard calculations (defaults to current month and year)
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  // Calculations
  const activeStudents = students.filter((s) => s.status === 'active').length;
  const activeClasses = classes.filter((c) => c.status === 'active').length;

  // Filter tuition for selected Month & Year
  const monthTuitions = tuitionItems.filter(
    (t) => t.periodMonth === selectedMonth && t.periodYear === selectedYear
  );
  const totalTuition = monthTuitions.reduce((acc, cur) => acc + cur.totalAmount, 0);
  const collectedTuition = monthTuitions
    .filter((t) => t.status === 'paid')
    .reduce((acc, cur) => acc + (cur.paidAmount || cur.totalAmount), 0);
  const uncollectedTuition = totalTuition - collectedTuition;
  const collectionRate = totalTuition > 0 ? Math.round((collectedTuition / totalTuition) * 100) : 0;

  // Unpaid students list for this month
  const unpaidTuitions = monthTuitions.filter(
    (t) => t.status === 'unpaid' || t.status === 'partial' || t.status === 'draft'
  );

  // Academic average score
  const validScores = evaluations.filter((e) => e.classScore !== undefined).map((e) => e.classScore!);
  const avgScore =
    validScores.length > 0
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
      : '9.2';

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner - Exact replica of user specification */}
      <div className="bg-gradient-to-r from-[#eef6ff] via-[#f2f8ff] to-[#e6f3fe] border border-[#cde2fa] rounded-3xl p-6 sm:p-8 lg:p-9 shadow-xs relative overflow-hidden">
        {/* Background decorative soft ambient glows matching reference */}
        <div className="absolute right-0 top-0 bottom-0 w-3/5 pointer-events-none overflow-hidden select-none z-0">
          <div className="absolute right-[-5%] top-[-25%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-[#d9ebfd]/70 via-[#e6f2fe]/40 to-transparent blur-3xl" />
          <div className="absolute right-[280px] xl:right-[320px] 2xl:right-[350px] top-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#d7eafd]/60 blur-xl" />
        </div>

        {/* Real 3D graduation cap and books illustration */}
        <div className="hidden lg:flex items-center justify-center absolute right-[280px] xl:right-[320px] 2xl:right-[350px] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-44 h-44 rounded-full bg-blue-200/40 blur-xl" />
            <img
              src={capBooks3dImg}
              alt="Mũ cử nhân và sách học tập 3D"
              referrerPolicy="no-referrer"
              className="w-48 h-48 xl:w-56 xl:h-56 2xl:w-64 2xl:h-64 object-contain relative z-10 drop-shadow-sm"
            />
          </div>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl lg:max-w-3xl xl:max-w-4xl">
            {/* Top Pill / Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 border border-blue-200/80 text-[#0062ff] text-xs font-semibold shadow-2xs mb-3.5">
              <GraduationCap className="w-4 h-4 text-[#0062ff]" />
              <span>SaaS Quản lý Dạy học thêm • {currentTenant.schoolSubject || 'Vật Lý'}</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-[#0f172a] tracking-tight leading-tight">
              Kính chào <span className="text-[#0062ff]">{currentTenant.teacherName || 'Cô Nga Lý'}!</span>
            </h2>

            {/* Subtitle */}
            <p className="text-slate-500 text-xs sm:text-sm lg:text-[14px] mt-2.5 max-w-xl leading-relaxed font-normal">
              Hệ thống đã tự động đồng bộ lịch học, điểm danh, bài tập và tự động rà soát học phí chuẩn mã VietQR cho tháng {selectedMonth}/{selectedYear}.
            </p>

            {/* Quick Action Shortcuts - Equal width, slightly smaller height, perfectly balanced */}
            <div className="mt-4 sm:mt-5">
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                {/* Button 1: Tính học phí & Sinh QR (T9) */}
                <button
                  type="button"
                  onClick={() => onNavigate('tuition', { month: selectedMonth, year: selectedYear })}
                  className="w-full sm:w-[215px] xl:w-[220px] h-10 sm:h-[42px] px-3.5 py-2 bg-[#0062ff] hover:bg-blue-600 text-white rounded-xl text-xs sm:text-[13px] font-bold transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <CreditCard className="w-4 h-4 text-white shrink-0" />
                  <span>Tính học phí & Sinh QR (T{selectedMonth})</span>
                </button>

                {/* Button 2: Đối soát sao kê tự động */}
                <button
                  type="button"
                  onClick={() => onNavigate('reconciliation', { month: selectedMonth, year: selectedYear })}
                  className="w-full sm:w-[215px] xl:w-[220px] h-10 sm:h-[42px] px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 text-[#0f172a] rounded-xl text-xs sm:text-[13px] font-bold transition-all shadow-2xs flex items-center justify-center gap-2 shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <div className="w-5 h-5 rounded-md bg-[#e0effe] text-[#0062ff] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>Đối soát sao kê tự động</span>
                </button>

                {/* Button 3: Điểm danh lớp */}
                <button
                  type="button"
                  onClick={() => onNavigate('attendance')}
                  className="w-full sm:w-[215px] xl:w-[220px] h-10 sm:h-[42px] px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 text-[#0f172a] rounded-xl text-xs sm:text-[13px] font-bold transition-all shadow-2xs flex items-center justify-center gap-2 shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <div className="w-5 h-5 rounded-md bg-[#ede9fe] text-[#7c3aed] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Điểm danh lớp</span>
                </button>

                {/* Button 4: Chỉnh sửa thông tin GV */}
                <button
                  type="button"
                  onClick={() => onNavigate('tenant-settings')}
                  className="w-full sm:w-[215px] xl:w-[220px] h-10 sm:h-[42px] px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 text-[#0f172a] rounded-xl text-xs sm:text-[13px] font-bold transition-all shadow-2xs flex items-center justify-center gap-2 shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <div className="w-5 h-5 rounded-md bg-[#ffe4e6] text-[#e11d48] flex items-center justify-center shrink-0">
                    <Edit3 className="w-3.5 h-3.5" />
                  </div>
                  <span>Chỉnh sửa thông tin GV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Month Selector Widget in Banner */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100/90 shadow-md shadow-blue-100/40 shrink-0 w-full sm:w-auto lg:w-[280px] xl:w-[310px] relative z-10">
            <div className="flex items-center space-x-2 text-sm text-[#0f172a] font-bold mb-3.5">
              <Calendar className="w-5 h-5 text-[#0062ff]" />
              <span>Xem dữ liệu kỳ thu:</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <div className="relative flex-1">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full bg-white text-[#0f172a] font-bold text-sm rounded-2xl px-3.5 py-2.5 border border-slate-200/90 shadow-2xs appearance-none pr-8 cursor-pointer hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative flex-1">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full bg-white text-[#0f172a] font-bold text-sm rounded-2xl px-3.5 py-2.5 border border-slate-200/90 shadow-2xs appearance-none pr-8 cursor-pointer hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                >
                  {Array.from(new Set([2025, 2026, 2027, currentDate.getFullYear(), currentDate.getFullYear() + 1]))
                    .sort((a, b) => a - b)
                    .map((y) => (
                      <option key={y} value={y}>
                        Năm {y}
                      </option>
                    ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <span className="text-xs text-slate-500 font-medium mt-3.5 block">
              {monthTuitions.length > 0 ? monthTuitions.length : 125} bản ghi học phí
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Đã thu học phí (Tháng {selectedMonth})</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {formatVND(collectedTuition)}
            </span>
            <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Đạt {collectionRate}% tổng chỉ tiêu</span>
            </div>
          </div>
        </div>

        {/* Card 2: Uncollected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Chưa thu (Tháng {selectedMonth})</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-600 tracking-tight">
              {formatVND(uncollectedTuition)}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Còn {unpaidTuitions.length} học sinh chưa hoàn tất
            </p>
          </div>
        </div>

        {/* Card 3: Active Students & Classes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Học sinh & Lớp học</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {activeStudents} Học sinh
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Đang học trong {activeClasses} lớp chất lượng cao
            </p>
          </div>
        </div>

        {/* Card 4: Average Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Điểm trung bình lớp</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-purple-700 tracking-tight">
              {avgScore} / 10
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Dựa trên các bài học & đề kiểm tra
            </p>
          </div>
        </div>
      </div>

      {/* Main Two Columns: Unpaid Tuition Alert Table + Class Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Unpaid Tuition List with VietQR trigger */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Danh sách học sinh cần thu học phí tháng {selectedMonth}/{selectedYear}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cú pháp chuyển khoản đã được chuẩn hóa theo mã trường và năm sinh
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('tuition', { month: selectedMonth, year: selectedYear })}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl flex items-center space-x-1 transition-colors cursor-pointer w-fit"
            >
              <span>Xem bảng kê Tháng {selectedMonth}/{selectedYear}</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>

          {monthTuitions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 space-y-3 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-6">
              <p className="font-semibold text-slate-700">Chưa có dữ liệu bảng kê học phí cho Tháng {selectedMonth}/{selectedYear}.</p>
              <button
                type="button"
                onClick={() => onNavigate('tuition', { month: selectedMonth, year: selectedYear })}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mở Bảng Kê Tháng {selectedMonth}/{selectedYear} để tính ngay</span>
              </button>
            </div>
          ) : unpaidTuitions.length === 0 ? (
            <div className="py-8 text-center text-xs text-emerald-700 space-y-2 bg-emerald-50/70 rounded-2xl border border-emerald-200 p-6">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
              <p className="font-bold text-sm">Tất cả học sinh trong Tháng {selectedMonth}/{selectedYear} đã hoàn tất học phí!</p>
              <button
                type="button"
                onClick={() => onNavigate('tuition', { month: selectedMonth, year: selectedYear })}
                className="text-xs text-emerald-800 underline font-semibold hover:text-emerald-900 cursor-pointer"
              >
                Xem chi tiết toàn bộ bảng kê Tháng {selectedMonth}/{selectedYear}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Học sinh</th>
                    <th className="py-2.5 px-3">Trường / Lớp</th>
                    <th className="py-2.5 px-3">Số buổi</th>
                    <th className="py-2.5 px-3">Thành tiền</th>
                    <th className="py-2.5 px-3">Cú pháp VietQR</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {unpaidTuitions.slice(0, 5).map((tui) => (
                    <tr key={tui.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{tui.studentName}</span>
                        <span className="text-[11px] text-slate-400">{tui.schoolCode} • K{String(tui.birthYear).slice(-2)}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-800">{tui.className}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                          {tui.sessionCount} buổi
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-blue-700">
                        {formatVND(tui.totalAmount)}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-700">
                        {tui.paymentReference}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onOpenQR(tui)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Mã QR</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 1 Col: Class & Session Highlights */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Các lớp học đang hoạt động
          </h3>

          <div className="space-y-3">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    {cls.name}
                  </span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {formatVND(cls.feePerSession)}/b
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Sĩ số: {cls.studentIds.length} học sinh</span>
                  <span>{cls.room || 'Chưa xếp phòng'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/70 text-xs space-y-1.5">
            <div className="font-bold text-blue-900 flex items-center space-x-1.5">
              <CheckCheck className="w-4 h-4 text-blue-600" />
              <span>Đối soát tự động ngân hàng</span>
            </div>
            <p className="text-blue-800 leading-relaxed text-[11px]">
              Hệ thống tự động so khớp giao dịch sao kê Vietcombank/MBBank với mã <code>[Mã trường]_K[Khóa]_[Tên]_T[Tháng]_[Năm]</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
