import React from 'react';
import { NavTabId } from './Sidebar';
import {
  LayoutGrid,
  Users,
  CheckSquare,
  CreditCard,
  Menu,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  onOpenMore: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenMore,
}) => {
  // Exactly 5 items for Teacher Portal as strictly required:
  // 1. Tổng quan (dashboard)
  // 2. Học sinh (students)
  // 3. Điểm danh (attendance)
  // 4. Học phí (tuition)
  // 5. Khác (opens Drawer / Full Menu)

  const items = [
    {
      id: 'dashboard' as NavTabId,
      label: 'Tổng quan',
      icon: LayoutGrid,
    },
    {
      id: 'students' as NavTabId,
      label: 'Học sinh',
      icon: Users,
    },
    {
      id: 'attendance' as NavTabId,
      label: 'Điểm danh',
      icon: CheckSquare,
    },
    {
      id: 'tuition' as NavTabId,
      label: 'Học phí',
      icon: CreditCard,
    },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Thanh điều hướng di động"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg lg:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] py-1 px-1 transition-colors cursor-pointer select-none ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`relative p-1 rounded-xl transition-all ${
                  isActive ? 'bg-blue-50 text-blue-600 scale-105' : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] leading-tight mt-0.5 truncate w-full text-center">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* 5th item: Khác (Open drawer) */}
        <button
          type="button"
          onClick={onOpenMore}
          className="flex flex-col items-center justify-center min-h-[44px] py-1 px-1 text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer select-none"
        >
          <div className="relative p-1 rounded-xl text-slate-500 hover:bg-slate-100 transition-all">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[11px] leading-tight mt-0.5 truncate w-full text-center">
            Khác
          </span>
        </button>
      </div>
    </nav>
  );
};
