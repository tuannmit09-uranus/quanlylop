import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTabId } from './components/layout/Sidebar';

// Pages & Components
import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { ParentDashboard } from './components/dashboard/ParentDashboard';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { SchoolManager } from './components/schools/SchoolManager';
import { SubjectManager } from './components/subjects/SubjectManager';
import { ClassManager } from './components/classes/ClassManager';
import { StudentManager } from './components/students/StudentManager';
import { ScheduleManager } from './components/schedules/ScheduleManager';
import { SessionManager } from './components/sessions/SessionManager';
import { AttendanceManager } from './components/attendance/AttendanceManager';
import { ParentAttendanceView } from './components/attendance/ParentAttendanceView';
import { LessonManager } from './components/lessons/LessonManager';
import { EvaluationManager } from './components/evaluations/EvaluationManager';
import { StudentEvaluationsView } from './components/evaluations/StudentEvaluationsView';
import { HomeworkManager } from './components/homework/HomeworkManager';
import { TuitionPage } from './components/tuition/TuitionPage';
import { StudentTuitionView } from './components/tuition/StudentTuitionView';
import { ReconciliationPage } from './components/reconciliation/ReconciliationPage';
import { SettingsPage, SettingsTabId } from './components/settings/SettingsPage';
import { TenantSettingsPage } from './components/settings/TenantSettingsPage';
import { PaymentSettingsPage } from './components/settings/PaymentSettingsPage';
import { AuditLogPage } from './components/settings/AuditLogPage';
import { VietQRModal } from './components/tuition/VietQRModal';
import { LoginPage } from './components/auth/LoginPage';
import { AccountManagement } from './components/accounts/AccountManagement';
import { AccountActivationModal } from './components/accounts/AccountActivationModal';

