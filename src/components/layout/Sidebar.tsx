import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Clock,
  CheckSquare,
  FileText,
  Award,
  BookMarked,
  CreditCard,
  FileSpreadsheet,
  CheckCheck,
  History,
  BarChart3,
  Settings,
  ShieldAlert,
  Building2,
  Layers,
  Sparkles,
  KeyRound,
} from 'lucide-react';

export type NavTabId =
  | 'dashboard'
  | 'classes'
  | 'students'
  | 'accounts'
  | 'schools'
  | 'subjects'
  | 'schedules'
  | 'sessions'
  | 'attendance'
  | 'lessons'
  | 'evaluations'
  | 'homework'
  | 'tuition'
  | 'bank-statements'
  | 'reconciliation'
  | 'tuition-history'
  | 'reports'
  | 'learning-history'
  | 'tenant-settings'
  | 'payment-settings'
  | 'audit-logs';

interface SidebarProps {
  activeTab?: NavTabId;
  currentTab?: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, currentTab, onSelectTab }) => {
  const selectedTab = activeTab || currentTab || 'dashboard';
  const { currentRole, currentUser } = useApp();

  const effectiveRole = currentUser?.role || currentRole;

  const teacherNavGroups = [
    {
      group: 'TỔNG QUAN',
      items: [
        { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard, badge: 'KPI' },
      ],
    },
    {
      group: 'QUẢN LÝ ĐÀO TẠO',
      items: [
        { id: 'classes', label: 'Lớp học', icon: Layers },
        { id: 'students', label: 'Học sinh & Phụ huynh', icon: Users },
        { id: 'accounts', label: 'Cấp tài khoản & PH', icon: KeyRound, highlight: true },
        { id: 'schools', label: 'Trường học', icon: Building2 },
        { id: 'subjects', label: 'Môn học', icon: BookOpen },
      ],
    },
    {
      group: 'LỊCH & BUỔI HỌC',
      items: [
        { id: 'schedules', label: 'Lịch học cố định', icon: Calendar },
        { id: 'sessions', label: 'Buổi học thực tế', icon: Clock, badge: 'Đổi lịch' },
        { id: 'attendance', label: 'Điểm danh', icon: CheckSquare },
      ],
    },
    {
      group: 'DẠY HỌC & BÀI TẬP',
      items: [
        { id: 'lessons', label: 'Bài học', icon: FileText },
        { id: 'evaluations', label: 'Nhận xét & Điểm số', icon: Award },
        { id: 'homework', label: 'Bài tập về nhà', icon: BookMarked },
      ],
    },
    {
      group: 'HỌC PHÍ & TÀI CHÍNH',
      items: [
        { id: 'tuition', label: 'Quản lý học phí & VietQR', icon: CreditCard, highlight: true },
        { id: 'reconciliation', label: 'Sao kê & Đối soát tự động', icon: CheckCheck, highlight: true },
      ],
    },
    {
      group: 'BÁO CÁO & THỐNG KÊ',
      items: [
        { id: 'reports', label: 'Báo cáo doanh thu & điểm', icon: BarChart3 },
        { id: 'learning-history', label: 'Lịch sử học tập', icon: Award },
      ],
    },
    {
      group: 'HỆ THỐNG & CÀI ĐẶT',
      items: [
        { id: 'tenant-settings', label: 'Hồ sơ Tenant & Giáo viên', icon: Building2, highlight: true },
        { id: 'payment-settings', label: 'Tài khoản nhận tiền (VietQR)', icon: CreditCard },
        { id: 'audit-logs', label: 'Nhật ký Audit Log', icon: ShieldAlert },
      ],
    },
  ];

  const parentNavGroups = [
    {
      group: 'DÀNH CHO PHỤ HUYNH',
      items: [
        { id: 'dashboard', label: 'Tổng quan học tập', icon: LayoutDashboard },
        { id: 'sessions', label: 'Lịch học & Điểm danh', icon: Clock },
        { id: 'tuition', label: 'Học phí & Quét mã VietQR', icon: CreditCard, highlight: true },
      ],
    },
  ];

  const studentNavGroups = [
    {
      group: 'DÀNH CHO HỌC SINH',
      items: [
        { id: 'dashboard', label: 'Góc học tập & Nộp bài', icon: LayoutDashboard },
        { id: 'evaluations', label: 'Lời phê & Điểm số', icon: Award },
        { id: 'tuition', label: 'Xem học phí & VietQR', icon: CreditCard, highlight: true },
      ],
    },
  ];

  const navGroups =
    effectiveRole === 'parent'
      ? parentNavGroups
      : effectiveRole === 'student'
      ? studentNavGroups
      : teacherNavGroups;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] select-none border-r border-slate-800">
      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx}>
            <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase px-3 mb-2">
              {group.group}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = selectedTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id as NavTabId)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-semibold'
                        : item.highlight
                        ? 'text-blue-300 hover:bg-slate-800/80 hover:text-white bg-blue-950/30'
                        : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                          isActive
                            ? 'bg-blue-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.highlight && !item.badge && !isActive && (
                      <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Role Indicator Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-blue-400 border border-slate-700">
            {effectiveRole === 'parent' ? 'PH' : effectiveRole === 'student' ? 'HS' : 'GV'}
          </div>
          <div className="text-xs">
            <div className="font-semibold text-slate-200">
              {effectiveRole === 'parent'
                ? 'Quyền: Phụ Huynh'
                : effectiveRole === 'student'
                ? 'Quyền: Học Sinh'
                : 'Quyền: Giáo Viên (Tenant)'}
            </div>
            <div className="text-[11px] text-slate-500">Bảo mật dữ liệu RLS</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
