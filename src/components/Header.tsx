import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { CaregiverAuthModal } from './CaregiverAuthModal';
import { ShieldAlert, UserCheck, Lock, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    role,
    activeTab,
    profile,
    caregivers,
    isTemporarySession,
    isCaregiverAuthenticated,
    unlockCaregiverMode,
    exitCaregiverMode,
    setActiveTab,
    startCall,
    logout,
  } = useApp();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleRoleToggle = () => {
    if (isCaregiverAuthenticated) {
      exitCaregiverMode();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs px-3 sm:px-6 transition-all pt-[env(safe-area-inset-top)] w-full">
        <div className="max-w-5xl mx-auto h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 w-full min-w-0">
          {/* Zone 1: Brand Wordmark & Logo */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-xl shrink-0 group py-1"
            aria-label="ElderCare Home"
          >
            <Logo size="md" showSubtitle={false} />
            {isCaregiverAuthenticated && (
              <span className="ml-1.5 sm:ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider md:hidden inline-flex items-center shrink-0">
                Caregiver
              </span>
            )}
          </button>

          {/* Zone 2: Role & Session Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 font-medium">
            {isCaregiverAuthenticated ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold">
                <UserCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Caregiver: {caregivers.find((c) => c.isPrimary)?.name || 'Caregiver'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/90 text-slate-700 border border-slate-200/80 rounded-lg text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span>User: {profile.name}</span>
              </span>
            )}
            {isTemporarySession && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg text-xs font-medium" title="Temporary session data is deleted on browser refresh">
                <span>Temporary Session</span>
              </span>
            )}
          </div>

          {/* Zone 3: Navigation & Primary Actions (SOS Emergency + Caregiver Mode Switch + Sign Out) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* SOS Emergency Button */}
            <button
              type="button"
              onClick={() => setActiveTab('emergency')}
              className="h-8.5 sm:h-10 px-2 sm:px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1 sm:gap-1.5 transition-transform active:scale-[0.98] shadow-xs shadow-rose-600/30 whitespace-nowrap shrink-0 select-none"
              aria-label="Emergency SOS screen"
            >
              <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-pulse shrink-0" />
              <span>SOS</span>
            </button>

            {/* Caregiver Mode Toggle Button (Sole Authorized Entry Point for Caregiver Mode) */}
            {isCaregiverAuthenticated ? (
              <button
                type="button"
                onClick={handleRoleToggle}
                className="h-8.5 sm:h-10 px-2 sm:px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-1 sm:gap-1.5 transition-colors whitespace-nowrap shrink-0 select-none"
                title="Exit Caregiver Mode to Elderly User View"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 shrink-0" />
                <span className="hidden sm:inline">Exit Caregiver</span>
                <span className="sm:hidden">Exit</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRoleToggle}
                className="h-8.5 sm:h-10 px-2 sm:px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-1 sm:gap-1.5 transition-colors whitespace-nowrap shrink-0 select-none"
                title="Open Caregiver Mode (Requires PIN)"
              >
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-700 shrink-0" />
                <span className="hidden sm:inline">Caregiver Mode</span>
                <span className="sm:hidden">Caregiver</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Caregiver PIN / Biometric Modal */}
      <CaregiverAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          unlockCaregiverMode();
          setActiveTab('caregiver-dashboard');
        }}
      />
    </>
  );
};
