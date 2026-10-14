import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BankTransaction } from '../../types';
import { formatVND, normalizeBankMemo } from '../../utils/vietqr';
import {
  Link2,
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  GraduationCap,
  Calendar,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface ManualMatchModalProps {
  transaction: BankTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  month?: number;
  year?: number;
}

export const ManualMatchModal: React.FC<ManualMatchModalProps> = ({
  transaction,
  isOpen,
  onClose,
  month,
  year,
}) => {
  const { tuitionItems, manualMatchTransaction, students, currentTenant } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Reset search term when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen, transaction?.id]);

  if (!isOpen || !transaction) return null;

  const targetMonth = transaction.statementMonth || month || 0;
  const targetYear = transaction.statementYear || year || 0;

  // Cải tiến lọc danh sách học phí:
  // 1. Chỉ hiện danh sách học phí của tháng đang đối soát (statementMonth & statementYear)
  // 2. Chỉ hiện danh sách học phí CHƯA NỘP (loại bỏ học sinh đã nộp status === 'paid')
  const candidateTuitions = tuitionItems
    .filter((tui) => {
      // 1. Strict Tenant Isolation
      if (currentTenant?.id && tui.tenant_id !== currentTenant.id) return false;

      // 2. Chỉ hiện danh sách học phí của tháng đang đối soát
      if (tui.periodMonth !== targetMonth || tui.periodYear !== targetYear) {
        return false;
      }

      // 3. Chỉ hiện danh sách học phí CHƯA NỘP (bỏ hoàn toàn học sinh đã nộp)
      if (tui.status === 'paid') {
        return false;
      }

      // 4. Chỉ hiện học sinh có buổi tính phí > 0
      if ((tui.sessionCount || 0) <= 0) {
        return false;
      }

      // 5. Tìm kiếm theo tên học sinh, lớp, mã chuyển khoản QR, phụ huynh
      if (!searchTerm.trim()) return true;

      const term = searchTerm.trim().toLowerCase();
      const normalizedTerm = normalizeBankMemo(searchTerm);
      const normalizedRef = normalizeBankMemo(tui.paymentReference);
      const student = students.find((s) => s.id === tui.studentId);
      return (
        tui.studentName.toLowerCase().includes(term) ||
        tui.className.toLowerCase().includes(term) ||
        tui.paymentReference.toLowerCase().includes(term) ||
        (normalizedTerm && normalizedRef.includes(normalizedTerm)) ||
        (student && student.parentName && student.parentName.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => {
      // Ưu tiên 1: Học sinh có học phí khớp đúng số tiền giao dịch lên đầu
      const aAmountMatch = a.totalAmount === transaction.amount ? 1 : 0;
      const bAmountMatch = b.totalAmount === transaction.amount ? 1 : 0;
      if (bAmountMatch !== aAmountMatch) return bAmountMatch - aAmountMatch;

      // Ưu tiên 2: Mã QR xuất hiện trong nội dung chuyển khoản
      const normDesc = normalizeBankMemo(transaction.description);
      const aInDesc = normDesc.includes(normalizeBankMemo(a.paymentReference)) ? 1 : 0;
      const bInDesc = normDesc.includes(normalizeBankMemo(b.paymentReference)) ? 1 : 0;
      if (bInDesc !== aInDesc) return bInDesc - aInDesc;

      // Ưu tiên 3: Theo tên học sinh
      return a.studentName.localeCompare(b.studentName, 'vi');
    });

  const handleSelectTuition = (tuitionId: string) => {
    manualMatchTransaction(transaction.id, tuitionId);
    onClose();
  };

  return (
    <div
      id="manual-match-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="manual-match-modal-container"
        className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Đối Soát Thủ Công Giao Dịch Ngân Hàng
              </h3>
              <p className="text-xs text-slate-500">
                Gán giao dịch chuyển khoản vào đúng học sinh và kỳ học phí tương ứng
              </p>
            </div>
          </div>
          <button
            id="close-manual-match-modal-btn"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Transaction Details */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-500">Giao dịch được chọn:</span>
            <span className="font-mono text-slate-500">{transaction.transactionDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Số tiền nhận được:</span>
            <span className="text-base font-black text-emerald-700 font-mono">
              +{formatVND(transaction.amount)}
            </span>
          </div>
          <div className="pt-1 border-t border-slate-200">
            <span className="text-[11px] text-slate-500 block">Nội dung chuyển khoản (Memo):</span>
            <span className="font-mono text-slate-800 bg-white p-2 rounded-xl border border-slate-200 block text-[11px] select-all break-all mt-0.5">
              {transaction.description}
            </span>
          </div>
        </div>

        {/* Search Candidate Tuitions */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-candidate-tuition-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên học sinh, lớp, phụ huynh, mã chuyển khoản..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span className="font-semibold text-slate-700">
              Danh sách học phí chưa nộp (Tháng {targetMonth}/{targetYear}):
            </span>
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {candidateTuitions.length} học sinh
            </span>
          </div>

          <div className="border border-slate-200 rounded-2xl max-h-72 overflow-y-auto divide-y divide-slate-100">
            {candidateTuitions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-1.5">
                <p className="font-bold text-slate-700 text-sm">
                  {searchTerm
                    ? `Không tìm thấy học sinh chưa nộp nào khớp với "${searchTerm}"`
                    : `Không còn học sinh chưa nộp trong Tháng ${targetMonth}/${targetYear}`}
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Hệ thống chỉ hiển thị học phí chưa nộp của Tháng {targetMonth}/{targetYear}. Tất cả học sinh khác đã được gán hoặc đã hoàn thành nộp học phí.
                </p>
              </div>
            ) : (
              candidateTuitions.map((tui) => {
                const isAmountMatch = tui.totalAmount === transaction.amount;
                return (
                  <div
                    key={tui.id}
                    onClick={() => handleSelectTuition(tui.id)}
                    className="p-3.5 hover:bg-blue-50/70 cursor-pointer flex items-center justify-between gap-3 transition-colors group"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-bold text-slate-900 text-xs group-hover:text-blue-700">
                          {tui.studentName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                          {tui.className}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                          {tui.status === 'partial' ? 'Nộp một phần' : 'Chưa nộp'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono flex-wrap">
                        <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-amber-800 font-bold">
                          {tui.paymentReference}
                        </span>
                        <span>•</span>
                        <span>{tui.sessionCount || 0} buổi</span>
                        <span>•</span>
                        <span className="font-sans font-medium text-slate-600">
                          T{tui.periodMonth}/{tui.periodYear}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="text-right space-y-0.5">
                        <div className="text-sm font-black text-slate-900 font-mono">
                          {formatVND(tui.totalAmount)}
                        </div>
                        {isAmountMatch ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Khớp số tiền</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Lệch {formatVND(Math.abs(tui.totalAmount - transaction.amount))}</span>
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTuition(tui.id);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs group-hover:scale-102 flex items-center space-x-1 cursor-pointer"
                        title={`Gán giao dịch này cho học sinh ${tui.studentName}`}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Gán</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            id="cancel-manual-match-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
};
