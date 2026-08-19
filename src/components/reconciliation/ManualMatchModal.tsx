import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BankTransaction } from '../../types';
import { formatVND } from '../../utils/vietqr';
import {
  Link2,
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  GraduationCap,
  Calendar,
} from 'lucide-react';

interface ManualMatchModalProps {
  transaction: BankTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ManualMatchModal: React.FC<ManualMatchModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const { tuitionItems, manualMatchTransaction, students } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen || !transaction) return null;

  // Filter tuition items for the transaction's month/year, or unpaid items
  const candidateTuitions = tuitionItems.filter((tui) => {
    // Show unpaid or matching month
    const isSameMonth =
      tui.periodMonth === transaction.statementMonth &&
      tui.periodYear === transaction.statementYear;

    if (!isSameMonth && tui.status === 'paid') return false;

    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    const student = students.find((s) => s.id === tui.studentId);
    return (
      tui.studentName.toLowerCase().includes(term) ||
      tui.className.toLowerCase().includes(term) ||
      tui.paymentReference.toLowerCase().includes(term) ||
      (student && student.parentName && student.parentName.toLowerCase().includes(term))
    );
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
            <span>Danh sách học phí Tháng {transaction.statementMonth}/{transaction.statementYear}:</span>
            <span>{candidateTuitions.length} học sinh</span>
          </div>

          <div className="border border-slate-200 rounded-2xl max-h-60 overflow-y-auto divide-y divide-slate-100">
            {candidateTuitions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Không tìm thấy bản ghi học phí phù hợp với từ khóa.
              </div>
            ) : (
              candidateTuitions.map((tui) => {
                const isAmountMatch = tui.totalAmount === transaction.amount;
                return (
                  <div
                    key={tui.id}
                    onClick={() => handleSelectTuition(tui.id)}
                    className="p-3 hover:bg-blue-50/60 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-xs group-hover:text-blue-700">
                          {tui.studentName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                          {tui.className}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            tui.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {tui.status === 'paid' ? 'Đã nộp' : 'Chưa nộp'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono">
                        <span>Mã QR: {tui.paymentReference}</span>
                        <span>•</span>
                        <span>{tui.totalSessions} buổi học</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-xs font-black text-slate-900 font-mono">
                        {formatVND(tui.totalAmount)}
                      </div>
                      {isAmountMatch ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Khớp đúng số tiền</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Lệch {formatVND(Math.abs(tui.totalAmount - transaction.amount))}</span>
                        </span>
                      )}
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
