import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TuitionItem } from '../../types';
import { formatVND } from '../../utils/vietqr';
import {
  CreditCard,
  QrCode,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  CheckCheck,
  Building2,
  Copy,
  Check,
} from 'lucide-react';
import { VietQRModal } from './VietQRModal';

export const StudentTuitionView: React.FC = () => {
  const {
    students,
    activeStudentId,
    tuitionItems,
    currentTenant,
    paymentAccount,
  } = useApp();

  const currentStudent = students.find((s) => s.id === activeStudentId) || students[0];

  // Strictly filter tuition items for this student only
  const myTuitions = tuitionItems.filter((t) => t.studentId === currentStudent.id);

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedTuitionForQR, setSelectedTuitionForQR] = useState<TuitionItem | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const filteredTuitions = myTuitions.filter((t) => t.periodYear === selectedYear);

  const totalAmount = filteredTuitions.reduce((acc, cur) => acc + cur.totalAmount, 0);
  const paidAmount = filteredTuitions
    .filter((t) => t.status === 'paid')
    .reduce((acc, cur) => acc + (cur.paidAmount || cur.totalAmount), 0);
  const unpaidAmount = totalAmount - paidAmount;

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-2 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Tra Cứu Học Phí & Mã VietQR Tự Động</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Học phí: {currentStudent.fullName}
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">
            Trường: <strong>{currentStudent.schoolName}</strong> ({currentStudent.schoolCode}) • Lớp: <strong>{currentStudent.schoolGrade}</strong>
          </p>
        </div>

        {/* Student Personal Tuition Stats */}
        <div className="grid grid-cols-3 gap-3 bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-xs text-center">
          <div className="px-2">
            <span className="text-[11px] text-blue-200 block">Tổng học phí</span>
            <span className="text-sm sm:text-base font-black text-white">
              {formatVND(totalAmount)}
            </span>
          </div>
          <div className="px-2 border-x border-white/15">
            <span className="text-[11px] text-blue-200 block">Đã thanh toán</span>
            <span className="text-sm sm:text-base font-black text-emerald-300">
              {formatVND(paidAmount)}
            </span>
          </div>
          <div className="px-2">
            <span className="text-[11px] text-blue-200 block">Cần thanh toán</span>
            <span className="text-sm sm:text-base font-black text-amber-300">
              {formatVND(unpaidAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Year Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-700">Năm học:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-hidden"
          >
            {[2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Hiển thị <strong>{filteredTuitions.length}</strong> kỳ học phí cá nhân
        </span>
      </div>

      {/* Tuition Items List */}
      <div className="space-y-4">
        {filteredTuitions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Chưa có dữ liệu học phí cho năm {selectedYear}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Bảng kê học phí được tính tự động từ lịch điểm danh thực tế theo từng tháng.
            </p>
          </div>
        ) : (
          filteredTuitions.map((tui) => {
            const isPaid = tui.status === 'paid';
            const isPartial = tui.status === 'partial';

            return (
              <div
                key={tui.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:border-blue-200 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-slate-900">
                          Học phí Tháng {tui.periodMonth}/{tui.periodYear}
                        </h3>
                        {isPaid ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đã thanh toán</span>
                          </span>
                        ) : isPartial ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                            Nộp một phần
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center space-x-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Chưa thanh toán</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Lớp: <strong className="text-slate-800">{tui.className}</strong> • Số buổi học thực tế: <strong>{tui.sessionCount} buổi</strong>
                      </p>
                    </div>
                  </div>

                  {/* Amount and VietQR Action */}
                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-slate-400 block font-medium">
                        Số tiền học phí:
                      </span>
                      <span className="text-xl font-black text-blue-700">
                        {formatVND(tui.totalAmount)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTuitionForQR(tui)}
                      className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>{isPaid ? 'Xem lại mã VietQR' : 'Quét mã VietQR Nộp tiền'}</span>
                    </button>
                  </div>
                </div>

                {/* Transfer reference and details */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block mb-0.5">
                      Cú pháp chuyển khoản ngân hàng:
                    </span>
                    <div className="flex items-center space-x-2">
                      <code className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-mono font-bold text-blue-900 text-xs">
                        {tui.paymentReference}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopyRef(tui.paymentReference)}
                        className="p-1 text-slate-500 hover:text-blue-600 transition-colors"
                        title="Sao chép cú pháp"
                      >
                        {copiedRef === tui.paymentReference ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-slate-500 text-[11px] block mb-0.5">
                      Đơn giá tính theo buổi:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatVND(tui.feePerSession)} / 1 buổi học
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* VietQR Modal */}
      {selectedTuitionForQR && (
        <VietQRModal
          tuition={selectedTuitionForQR}
          onClose={() => setSelectedTuitionForQR(null)}
        />
      )}
    </div>
  );
};
