import React, { useState, useEffect } from 'react';
import { TenantSettingsPage } from './TenantSettingsPage';
import { PaymentSettingsPage } from './PaymentSettingsPage';
import { AuditLogPage } from './AuditLogPage';
import { FirestoreDatabasePage } from './FirestoreDatabasePage';
import { Building, ShieldAlert, CreditCard, Database, FileDown, BookOpen } from 'lucide-react';
import { UserGuideModal } from '../common/UserGuideModal';

export type SettingsTabId = 'tenant-settings' | 'payment-settings' | 'audit-logs' | 'firestore-db';

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

  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

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
          onClick={() => handleTabSelect('firestore-db')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentTab === 'firestore-db'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Cơ sở dữ liệu Cloud Firestore</span>
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

        <button
          type="button"
          onClick={() => setShowGuideModal(true)}
          className="ml-auto flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer shadow-xs"
          title="Xem tài liệu hướng dẫn sử dụng, tải file PDF và video hướng dẫn trích xuất sao kê"
        >
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Sổ tay HDSD & Video (.pdf)</span>
        </button>
      </div>

      {/* Render Selected Component */}
      {currentTab === 'tenant-settings' && (
        <TenantSettingsPage onNavigateToPayment={() => handleTabSelect('payment-settings')} />
      )}
      {currentTab === 'payment-settings' && <PaymentSettingsPage />}
      {currentTab === 'firestore-db' && <FirestoreDatabasePage />}
      {currentTab === 'audit-logs' && <AuditLogPage />}

      {/* User Guide Modal */}
      <UserGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
};


