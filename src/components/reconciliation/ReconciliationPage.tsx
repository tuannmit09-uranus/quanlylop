import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BankTransaction } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { exportSampleVietcombankExcel } from '../../utils/bankStatementParser';
import { ExcelImportModal } from './ExcelImportModal';
import { ManualMatchModal } from './ManualMatchModal';
import {
  CheckCheck,
  Building,
  CreditCard,
  User,
  Plus,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Hash,
  Download,
  UploadCloud,
  FileSpreadsheet,
  Trash2,
  Search,
  Filter,
  Link2,
  Unlink2,
  Calendar,
  AlertTriangle,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface ReconciliationPageProps {
  initialMonth?: number;
  initialYear?: number;
}

export const ReconciliationPage: React.FC<ReconciliationPageProps> = ({
  initialMonth,
  initialYear,
}) => {
  const {
    bankTransactions,
    bankStatements,
    tuitionItems,
    paymentAccount,
    runAutomatedReconciliation,
    addBankTransaction,
    deleteBankTransaction,
    clearBankTransactionsForMonth,
    unlinkTransaction,
  } = useApp();

  // Selected Period state (default to prop, or August 2026 / current)
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth || 8);
  const [selectedYear, setSelectedYear] = useState<number>(initialYear || 2026);

  // Sync state if props change
  React.useEffect(() => {
    if (initialMonth !== undefined) setSelectedMonth(initialMonth);
    if (initialYear !== undefined) setSelectedYear(initialYear);
  }, [initialMonth, initialYear]);

  // Modals state
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showManualMatchModal, setShowManualMatchModal] = useState<boolean>(false);
  const [selectedTxnForMatch, setSelectedTxnForMatch] = useState<BankTransaction | null>(null);
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'matched' | 'unmatched' | 'discrepancy'>('all');

  // Copy feedback state
  const [copiedTxnId, setCopiedTxnId] = useState<string | null>(null);

  // Form state for simulate/manual entry
  const [simAmount, setSimAmount] = useState<number>(600000);
  const [simDescription, setSimDescription] = useState<string>(
    'Vietcombank:1027058089:Le Thi Hong Hanh chuyen khoan#SP#020097040508042045012026XWPC078779.5389.82579.204501'
  );
  const [simDate, setSimDate] = useState<string>('04/08/2026');
  const [simDocNo, setSimDocNo] = useState<string>('5389 - 82579');

  // Get active statement for selected month
  const currentStatement = bankStatements.find(
    (s) => s.month === selectedMonth && s.year === selectedYear
  );

  // Filter transactions by selected month & year
  const monthTransactions = bankTransactions.filter(
    (tx) =>
      (tx.statementMonth === selectedMonth && tx.statementYear === selectedYear) ||
      (!tx.statementMonth && selectedMonth === 8 && selectedYear === 2026)
  );

  // Filter by search & status tab
  const filteredTransactions = monthTransactions.filter((tx) => {
    // Status filter
    if (statusFilter === 'matched' && tx.reconciliationStatus !== 'matched' && tx.reconciliationStatus !== 'manual_matched') {
      return false;
    }
    if (statusFilter === 'unmatched' && tx.reconciliationStatus !== 'unmatched') {
      return false;
    }
    if (statusFilter === 'discrepancy' && tx.reconciliationStatus !== 'discrepancy') {
      return false;
    }

    // Search filter
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      tx.description.toLowerCase().includes(term) ||
      (tx.matchedStudentName && tx.matchedStudentName.toLowerCase().includes(term)) ||
      (tx.matchedPaymentReference && tx.matchedPaymentReference.toLowerCase().includes(term)) ||
      (tx.docNo && tx.docNo.toLowerCase().includes(term)) ||
      tx.transactionDate.includes(term) ||
      String(tx.stt || '').includes(term)
    );
  });

  // Calculate stats for current month
  const totalCreditAmount = monthTransactions.reduce((acc, cur) => acc + cur.amount, 0);
  const matchedCount = monthTransactions.filter(
    (tx) => tx.reconciliationStatus === 'matched' || tx.reconciliationStatus === 'manual_matched'
  ).length;
  const discrepancyCount = monthTransactions.filter(
    (tx) => tx.reconciliationStatus === 'discrepancy'
  ).length;
  const unmatchedCount = monthTransactions.filter(
    (tx) => tx.reconciliationStatus === 'unmatched'
  ).length;

  const handleRunRecon = () => {
    const result = runAutomatedReconciliation(selectedMonth, selectedYear);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    alert(
      `Kết quả đối soát tự động Tháng ${selectedMonth}/${selectedYear}:\n` +
        `• Khớp thành công: ${result.matchedCount} giao dịch\n` +
        `• Lệch số tiền cần kiểm tra: ${result.discrepancyCount} giao dịch\n` +
        `• Học phí học sinh tương ứng đã được cập nhật trạng thái "Đã nộp".`
    );
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxnId(id);
    setTimeout(() => setCopiedTxnId(null), 2000);
  };

  const handleOpenManualMatch = (txn: BankTransaction) => {
    setSelectedTxnForMatch(txn);
    setShowManualMatchModal(true);
  };

  const handleClearMonthData = () => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa toàn bộ ${monthTransactions.length} giao dịch sao kê của Tháng ${selectedMonth}/${selectedYear}? Các học phí đã đối soát sẽ được chuyển về trạng thái Chưa nộp.`
      )
    ) {
      clearBankTransactionsForMonth(selectedMonth, selectedYear);
    }
  };

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addBankTransaction) {
      addBankTransaction({
        stt: monthTransactions.length + 1,
        docNo: simDocNo,
        transactionDate: simDate,
        amount: Number(simAmount),
        description: simDescription,
        statementMonth: selectedMonth,
        statementYear: selectedYear,
        reconciliationStatus: 'unmatched',
      });
    }
    setShowSimulateModal(false);
  };

  return (
    <div id="reconciliation-page-root" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-900">
              Sao Kê Ngân Hàng & Đối Soát Học Phí
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
              4 Cột Chuẩn
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Import sao kê ngân hàng theo file Excel (STT, Ngày giao dịch, Số tiền, Nội dung), quản lý và đối soát theo từng tháng
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sample Download */}
          <button
            id="download-sample-excel-header-btn"
            type="button"
            onClick={() => exportSampleVietcombankExcel(selectedMonth, selectedYear)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-200"
            title="Tải file Excel mẫu với cấu trúc chuẩn Vietcombank"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Tải file Excel mẫu</span>
          </button>

          {/* Import Excel Button */}
          <button
            id="open-import-excel-modal-btn"
            type="button"
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-98"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import Sao Kê Excel</span>
          </button>

          {/* Automated Reconciliation Button */}
          <button
            id="run-automated-recon-btn"
            type="button"
            onClick={handleRunRecon}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>Chạy đối soát tự động</span>
          </button>
        </div>
      </div>

      {/* Beneficiary Account & Month Selector Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Month Selector & File info Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Kỳ sao kê ngân hàng
                </span>
                <div className="flex items-center space-x-2 mt-0.5">
                  <select
                    id="select-active-month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-300 text-slate-900 text-sm font-black rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        Tháng {m}
                      </option>
                    ))}
                  </select>
                  <select
                    id="select-active-year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-300 text-slate-900 text-sm font-black rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {[2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>
                        Năm {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Actions for Month */}
            <div className="flex items-center space-x-2">
              <button
                id="add-manual-transaction-btn"
                type="button"
                onClick={() => setShowSimulateModal(true)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm giao dịch</span>
              </button>

              {monthTransactions.length > 0 && (
                <button
                  id="clear-month-transactions-btn"
                  type="button"
                  onClick={handleClearMonthData}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition-colors"
                  title="Xóa toàn bộ dữ liệu sao kê của tháng này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa sao kê tháng</span>
                </button>
              )}
            </div>
          </div>

          {/* Statement metadata banner */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2.5">
              <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-800">
                  {currentStatement?.fileName || `Sao_Ke_Thang_${String(selectedMonth).padStart(2, '0')}_${selectedYear}.xlsx`}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {currentStatement?.uploadedAt
                    ? `Cập nhật lúc: ${currentStatement.uploadedAt}`
                    : `Dữ liệu lưu trữ Tháng ${selectedMonth}/${selectedYear}`}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 font-medium">
              <span className="text-slate-600">
                Giao dịch: <strong className="text-slate-900">{monthTransactions.length}</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600">
                Tổng ghi có: <strong className="text-emerald-700">{formatVND(totalCreditAmount)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Beneficiary Account Card */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white shadow-md flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
              Tài khoản nhận học phí (VietQR / Napas)
            </span>
            <div className="flex items-center space-x-3 mt-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center font-bold text-white text-base">
                <Building className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {paymentAccount.bankName} ({paymentAccount.bankCode})
                </h4>
                <p className="text-[11px] text-slate-300">
                  Chủ TK: <strong className="text-white">{paymentAccount.accountName}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/20 backdrop-blur-xs flex items-center justify-between">
            <span className="text-[11px] text-slate-300 font-medium">Số tài khoản:</span>
            <span className="text-base font-mono font-black text-amber-300 tracking-wider">
              {paymentAccount.accountNumber}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Tổng tiền sao kê tháng</span>
          <p className="text-xl font-black text-slate-900 mt-1">{formatVND(totalCreditAmount)}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {monthTransactions.length} giao dịch ghi nhận
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Đã khớp học phí</span>
          <p className="text-xl font-black text-emerald-600 mt-1">{matchedCount} giao dịch</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
            Đã gán học sinh & nộp tiền
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Lệch số tiền</span>
          <p className="text-xl font-black text-amber-600 mt-1">{discrepancyCount} giao dịch</p>
          <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
            Chuyển thừa hoặc thiếu tiền
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Chưa đối soát</span>
          <p className="text-xl font-black text-slate-600 mt-1">{unmatchedCount} giao dịch</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Cần kiểm tra hoặc khớp thủ công
          </span>
        </div>
      </div>

      {/* Main Bank Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls & Filter Tabs */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
            <button
              id="filter-status-all"
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Tất cả ({monthTransactions.length})
            </button>
            <button
              id="filter-status-matched"
              type="button"
              onClick={() => setStatusFilter('matched')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'matched'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              Đã khớp ({matchedCount})
            </button>
            <button
              id="filter-status-discrepancy"
              type="button"
              onClick={() => setStatusFilter('discrepancy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'discrepancy'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              Lệch tiền ({discrepancyCount})
            </button>
            <button
              id="filter-status-unmatched"
              type="button"
              onClick={() => setStatusFilter('unmatched')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'unmatched'
                  ? 'bg-slate-700 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Chưa khớp ({unmatchedCount})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-transactions-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo STT, nội dung, học sinh..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>
        </div>

        {/* The 4 Core Columns Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                {/* 4 CORE REQUIRED COLUMNS */}
                <th className="py-3 px-4 w-16 text-center">STT</th>
                <th className="py-3 px-4 w-36">Ngày giao dịch</th>
                <th className="py-3 px-4 w-36 text-right">Số tiền giao dịch</th>
                <th className="py-3 px-4 min-w-[280px]">Nội dung giao dịch</th>
                {/* MATCHED & ACTION COLUMNS */}
                <th className="py-3 px-4 w-52">Kết quả đối soát</th>
                <th className="py-3 px-4 w-28 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600 text-sm">
                      Chưa có giao dịch sao kê nào trong Tháng {selectedMonth}/{selectedYear}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Nhấp nút <strong className="text-blue-600">"Import Sao Kê Excel"</strong> để tải file sao kê Vietcombank vào hệ thống.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx, idx) => {
                  const isMatched = tx.reconciliationStatus === 'matched' || tx.reconciliationStatus === 'manual_matched';
                  const isDiscrepancy = tx.reconciliationStatus === 'discrepancy';

                  return (
                    <tr
                      key={tx.id}
                      className={`transition-colors ${
                        isMatched
                          ? 'bg-emerald-50/20 hover:bg-emerald-50/40'
                          : isDiscrepancy
                          ? 'bg-amber-50/30 hover:bg-amber-50/50'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* 1. STT */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-600">
                        {tx.stt || idx + 1}
                      </td>

                      {/* 2. Ngày giao dịch */}
                      <td className="py-3.5 px-4 font-mono text-slate-800">
                        <span className="font-bold block">{tx.transactionDate}</span>
                        {tx.docNo && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            Số CT: {tx.docNo}
                          </span>
                        )}
                      </td>

                      {/* 3. Số tiền giao dịch */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-emerald-700 whitespace-nowrap">
                        +{formatVND(tx.amount)}
                      </td>

                      {/* 4. Nội dung giao dịch */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="flex items-start justify-between gap-2 group">
                          <span className="font-mono text-slate-800 bg-slate-50 group-hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] block select-all break-words w-full">
                            {tx.description}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(tx.id, tx.description)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
                            title="Sao chép nội dung"
                          >
                            {copiedTxnId === tx.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {tx.notes && (
                          <p className="text-[10px] text-slate-400 mt-1 italic pl-1">
                            * {tx.notes}
                          </p>
                        )}
                      </td>

                      {/* Kết quả đối soát */}
                      <td className="py-3.5 px-4">
                        {isMatched ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{tx.reconciliationStatus === 'manual_matched' ? 'Khớp thủ công' : 'Khớp 100%'}</span>
                            </span>
                            {tx.matchedStudentName && (
                              <div>
                                <span className="font-bold text-slate-900 block text-xs">
                                  {tx.matchedStudentName}
                                </span>
                                {tx.matchedPaymentReference && (
                                  <span className="font-mono text-[10px] text-emerald-700 block">
                                    {tx.matchedPaymentReference}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : isDiscrepancy ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Lệch số tiền</span>
                            </span>
                            {tx.matchedStudentName && (
                              <span className="font-bold text-slate-900 block text-xs">
                                {tx.matchedStudentName}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                            <AlertCircle className="w-3 h-3" />
                            <span>Chưa gán học phí</span>
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {isMatched || isDiscrepancy ? (
                            <button
                              type="button"
                              onClick={() => unlinkTransaction(tx.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Hủy liên kết đối soát"
                            >
                              <Unlink2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenManualMatch(tx)}
                              className="px-2 py-1 rounded-lg text-[11px] font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors"
                              title="Gán thủ công vào học sinh"
                            >
                              Khớp
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => deleteBankTransaction(tx.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa giao dịch này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onImportSuccess={(month, year, count) => {
          setSelectedMonth(month);
          setSelectedYear(year);
          try {
            confetti({
              particleCount: 60,
              spread: 60,
              origin: { y: 0.6 },
            });
          } catch {}
          alert(`Đã import thành công ${count} dòng giao dịch sao kê vào Tháng ${month}/${year}!`);
        }}
      />

      {/* Manual Match Modal */}
      <ManualMatchModal
        transaction={selectedTxnForMatch}
        isOpen={showManualMatchModal}
        onClose={() => {
          setShowManualMatchModal(false);
          setSelectedTxnForMatch(null);
        }}
      />

      {/* Add Manual Transaction Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Thêm Giao Dịch Sao Kê Thủ Công
              </h3>
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Kỳ lưu trữ sao kê:
                </label>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800">
                  Tháng {selectedMonth} / Năm {selectedYear}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ngày giao dịch (DD/MM/YYYY):</label>
                <input
                  type="text"
                  value={simDate}
                  onChange={(e) => setSimDate(e.target.value)}
                  placeholder="04/08/2026"
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số chứng từ (Số CT):</label>
                <input
                  type="text"
                  value={simDocNo}
                  onChange={(e) => setSimDocNo(e.target.value)}
                  placeholder="5389 - 82579"
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số tiền giao dịch (Ghi có):</label>
                <input
                  type="number"
                  step={10000}
                  value={simAmount}
                  onChange={(e) => setSimAmount(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-emerald-700 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nội dung chi tiết giao dịch (Memo):
                </label>
                <textarea
                  rows={3}
                  value={simDescription}
                  onChange={(e) => setSimDescription(e.target.value)}
                  placeholder="Vietcombank:1027058089:Le Thi Hong Hanh chuyen khoan..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-[11px] outline-hidden"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  Lưu giao dịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
