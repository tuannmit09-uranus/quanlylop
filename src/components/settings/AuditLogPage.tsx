import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditLog, UserRole } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Layers,
  FileSpreadsheet,
  RefreshCw,
  Lock,
  Unlock,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Info,
  Hash,
  Eye,
  Plus,
  X,
  FileText,
} from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const { auditLogs, currentTenant, currentRole } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [activeLogDetail, setActiveLogDetail] = useState<AuditLog | null>(null);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Search term
      const matchesSearch =
        searchTerm === '' ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.oldValue && log.oldValue.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.newValue && log.newValue.toLowerCase().includes(searchTerm.toLowerCase()));

      // Action
      const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;

      // Entity
      const matchesEntity =
        selectedEntityType === 'ALL' || log.entityType === selectedEntityType;

      // Role
      const matchesRole = selectedRole === 'ALL' || log.actorRole === selectedRole;

      return matchesSearch && matchesAction && matchesEntity && matchesRole;
    });
  }, [auditLogs, searchTerm, selectedAction, selectedEntityType, selectedRole]);

  // Statistics
  const totalEvents = auditLogs.length;
  const tuitionLocks = auditLogs.filter((l) => l.action === 'lock_tuition' || l.action === 'unlock_tuition').length;
  const reconciliationEvents = auditLogs.filter(
    (l) => l.action === 'reconcile_match' || l.action === 'manual_reconcile'
  ).length;
  const sessionChanges = auditLogs.filter(
    (l) => l.action === 'reschedule_session' || l.action === 'cancel_session'
  ).length;

  // Export CSV
  const handleExportCSV = () => {
    const headers =
      'ID,Thời gian,Người thực hiện,Vai trò,Hành động,Đối tượng,Mã đối tượng,Mô tả,Giá trị cũ,Giá trị mới\n';
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.actorName}","${l.actorRole}","${l.action}","${l.entityType}","${l.entityId}","${l.description.replace(/"/g, '""')}","${(l.oldValue || '').replace(/"/g, '""')}","${(l.newValue || '').replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Nhat_Ky_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Helper function for action badge
  const renderActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'lock_tuition':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200">
            <Lock className="w-3 h-3" />
            <span>Chốt học phí</span>
          </span>
        );
      case 'unlock_tuition':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-200">
            <Unlock className="w-3 h-3" />
            <span>Mở khóa học phí</span>
          </span>
        );
      case 'reconcile_match':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
            <CheckCheck className="w-3 h-3" />
            <span>Tự động đối soát</span>
          </span>
        );
      case 'manual_reconcile':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Khớp thủ công</span>
          </span>
        );
      case 'reschedule_session':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Đổi lịch / Dạy bù</span>
          </span>
        );
      case 'cancel_session':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
            <AlertCircle className="w-3 h-3" />
            <span>Hủy buổi học</span>
          </span>
        );
      case 'create':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
            <Plus className="w-3 h-3" />
            <span>Tạo mới</span>
          </span>
        );
      case 'update':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
            <RefreshCw className="w-3 h-3" />
            <span>Cập nhật</span>
          </span>
        );
      case 'delete':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
            <AlertCircle className="w-3 h-3" />
            <span>Xóa</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
            <span>{action}</span>
          </span>
        );
    }
  };

  // Helper for role badge
  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'teacher':
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
            Giáo viên
          </span>
        );
      case 'parent':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
            Phụ huynh
          </span>
        );
      case 'student':
        return (
          <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
            Học sinh
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
            Hệ thống
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1 border border-indigo-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Nhật Ký Kiểm Toán & RLS Multi-Tenant</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Nhật Ký Hoạt Động (Audit Logs)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lưu vết tự động toàn bộ thao tác chốt học phí, đối soát ngân hàng, đổi lịch học và điểm danh bảo đảm tính minh bạch & toàn vẹn dữ liệu.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Nhật Ký (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng sự kiện ghi nhận</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">{totalEvents}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Tất cả hành động của Tenant</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Chốt / Mở học phí</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-indigo-600">{tuitionLocks}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Bảo toàn số liệu kỳ học</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Khớp sao kê VietQR</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-600">{reconciliationEvents}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Tự động & Khớp thủ công</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Đổi lịch & Dạy bù</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-600">{sessionChanges}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Cập nhật buổi học thực tế</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm mô tả, người thao tác, ID..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50/60"
            />
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50/60 font-medium"
            >
              <option value="ALL">Tất cả hành động ({auditLogs.length})</option>
              <option value="lock_tuition">Chốt học phí (lock_tuition)</option>
              <option value="unlock_tuition">Mở khóa học phí (unlock_tuition)</option>
              <option value="reconcile_match">Tự động đối soát (reconcile_match)</option>
              <option value="manual_reconcile">Khớp thủ công (manual_reconcile)</option>
              <option value="reschedule_session">Đổi lịch / Dạy bù (reschedule_session)</option>
              <option value="cancel_session">Hủy buổi học (cancel_session)</option>
              <option value="create">Tạo mới dữ liệu (create)</option>
              <option value="update">Cập nhật dữ liệu (update)</option>
              <option value="delete">Xóa dữ liệu (delete)</option>
            </select>
          </div>

          {/* Entity Filter */}
          <div>
            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50/60 font-medium"
            >
              <option value="ALL">Tất cả đối tượng</option>
              <option value="tuition_period">Bảng học phí kỳ (tuition_period)</option>
              <option value="tuition_calculation">Tính toán học phí</option>
              <option value="bank_transaction">Giao dịch ngân hàng</option>
              <option value="lesson_session">Buổi học thực tế</option>
              <option value="attendance">Điểm danh</option>
              <option value="student_evaluation">Nhận xét & Điểm số</option>
              <option value="homework">Bài tập về nhà</option>
              <option value="homework_submission">Chấm bài tập</option>
              <option value="student">Hồ sơ học sinh</option>
              <option value="tenant">Không gian Tenant</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50/60 font-medium"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="teacher">Giáo viên (Teacher)</option>
              <option value="parent">Phụ huynh (Parent)</option>
              <option value="student">Học sinh (Student)</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(selectedAction !== 'ALL' || selectedEntityType !== 'ALL' || selectedRole !== 'ALL' || searchTerm !== '') && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
            <span>
              Đang hiển thị <strong>{filteredLogs.length}</strong> / {auditLogs.length} bản ghi
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedAction('ALL');
                setSelectedEntityType('ALL');
                setSelectedRole('ALL');
                setSearchTerm('');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Người thao tác</th>
                <th className="py-3 px-4">Hành động</th>
                <th className="py-3 px-4">Đối tượng</th>
                <th className="py-3 px-4">Mô tả chi tiết</th>
                <th className="py-3 px-4">Thay đổi dữ liệu</th>
                <th className="py-3 px-4 text-center">Xác thực</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShieldCheck className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">
                        Không tìm thấy nhật ký phù hợp với bộ lọc
                      </p>
                      <p className="text-xs text-slate-400">
                        Thử điều chỉnh từ khóa tìm kiếm hoặc chọn "Tất cả hành động".
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setActiveLogDetail(log)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px] font-mono">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.timestamp}</span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="font-bold text-slate-900 text-xs">
                            {log.actorName}
                          </div>
                          {renderRoleBadge(log.actorRole)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Tenant: {log.tenant_id}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderActionBadge(log.action)}
                      </td>

                      {/* Entity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                          {log.entityType}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[120px]">
                          {log.entityId}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 text-slate-800 font-semibold max-w-sm">
                        <p className="leading-snug">{log.description}</p>
                      </td>

                      {/* Data Diff */}
                      <td className="py-3.5 px-4">
                        {log.oldValue || log.newValue ? (
                          <div className="text-[11px] space-y-1">
                            {log.oldValue && (
                              <div className="text-red-700 bg-red-50/70 px-2 py-0.5 rounded-md font-mono line-through text-[10px]">
                                {log.oldValue}
                              </div>
                            )}
                            {log.newValue && (
                              <div className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold">
                                {log.newValue}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">Không có diff</span>
                        )}
                      </td>

                      {/* Verification / Detail */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Eye className="w-3 h-3" />
                          <span>Chi tiết</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Nhật ký được bảo vệ chống sửa đổi (Append-Only Audit Log) cho mục đích thanh tra & đối soát kế toán.</span>
          </div>
          <div>
            Tổng số: <strong>{filteredLogs.length}</strong> bản ghi
          </div>
        </div>
      </div>

      {/* Log Detail Modal */}
      {activeLogDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Chi Tiết Bản Ghi Kiểm Toán #{activeLogDetail.id}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Thời gian: {activeLogDetail.timestamp}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveLogDetail(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[11px]">Người thực hiện:</span>
                  <span className="font-bold text-slate-900">{activeLogDetail.actorName}</span>{' '}
                  <span className="text-slate-500 font-mono">({activeLogDetail.actorId})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Vai trò & Quyền:</span>
                  {renderRoleBadge(activeLogDetail.actorRole)}
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Hành động:</span>
                  {renderActionBadge(activeLogDetail.action)}
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Đối tượng tác động:</span>
                  <span className="font-mono font-bold text-blue-700">{activeLogDetail.entityType}</span> • ID: <span className="font-mono">{activeLogDetail.entityId}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội dung thay đổi:</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium leading-relaxed">
                  {activeLogDetail.description}
                </div>
              </div>

              {(activeLogDetail.oldValue || activeLogDetail.newValue) && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">So sánh dữ liệu (Diff):</label>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-red-900">
                      <div className="text-[10px] uppercase font-bold text-red-600 mb-1">Dữ liệu cũ:</div>
                      {activeLogDetail.oldValue || '(Trống)'}
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                      <div className="text-[10px] uppercase font-bold text-emerald-600 mb-1">Dữ liệu mới:</div>
                      {activeLogDetail.newValue || '(Trống)'}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dữ liệu định dạng JSON gốc:</label>
                <pre className="p-3 bg-slate-900 text-slate-200 font-mono text-[10px] rounded-xl overflow-x-auto">
                  {JSON.stringify(activeLogDetail, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveLogDetail(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Đóng chi tiết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