const AppContent: React.FC = () => {
  const { currentRole, currentTenant, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');
  const [globalQRItem, setGlobalQRItem] = useState<any | null>(null);
  const [activateToken, setActivateToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('activate_token') || null;
    }
    return null;
  });
  const [sessionFilterParams, setSessionFilterParams] = useState<{
    month?: number | string;
    year?: number | string;
    classId?: string;
    sessionType?: string;
  } | null>(null);
  const [tuitionFilterParams, setTuitionFilterParams] = useState<{
    month?: number;
    year?: number;
    schoolCode?: string;
    status?: string;
  } | null>(null);
  const [reconciliationFilterParams, setReconciliationFilterParams] = useState<{
    month?: number;
    year?: number;
  } | null>(null);
  const [evaluationFilterParams, setEvaluationFilterParams] = useState<{
    classId?: string;
    lessonId?: string;
  } | null>(null);

  // If user is not logged in, render the standalone Login & Register page
  if (!currentUser) {
    return (
      <>
        <LoginPage onOpenActivationModal={(token) => setActivateToken(token)} />
        {activateToken && (
          <AccountActivationModal
            token={activateToken}
            onClose={() => {
              setActivateToken(null);
              if (typeof window !== 'undefined' && window.history.replaceState) {
                const url = new URL(window.location.href);
                url.searchParams.delete('activate_token');
                window.history.replaceState({}, document.title, url.pathname);
              }
            }}
            onActivated={() => {
              setActivateToken(null);
              if (typeof window !== 'undefined' && window.history.replaceState) {
                const url = new URL(window.location.href);
                url.searchParams.delete('activate_token');
                window.history.replaceState({}, document.title, url.pathname);
              }
            }}
          />
        )}
      </>
    );
  }

  const handleNavigate = (tab: NavTabId | string, params?: any) => {
    if (tab === 'sessions' && params) {
      setSessionFilterParams(params);
    }
    if ((tab === 'tuition' || tab === 'tuition-history') && params) {
      setTuitionFilterParams(params);
    }
    if ((tab === 'reconciliation' || tab === 'bank-statements') && params) {
      setReconciliationFilterParams(params);
    }
    if (tab === 'evaluations' && params) {
      setEvaluationFilterParams(params);
    }
    setActiveTab(tab as NavTabId);
  };

  const renderContent = () => {
    // 1. Dashboard based on user role
    if (activeTab === 'dashboard') {
      if (currentRole === 'parent') {
        return <ParentDashboard />;
      }
      if (currentRole === 'student') {
        return <StudentDashboard />;
      }
      return (
        <TeacherDashboard
          onNavigate={(tab, params) => handleNavigate(tab, params)}
          onOpenQR={(tui) => setGlobalQRItem(tui)}
        />
      );
    }

    // 2. Master data management
    if (activeTab === 'schools') return <SchoolManager />;
    if (activeTab === 'subjects') return <SubjectManager />;
    if (activeTab === 'classes') return <ClassManager />;
    if (activeTab === 'students') return <StudentManager />;
    if (activeTab === 'accounts') return <AccountManagement />;

    // 3. Scheduling, sessions & attendance
    if (activeTab === 'schedules') {
      if (
        currentRole === 'parent' ||
        currentUser?.role === 'parent' ||
        currentRole === 'student' ||
        currentUser?.role === 'student'
      ) {
        return <ParentAttendanceView />;
      }
      return <ScheduleManager onNavigate={handleNavigate} />;
    }
    if (activeTab === 'sessions') {
      if (
        currentRole === 'parent' ||
        currentUser?.role === 'parent' ||
        currentRole === 'student' ||
        currentUser?.role === 'student'
      ) {
        return <ParentAttendanceView />;
      }
      return <SessionManager initialFilter={sessionFilterParams} />;
    }
    if (activeTab === 'attendance') {
      if (
        currentRole === 'parent' ||
        currentUser?.role === 'parent' ||
        currentRole === 'student' ||
        currentUser?.role === 'student'
      ) {
        return <ParentAttendanceView />;
      }
      return <AttendanceManager />;
    }

    // 4. Lessons, teaching, evaluations & homework
    if (activeTab === 'lessons') {
      if (currentRole === 'student' || currentUser?.role === 'student') {
        return <StudentDashboard />;
      }
      return (
        <LessonManager
          onNavigateToEvaluations={(lessonId, classId) =>
            handleNavigate('evaluations', { lessonId, classId })
          }
        />
      );
    }
    if (activeTab === 'evaluations') {
      if (
        currentRole === 'student' ||
        currentUser?.role === 'student' ||
        currentRole === 'parent' ||
        currentUser?.role === 'parent'
      ) {
        return <StudentEvaluationsView />;
      }
      return (
        <EvaluationManager
          initialClassId={evaluationFilterParams?.classId}
          initialLessonId={evaluationFilterParams?.lessonId}
        />
      );
    }
    if (activeTab === 'homework') {
      if (currentRole === 'student' || currentUser?.role === 'student') {
        return <StudentDashboard />;
      }
      if (currentRole === 'parent' || currentUser?.role === 'parent') {
        return <ParentDashboard />;
      }
      return <HomeworkManager />;
    }

    // 5. Tuition, Bank Reconciliation & History
    if (activeTab === 'tuition' || activeTab === 'tuition-history') {
      if (
        currentRole === 'student' ||
        currentUser?.role === 'student' ||
        currentRole === 'parent' ||
        currentUser?.role === 'parent'
      ) {
        return <StudentTuitionView />;
      }
      return (
        <TuitionPage
          key={`tuition-${tuitionFilterParams?.month || 'default'}-${tuitionFilterParams?.year || 'default'}`}
          initialMonth={tuitionFilterParams?.month}
          initialYear={tuitionFilterParams?.year}
          initialSchool={tuitionFilterParams?.schoolCode}
          initialStatus={tuitionFilterParams?.status}
        />
      );
    }
    if (activeTab === 'bank-statements' || activeTab === 'reconciliation') {
      return (
        <ReconciliationPage
          key={`recon-${reconciliationFilterParams?.month || 'default'}-${reconciliationFilterParams?.year || 'default'}`}
          initialMonth={reconciliationFilterParams?.month}
          initialYear={reconciliationFilterParams?.year}
        />
      );
    }

    // 6. Reports & Learning History
    if (activeTab === 'reports') {
      return (
        <TeacherDashboard
          onNavigate={(tab) => handleNavigate(tab)}
          onOpenQR={(tui) => setGlobalQRItem(tui)}
        />
      );
    }
    if (activeTab === 'learning-history') {
      if (currentRole === 'parent') return <ParentDashboard />;
      if (currentRole === 'student') return <StudentDashboard />;
      return <LessonManager />;
    }

    // 7. System & Settings
    if (
      activeTab === 'tenant-settings' ||
      activeTab === 'payment-settings' ||
      activeTab === 'audit-logs' ||
      activeTab === 'settings'
    ) {
      const targetSettingsTab: SettingsTabId =
        activeTab === 'payment-settings'
          ? 'payment-settings'
          : activeTab === 'audit-logs'
          ? 'audit-logs'
          : 'tenant-settings';

      return (
        <SettingsPage
          key={targetSettingsTab}
          activeTab={targetSettingsTab}
          initialTab={targetSettingsTab}
          onTabChange={(tab) => handleNavigate(tab)}
        />
      );
    }

    return (
      <TeacherDashboard
        onNavigate={(tab) => handleNavigate(tab)}
        onOpenQR={(tui) => setGlobalQRItem(tui)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navbar with Multi-tenant & Role selector */}
      <Navbar onNavigate={(tab) => handleNavigate(tab)} />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={(tab) => handleNavigate(tab)} />

        {/* Dynamic Main Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>

      {/* Global VietQR modal if opened from anywhere */}
      {globalQRItem && (
        <VietQRModal tuition={globalQRItem} onClose={() => setGlobalQRItem(null)} />
      )}

      {/* Account Activation Modal if URL has token */}
      {activateToken && (
        <AccountActivationModal
          token={activateToken}
          onClose={() => {
            setActivateToken(null);
            if (typeof window !== 'undefined' && window.history.replaceState) {
              const url = new URL(window.location.href);
              url.searchParams.delete('activate_token');
              window.history.replaceState({}, document.title, url.pathname);
            }
          }}
          onActivated={() => {
            setActivateToken(null);
            if (typeof window !== 'undefined' && window.history.replaceState) {
              const url = new URL(window.location.href);
              url.searchParams.delete('activate_token');
              window.history.replaceState({}, document.title, url.pathname);
            }
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
