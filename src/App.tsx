import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/AppLayout';
import { OnboardingModal } from './components/OnboardingModal';
import { BodyAssessmentModal } from './components/BodyAssessmentModal';
import { DailyEntryModal } from './components/DailyEntryModal';
import { CompareAssessmentsModal } from './components/CompareAssessmentsModal';
import { DashboardView } from './views/DashboardView';
import { DailyJournalView } from './views/DailyJournalView';
import { BodyAssessmentsView } from './views/BodyAssessmentsView';
import { HistoryCalendarView } from './views/HistoryCalendarView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { BodyAssessment } from './types';
import { getTodayDateString } from './utils/formatters';

const AppContent: React.FC = () => {
  const { profile, assessments, isLoading } = useApp();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Modals state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [assessmentToEdit, setAssessmentToEdit] = useState<BodyAssessment | null>(null);

  const [dailyModalOpen, setDailyModalOpen] = useState(false);
  const [dailyDateToEdit, setDailyDateToEdit] = useState<string>(getTodayDateString());

  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Check onboarding on initial load
  useEffect(() => {
    if (!isLoading && !profile) {
      setShowOnboarding(true);
    }
  }, [isLoading, profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF8FB] dark:bg-[#140F15] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F2BFD3] to-[#C86D93] animate-pulse flex items-center justify-center text-white text-xl shadow-md mb-3">
          🌸
        </div>
        <span className="text-xs font-semibold text-[#817782] dark:text-[#A69AA8]">
          A carregar My Progress...
        </span>
      </div>
    );
  }

  const handleOpenAssessmentModal = (assessment?: BodyAssessment) => {
    setAssessmentToEdit(assessment || null);
    setAssessmentModalOpen(true);
  };

  const handleOpenDailyModal = (date?: string) => {
    setDailyDateToEdit(date || getTodayDateString());
    setDailyModalOpen(true);
  };

  return (
    <AppLayout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      onOpenAssessmentModal={() => handleOpenAssessmentModal()}
      onOpenDailyModal={() => handleOpenDailyModal()}
    >
      {currentTab === 'dashboard' && (
        <DashboardView
          onOpenAssessmentModal={() => handleOpenAssessmentModal()}
          onOpenDailyModal={() => handleOpenDailyModal()}
          onNavigateToTab={setCurrentTab}
        />
      )}

      {currentTab === 'journal' && (
        <DailyJournalView
          onOpenDailyModalWithDate={(date) => handleOpenDailyModal(date)}
        />
      )}

      {currentTab === 'assessments' && (
        <BodyAssessmentsView
          onOpenAssessmentModal={handleOpenAssessmentModal}
          onOpenCompareModal={() => setCompareModalOpen(true)}
        />
      )}

      {currentTab === 'history' && (
        <HistoryCalendarView
          onOpenAssessmentModal={handleOpenAssessmentModal}
          onOpenDailyModalWithDate={(date) => handleOpenDailyModal(date)}
        />
      )}

      {currentTab === 'reports' && <ReportsView />}

      {currentTab === 'settings' && <SettingsView />}

      {/* MODALS */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      <BodyAssessmentModal
        isOpen={assessmentModalOpen}
        onClose={() => {
          setAssessmentModalOpen(false);
          setAssessmentToEdit(null);
        }}
        assessmentToEdit={assessmentToEdit}
      />

      <DailyEntryModal
        isOpen={dailyModalOpen}
        onClose={() => setDailyModalOpen(false)}
        dateToEdit={dailyDateToEdit}
      />

      <CompareAssessmentsModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        assessments={assessments}
      />
    </AppLayout>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
