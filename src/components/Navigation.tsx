import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  HeartPulse,
  Utensils,
  CalendarCheck,
  Users,
  User,
  ShieldCheck,
  Sparkles,
  MapPin,
  Scan,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isCaregiverAuthenticated,
    openVoiceAssistant,
  } = useApp();

  const [showFloatingAssistant, setShowFloatingAssistant] = useState(false);

  // Reset visibility when navigating between tabs
  useEffect(() => {
    setShowFloatingAssistant(false);
  }, [activeTab]);

  // Show floating assistant only when scrolling down past top hero section
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Keep hidden if near the top OR if user has scrolled near the bottom of the page
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const isNearBottom = currentScrollY + clientHeight >= scrollHeight - 90;

      if (currentScrollY <= 80 || isNearBottom) {
        setShowFloatingAssistant(false);
      } else if (currentScrollY > lastScrollY + 5) {
        // User is scrolling down past top section -> show button
        setShowFloatingAssistant(true);
      } else if (currentScrollY < lastScrollY - 15) {
        // User is scrolling up -> hide button
        setShowFloatingAssistant(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', mobileLabel: 'Home', icon: Home },
    { id: 'health', label: 'Health', mobileLabel: 'Health', icon: HeartPulse },
    { id: 'meals', label: 'Meal Plan', mobileLabel: 'Meals', icon: Utensils },
    { id: 'appointments', label: 'Appointments', mobileLabel: 'Appts', icon: CalendarCheck },
    { id: 'places', label: 'Places I Visit', mobileLabel: 'Places', icon: MapPin },
    { id: 'food-scanner', label: 'Food Scanner', mobileLabel: 'Scan', icon: Scan },
    { id: 'people', label: 'Family', mobileLabel: 'Family', icon: Users },
    { id: 'profile', label: 'Profile', mobileLabel: 'Profile', icon: User },
  ];

  const allNavItems = isCaregiverAuthenticated
    ? [
        ...navItems,
        { id: 'caregiver-dashboard', label: 'Caregiver Portal', mobileLabel: 'Caregiver', icon: ShieldCheck },
      ]
    : navItems;

  return (
    <>
      {/* MOBILE FIXED BOTTOM NAVIGATION (< 768px)
          Provides identical easy-reach 1-tap thumb navigation on phones */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg select-none"
      >
        <div className="flex items-center px-1.5 h-16 overflow-x-auto no-scrollbar max-w-5xl mx-auto gap-0.5 sm:gap-1">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center min-w-[48px] sm:min-w-[56px] flex-1 h-full min-h-[48px] py-1 px-0.5 transition-all rounded-xl focus:outline-none active:scale-95 touch-manipulation shrink-0 ${
                  isActive
                    ? 'text-teal-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div
                  className={`p-1.5 rounded-xl transition-colors ${
                    isActive ? 'bg-teal-100 text-teal-800' : 'text-slate-500'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] sm:text-xs mt-0.5 leading-none tracking-tight whitespace-nowrap ${isActive ? 'font-bold' : ''}`}>
                  {item.mobileLabel || item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* TABLET & DESKTOP SUB-HEADER / TAB NAVIGATION BAR (>= 768px)
          Fits all tabs neatly in one single line without wrapping, truncation, or ellipsis */}
      <nav
        aria-label="Tablet and Desktop Navigation"
        className="hidden md:block bg-white border-b border-slate-200 px-2 sm:px-3 lg:px-6 shadow-2xs select-none"
      >
        <div className="max-w-5xl mx-auto py-2">
          <div className="w-full flex items-center justify-between gap-1 sm:gap-1.5">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-1 min-w-0 min-h-[40px] px-1 sm:px-1.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all text-center whitespace-nowrap ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  title={item.label}
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="whitespace-nowrap">
                    <span className="hidden xl:inline">{item.label}</span>
                    <span className="xl:hidden">{item.mobileLabel || item.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* FLOATING QUICK GEMINI ASSISTANT FOR TABLET & WEB (Accessible when scrolling down) */}
      <aside
        aria-label="Quick Gemini Assistant Trigger"
        className={`fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 transition-all duration-300 ease-out transform ${
          showFloatingAssistant
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
        }`}
      >
        <button
          type="button"
          onClick={openVoiceAssistant}
          className="group flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-full bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-900 hover:from-teal-800 hover:to-emerald-950 text-white font-bold text-sm sm:text-base shadow-xl shadow-teal-950/25 border-2 border-white/50 active:scale-95 transition-all touch-manipulation"
          aria-label="Open Gemini Voice and Text Assistant"
        >
          <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse shrink-0" />
          <span className="tracking-tight">Gemini Assistant</span>
          <span className="hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-950/40 text-teal-100 border border-teal-500/30">
            Voice & Text
          </span>
        </button>
      </aside>
    </>
  );
};
