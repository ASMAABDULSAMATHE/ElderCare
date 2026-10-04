/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { CallModal } from './components/CallModal';
import { FingerprintModal } from './components/FingerprintModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { LoginView } from './views/LoginView';
import { HomeView } from './views/HomeView';
import { HealthView } from './views/HealthView';
import { MealPlanView } from './views/MealPlanView';
import { AppointmentsView } from './views/AppointmentsView';
import { PlansView } from './views/PlansView';
import { PeopleView } from './views/PeopleView';
import { ProfileView } from './views/ProfileView';
import { EmergencyView } from './views/EmergencyView';
import { AiHelpView } from './views/AiHelpView';
import { PlacesView } from './views/PlacesView';
import { FoodScannerView } from './views/FoodScannerView';
import { CaregiverDashboardView } from './views/CaregiverDashboardView';

const AppContent: React.FC = () => {
  const { isAuthenticated, activeTab } = useApp();

  // Reset scroll to top whenever navigating to a different tab/screen
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [activeTab]);

  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        <FingerprintModal />
      </>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'health':
        return <HealthView />;
      case 'meals':
        return <MealPlanView />;
      case 'appointments':
      case 'plans':
        return <AppointmentsView />;
      case 'places':
        return <PlacesView />;
      case 'food-scanner':
        return <FoodScannerView />;
      case 'people':
        return <PeopleView />;
      case 'profile':
        return <ProfileView />;
      case 'emergency':
        return <EmergencyView />;
      case 'ai-help':
        return <AiHelpView />;
      case 'caregiver-dashboard':
        return <CaregiverDashboardView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] w-full max-w-full">
      {/* Unified Sticky Top Header & Navigation Container */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        <Header />
        <Navigation />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full" id="main-content">
        {renderActiveView()}
      </main>

      {/* Global Interactive Modals */}
      <CallModal />
      <FingerprintModal />
      <VoiceAssistantModal />
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
