import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutGrid,
  Layers,
  Users,
  Key,
  School,
  BookOpen,
  Calendar,
  Clock,
  CheckSquare,
  FileText,
  User,
  Backpack,
  CreditCard,
  PieChart,
  BarChart2,
  Bookmark,
  Building2,
  ShieldCheck,
  Sparkles,
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

interface NavItem {
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  badge?: string;
  highlight?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, currentTab, onSelectTab }) => {
  const selectedTab = activeTab || currentTab || 'dashboard';
  const { currentRole, currentUser } = useApp();

  const effectiveRole = currentUser?.role || currentRole;

  const teacherNavGroups: NavGroup[] = [
    {
      group: 'TỔNG QUAN',
      items: [
        {
          id: 'dashboard',
          label: 'Bảng điều khiển',
          icon: LayoutGrid,
          iconBg: 'bg-blue-100 text-blue-600',
          badge: 'KPI',
        },
      ],
    },
    {
      group: 'QUẢN LÝ ĐÀO TẠO',
      items: [
        {
          id: 'classes',
          label: 'Lớp học',
          icon: Layers,
          iconBg: 'bg-sky-100 text-sky-600',
        },
        {
          id: 'students',
          label: 'Học sinh & Phụ huynh',
          icon: Users,
          iconBg: 'bg-emerald-100 text-emerald-600',
        },
        {
          id: 'accounts',
          label: 'Cấp tài khoản & PH',
          icon: Key,
          iconBg: 'bg-amber-100 text-amber-600',
          highlight: true,
        },
        {
          id: 'schools',
          label: 'Trường học',
          icon: School,
          iconBg: 'bg-purple-100 text-purple-600',
        },
        {
          id: 'subjects',
          label: 'Môn học',
          icon: BookOpen,
          iconBg: 'bg-rose-100 text-rose-500',
        },
      ],
    },
    {
      group: 'LỊCH & BUỔI HỌC',
      items: [
        {
          id: 'schedules',
          label: 'Lịch học cố định',
          icon: Calendar,
          iconBg: 'bg-blue-100 text-blue-600',
        },
        {
          id: 'sessions',
          label: 'Buổi học thực tế',
          icon: Clock,
          iconBg: 'bg-emerald-100 text-emerald-600',
          badge: 'Đổi lịch',
        },
        {
          id: 'attendance',
          label: 'Điểm danh',
          icon: CheckSquare,
          iconBg: 'bg-orange-100 text-orange-600',
        },
      ],
    },
    {
      group: 'DẠY HỌC & BÀI TẬP',
      items: [
        {
          id: 'lessons',
          label: 'Bài học',
          icon: FileText,
          iconBg: 'bg-purple-100 text-purple-600',
        },
        {
          id: 'evaluations',
          label: 'Nhận xét & Điểm số',
          icon: User,
          iconBg: 'bg-rose-100 text-rose-500',
        },
        {
          id: 'homework',
          label: 'Bài tập về nhà',
          icon: Backpack,
          iconBg: 'bg-sky-100 text-sky-600',
        },
      ],
    },
    {
      group: 'HỌC PHÍ & TÀI CHÍNH',
      items: [
        {
          id: 'tuition',
          label: 'Quản lý học phí & VietQR',
          icon: CreditCard,
          iconBg: 'bg-emerald-100 text-emerald-600',
          highlight: true,
        },
        {
          id: 'reconciliation',
          label: 'Sao kê & Đối soát tự động',
          icon: PieChart,
          iconBg: 'bg-purple-100 text-purple-600',
          highlight: true,
        },
      ],
    },
    {
      group: 'BÁO CÁO & THỐNG KÊ',
      items: [
        {
          id: 'reports',
          label: 'Báo cáo doanh thu & điểm',
          icon: BarChart2,
          iconBg: 'bg-orange-100 text-orange-500',
        },
        {
          id: 'learning-history',
          label: 'Lịch sử học tập',
          icon: Bookmark,
          iconBg: 'bg-rose-100 text-rose-500',
        },
      ],
    },
    {
      group: 'HỆ THỐNG & CÀI ĐẶT',
      items: [
        {
          id: 'tenant-settings',
          label: 'Hồ sơ Tenant & Giáo viên',
          icon: Building2,
          iconBg: 'bg-blue-100 text-blue-600',
          highlight: true,
        },
        {
          id: 'payment-settings',
          label: 'Tài khoản nhận tiền (VietQR)',
          icon: CreditCard,
          iconBg: 'bg-slate-100 text-slate-500',
        },
        {
          id: 'audit-logs',
          label: 'Nhật ký Audit Log',
          icon: ShieldCheck,
          iconBg: 'bg-emerald-100 text-emerald-600',
        },
      ],
    },
  ];

  const parentNavGroups: NavGroup[] = [
    {
      group: 'DÀNH CHO PHỤ HUYNH',
      items: [
        {
          id: 'dashboard',
          label: 'Tổng quan học tập',
          icon: LayoutGrid,
          iconBg: 'bg-blue-100 text-blue-600',
        },
        {
          id: 'sessions',
          label: 'Lịch học & Điểm danh',
          icon: Clock,
          iconBg: 'bg-emerald-100 text-emerald-600',
        },
        {
          id: 'tuition',
          label: 'Học phí & Quét mã VietQR',
          icon: CreditCard,
          iconBg: 'bg-emerald-100 text-emerald-600',
          highlight: true,
        },
      ],
    },
  ];

  const studentNavGroups: NavGroup[] = [
    {
      group: 'DÀNH CHO HỌC SINH',
      items: [
        {
          id: 'dashboard',
          label: 'Góc học tập & Nộp bài',
          icon: LayoutGrid,
          iconBg: 'bg-blue-100 text-blue-600',
        },
        {
          id: 'evaluations',
          label: 'Nhận xét & Điểm số',
          icon: User,
          iconBg: 'bg-rose-100 text-rose-500',
        },
        {
          id: 'tuition',
          label: 'Xem học phí & VietQR',
          icon: CreditCard,
          iconBg: 'bg-emerald-100 text-emerald-600',
          highlight: true,
        },
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
    <aside className="w-68 sm:w-72 bg-white flex flex-col shrink-0 min-h-[calc(100vh-4rem)] select-none border-r border-slate-200/80 shadow-xs">
      <div className="p-3.5 flex-1 overflow-y-auto space-y-4">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase px-2.5 pt-1.5 pb-1">
              {group.group}
            </div>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = selectedTab === item.id;
                const isSpecial = item.highlight || isActive;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-2xl text-[13px] transition-all cursor-pointer text-left ${
                      isSpecial
                        ? 'bg-[#e6f0fe] text-blue-600 font-bold'
                        : 'text-slate-800 font-semibold hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {/* Colorful rounded square icon container */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <span className="truncate">{item.label}</span>
                    </div>

                    {/* Right action/badge */}
                    <div className="flex items-center space-x-1.5 shrink-0 pl-1">
                      {item.badge === 'KPI' && (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#d2e3fc] text-blue-700">
                          KPI
                        </span>
                      )}

                      {item.badge === 'Đổi lịch' && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#e0effe] text-blue-600">
                          Đổi lịch
                        </span>
                      )}

                      {item.highlight && (
                        <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Role Indicator Footer */}
      <div className="p-3.5 border-t border-slate-100 bg-white">
        <div className="flex items-center space-x-3 px-1">
          <div className="w-9 h-9 rounded-full bg-[#0062ff] flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0">
            {effectiveRole === 'parent' ? 'PH' : effectiveRole === 'student' ? 'HS' : 'GV'}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-slate-900 truncate leading-tight">
              {effectiveRole === 'parent'
                ? 'Quyền: Phụ Huynh'
                : effectiveRole === 'student'
                ? 'Quyền: Học Sinh'
                : 'Quyền: Giáo viên (Tenant)'}
            </div>
            <div className="text-[11px] text-slate-500 font-normal mt-0.5">
              Bảo mật dữ liệu RLS
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
