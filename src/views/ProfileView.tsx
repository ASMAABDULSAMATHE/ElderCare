import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Phone,
  MapPin,
  HeartPulse,
  Users,
  Settings,
  ShieldCheck,
  Eye,
  Volume2,
  Minimize2,
  Sliders,
  RotateCcw,
  LogOut,
  Info,
  Shield,
  AlertTriangle,
  X,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    profile,
    caregivers,
    accessibility,
    updateAccessibility,
    setActiveTab,
    resetDemoData,
    logout,
    isTemporarySession,
  } = useApp();

  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-36 lg:pb-32 space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Personal Profile & Accessibility
        </h1>
        <p className="text-base text-slate-500 mt-1">
          Review your registered information and adjust text size and screen readability.
        </p>
      </div>

      {/* 1. PERSONAL INFORMATION CARD (VIEW ONLY FOR ELDERLY) */}
      <section aria-labelledby="personal-info-heading" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={profile.avatar}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full object-cover border-3 border-teal-600/30 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 id="personal-info-heading" className="text-2xl font-bold text-slate-900">
                  {profile.name}
                </h2>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                  {profile.age} years old
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                {profile.city || 'Abu Dhabi'}, United Arab Emirates
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block">
              Registered Phone Number
            </span>
            <span className="text-base font-bold font-mono text-slate-800 mt-0.5 block">
              {profile.phone}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block">
              Home Residence Address
            </span>
            <span className="text-base font-semibold text-slate-800 mt-0.5 block">
              {profile.address}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-500">
          🔒 Personal and medical information are protected and can only be altered through Caregiver Mode for safety.
        </div>
      </section>

      {/* 2. MEDICAL OVERVIEW CARD */}
      <section aria-labelledby="medical-overview-heading" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-rose-600" />
          <h2 id="medical-overview-heading" className="text-xl font-bold text-slate-900">
            Medical Profile Glance
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
              Blood Type
            </span>
            <span className="text-2xl font-black font-mono text-rose-600 mt-1 block">
              {profile.bloodType}
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
              Known Allergies
            </span>
            <span className="text-sm font-bold text-slate-800 mt-1 block">
              {profile.allergies.join(', ')}
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
              Conditions
            </span>
            <span className="text-sm font-bold text-slate-800 mt-1 block">
              {profile.conditions.join(', ')}
            </span>
          </div>
        </div>
      </section>

      {/* 3. ACCESSIBILITY SETTINGS (ELDERLY-FRIENDLY CONTROLS) */}
      <section aria-labelledby="accessibility-heading" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center gap-2">
          <Sliders className="w-6 h-6 text-teal-700" />
          <h2 id="accessibility-heading" className="text-xl font-bold text-slate-900">
            Accessibility & Display Settings
          </h2>
        </div>

        {/* Toggles: High Contrast, Voice Guidance, Reduce Motion */}
        <div className="space-y-3.5">
          {/* High Contrast */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <span className="text-sm sm:text-base font-bold text-slate-900 block">High Contrast Mode</span>
              <span className="text-xs text-slate-500 block leading-normal mt-0.5">Sharpen borders and maximize text contrast</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={accessibility.highContrast}
              onClick={() => updateAccessibility({ highContrast: !accessibility.highContrast })}
              className={`w-14 h-8 shrink-0 rounded-full transition-colors relative inline-flex items-center p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 ${
                accessibility.highContrast ? 'bg-teal-700' : 'bg-slate-300'
              }`}
              aria-label="Toggle High Contrast"
            >
              <span
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 block ${
                  accessibility.highContrast ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Voice Guidance */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <span className="text-sm sm:text-base font-bold text-slate-900 block">Voice Guidance & Read Aloud</span>
              <span className="text-xs text-slate-500 block leading-normal mt-0.5">Speaks out reminders and AI answers automatically</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={accessibility.voiceGuidance}
              onClick={() => updateAccessibility({ voiceGuidance: !accessibility.voiceGuidance })}
              className={`w-14 h-8 shrink-0 rounded-full transition-colors relative inline-flex items-center p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 ${
                accessibility.voiceGuidance ? 'bg-teal-700' : 'bg-slate-300'
              }`}
              aria-label="Toggle Voice Guidance"
            >
              <span
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 block ${
                  accessibility.voiceGuidance ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reduce Motion */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <span className="text-sm sm:text-base font-bold text-slate-900 block">Reduce Motion</span>
              <span className="text-xs text-slate-500 block leading-normal mt-0.5">Disable smooth transitions and animations</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={accessibility.reduceMotion}
              onClick={() => updateAccessibility({ reduceMotion: !accessibility.reduceMotion })}
              className={`w-14 h-8 shrink-0 rounded-full transition-colors relative inline-flex items-center p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 ${
                accessibility.reduceMotion ? 'bg-teal-700' : 'bg-slate-300'
              }`}
              aria-label="Toggle Reduce Motion"
            >
              <span
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 block ${
                  accessibility.reduceMotion ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 4. ABOUT ELDERCARE SECTION */}
      <section aria-labelledby="about-heading" className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
            <Info className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 id="about-heading" className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              About ElderCare
            </h2>
            <p className="text-xs text-slate-500">
              Safe & independent senior living
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          ElderCare helps seniors live safely and independently at home with daily medication reminders, 1-tap emergency SOS alerts, and voice assistance.
        </p>
      </section>

      {/* 5. ACCOUNT & SECURITY SECTION */}
      <section aria-labelledby="session-heading" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 id="session-heading" className="text-xl font-bold text-slate-900 leading-tight">
              Account & Security
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active profile session and security controls
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Active User Account
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-900 block mt-0.5">
              {profile.name}
            </span>
            <span className="text-xs text-slate-500 font-mono block mt-0.5">
              {profile.phone} · Abu Dhabi, UAE
            </span>
            {isTemporarySession && (
              <div className="mt-2.5 p-2 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 font-medium">
                ℹ️ <strong>Temporary Data Mode:</strong> This account was created during sign up and is kept in temporary memory.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsSignOutConfirmOpen(true)}
            className="min-h-[48px] px-6 py-2.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-300 text-rose-700 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all active:scale-98 shrink-0 shadow-2xs"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      {/* SIGN OUT CONFIRMATION MODAL */}
      {isSignOutConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative text-center space-y-4">
            <button
              onClick={() => setIsSignOutConfirmOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Sign Out of ElderCare?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                You will be returned to the sign-in screen. You can sign back in anytime.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignOutConfirmOpen(false);
                  logout();
                }}
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xs transition-colors"
              >
                Yes, Sign Out
              </button>
              <button
                type="button"
                onClick={() => setIsSignOutConfirmOpen(false)}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. RESET DEMO DATA HELPER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-400 pt-3 pb-6 border-t border-slate-200/80 gap-3">
        <span>ElderCare v1.0 · Prototype State Saved Locally</span>
        <button
          type="button"
          onClick={resetDemoData}
          className="text-slate-600 hover:text-slate-900 underline font-medium flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </div>
  );
};
