import React, { useState, useEffect } from 'react';
import { TenantSettingsPage } from './TenantSettingsPage';
import { PaymentSettingsPage } from './PaymentSettingsPage';
import { AuditLogPage } from './AuditLogPage';
import { Building, ShieldAlert, CreditCard } from 'lucide-react';

export type SettingsTabId = 'tenant-settings' | 'payment-settings' | 'audit-logs';

interface SettingsPageProps {
  initialTab?: SettingsTabId;
  activeTab?: SettingsTabId;
  onTabChange?: (tab: SettingsTabId) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  initialTab = 'tenant-settings',
  activeTab: controlledTab,
  onTabChange,
}) => {
  const [currentTab, setCurrentTab] = useState<SettingsTabId>(controlledTab || initialTab);

  // Sync state whenever prop changes
  useEffect(() => {
    if (controlledTab) {
      setCurrentTab(controlledTab);
    } else if (initialTab) {
      setCurrentTab(initialTab);
    }
  }, [controlledTab, initialTab]);

  const handleTabSelect = (tab: SettingsTabId) => {
    setCurrentTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="space-y-6">
      {/* Top Tab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => handleTabSelect('tenant-settings')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentTab === 'tenant-settings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Hồ sơ Tenant & Giáo viên</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect('payment-settings')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentTab === 'payment-settings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Tài khoản nhận tiền (VietQR)</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSelect('audit-logs')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentTab === 'audit-logs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Nhật ký Audit Log</span>
        </button>
      </div>

      {/* Render Selected Component */}
      {currentTab === 'tenant-settings' && (
        <TenantSettingsPage onNavigateToPayment={() => handleTabSelect('payment-settings')} />
      )}
      {currentTab === 'payment-settings' && <PaymentSettingsPage />}
      {currentTab === 'audit-logs' && <AuditLogPage />}
    </div>
  );
};


