import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrentDate } from '../utils/dateUtils';
import {
  Pill,
  Utensils,
  Droplet,
  Activity,
  Calendar,
  Heart,
  Phone,
  ShieldAlert,
  Mic,
  Sparkles,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Bell,
  MessageSquare,
  Scan,
  Lock,
  Users,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    isCaregiverAuthenticated,
    profile,
    medications,
    meals,
    waterCount,
    waterGoal,
    workouts,
    appointments,
    savedPlaces,
    caregivers,
    lovedOnes,
    wellbeing,
    setWellbeing,
    markMedicationTaken,
    addWater,
    completeWorkout,
    startCall,
    openVoiceAssistant,
    setActiveTab,
  } = useApp();

  const [showWellbeingSupport, setShowWellbeingSupport] = useState(wellbeing === 'not_well');

  const primaryCaregiver = caregivers.find((c) => c.isPrimary) || caregivers[0];
  const nextCaregiver =
    caregivers.find((c) => c.id !== primaryCaregiver?.id) ||
    caregivers[1] || {
      id: 'cg-2',
      name: 'Omar Ahmed',
      relationship: 'Son',
      phone: '+971 55 987 6543',
      email: 'omar.ahmed@example.ae',
      isPrimary: false,
    };

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Next medication
  const nextMedication =
    medications.find((m) => m.status === 'due') ||
    medications.find((m) => m.status === 'upcoming') ||
    medications[0];

  // Next appointment
  const nextAppointment = appointments[0];

  // Next meal (determine based on hour or default)
  const nextMeal =
    currentHour < 11
      ? meals.find((m) => m.type === 'breakfast') || meals[0]
      : currentHour < 15
      ? meals.find((m) => m.type === 'lunch') || meals[1]
      : currentHour < 18
      ? meals.find((m) => m.type === 'snack') || meals[2]
      : meals.find((m) => m.type === 'dinner') || meals[3] || meals[0];

  const workout = workouts[0];

  const handleWellbeingSelect = (status: 'good' | 'okay' | 'not_well') => {
    // Caregiver cannot edit the elderly user's mood
    if (isCaregiverAuthenticated) {
      return;
    }
    setWellbeing(status);
    if (status === 'not_well') {
      setShowWellbeingSupport(true);
    } else {
      setShowWellbeingSupport(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-28 lg:pb-24 space-y-6 sm:space-y-7">
      {/* 1. TOP GREETING & DATE */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="relative shrink-0">
            <img
              src={profile.avatar}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-teal-600/30 shadow-sm"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[9px] font-bold">
              ✓
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {greeting}, {profile.name.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5 leading-snug">
              {formatCurrentDate()} · {profile.city || 'Abu Dhabi'}, UAE
            </p>
          </div>
        </div>
      </section>

      {/* 2. NEXT MEDICATION (PROMINENT HERO HIGHLIGHT) */}
      {nextMedication && (
        <section aria-labelledby="next-up-heading">
          <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-emerald-950 rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-teal-950/20 relative overflow-hidden">
            <div className="flex items-center gap-2 text-teal-200 text-xs font-bold uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4" />
              <span id="next-up-heading">Next Medication</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2.5 sm:gap-3">
                  <span className="text-2xl">💊</span>
                  <span>
                    {nextMedication.name} {nextMedication.dosage}
                  </span>
                </h2>
                <div className="text-base sm:text-lg text-teal-100 mt-2 font-medium flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xl sm:text-2xl font-black bg-white/20 px-3.5 py-1 rounded-xl text-white border border-white/30 shadow-xs">
                    {nextMedication.time}
                  </span>
                  <span aria-hidden="true" className="text-teal-300">·</span>
                  <span className="capitalize font-bold text-teal-100 text-lg">
                    {nextMedication.foodInstruction.replace('_', ' ')}
                  </span>
                </div>
                {nextMedication.instructions && (
                  <p className="text-xs sm:text-sm text-teal-200/90 mt-2 max-w-lg">
                    {nextMedication.instructions}
                  </p>
                )}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => markMedicationTaken(nextMedication.id)}
                className={`min-h-[52px] w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-98 whitespace-nowrap touch-manipulation ${
                  nextMedication.status === 'taken'
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                    : 'bg-white hover:bg-teal-50 text-teal-950 shadow-white/10'
                }`}
              >
                <CheckCircle2
                  className={`w-6 h-6 ${
                    nextMedication.status === 'taken' ? 'text-emerald-400' : 'text-teal-700'
                  }`}
                />
                <span>
                  {nextMedication.status === 'taken' ? 'Taken (Tap to Undo)' : 'Mark as Taken'}
                </span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. ESSENTIAL DAILY SUMMARY CARDS (NO OVERCROWDING, NEAT RESPONSIVE 2X2 GRID) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* CARD A: NEXT APPOINTMENT */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
                <Calendar className="w-3.5 h-3.5" />
                <span>Next Appointment</span>
              </span>
              <span className="text-sm sm:text-base font-black font-mono text-purple-950 bg-purple-100 px-2.5 py-0.5 rounded-xl border border-purple-200 shrink-0">
                {nextAppointment?.time}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mt-3 leading-snug">
              {nextAppointment?.doctor}
            </h3>
            <p className="text-sm font-semibold text-purple-950 mt-0.5">
              {nextAppointment?.specialty}
            </p>

            <div className="mt-2.5 space-y-1 text-xs text-slate-600">
              <p className="flex items-center gap-1.5 font-medium text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                <span>{nextAppointment?.date}</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{nextAppointment?.clinic}</span>
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('appointments')}
              className="text-sm font-bold text-purple-800 hover:text-purple-950 flex items-center gap-1"
            >
              <span>View All Appointments</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (nextAppointment) {
                  startCall({
                    name: nextAppointment.clinic,
                    relationship: `Doctor (${nextAppointment.doctor})`,
                    phone: nextAppointment.phone,
                    type: 'doctor',
                  });
                }
              }}
              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </button>
          </div>
        </div>

        {/* CARD B: TODAY'S NEXT MEAL (SMALL CARD LINKING TO DEDICATED MEAL PLAN) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
                <Utensils className="w-3.5 h-3.5" />
                <span>Next Meal</span>
              </span>
              <span className="text-sm sm:text-base font-black font-mono text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-xl border border-amber-300 shrink-0">
                {nextMeal?.time}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mt-3">
              {nextMeal?.title}
            </h3>
            <p className="text-sm text-slate-700 mt-1 line-clamp-2">
              {nextMeal?.description}
            </p>
            <p className="text-xs text-rose-700 font-semibold mt-1">
              Allergens: {nextMeal?.allergens || 'None'}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('meals')}
              className="text-sm font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1"
            >
              <span>View Full Meal Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CARD C: WATER HYDRATION PROGRESS */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
                <Droplet className="w-3.5 h-3.5" />
                <span>Water Hydration</span>
              </span>
              <span className="text-sm font-bold font-mono text-blue-900 shrink-0">
                {waterCount} / {waterGoal} glasses
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mt-3">
              {waterCount >= waterGoal ? 'Hydration Goal Reached! 💧' : 'Stay Hydrated Today'}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Drinking warm water throughout the day aids digestion and wellness.
            </p>

            {/* Visual hydration bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.round((waterCount / waterGoal) * 100))}%`,
                }}
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">
              {Math.round((waterCount / waterGoal) * 100)}% of daily goal
            </span>
            <button
              type="button"
              onClick={addWater}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-transform active:scale-98"
            >
              + Add Water Glass
            </button>
          </div>
        </div>

        {/* CARD D: GENTLE WORKOUT */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
                <Activity className="w-3.5 h-3.5" />
                <span>Daily Activity</span>
              </span>
              <span className="text-sm sm:text-base font-black font-mono text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded-xl border border-emerald-300 shrink-0">
                {workout?.time}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mt-3">
              {workout?.title}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {workout?.duration} · {workout?.instructions}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-xs font-bold text-slate-600">
              {workout?.completed ? '✓ Completed today' : 'Scheduled today'}
            </span>
            <button
              type="button"
              onClick={() => completeWorkout(workout?.id || 'wo-1')}
              className={`min-h-[40px] px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                workout?.completed
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
              }`}
            >
              {workout?.completed ? '✓ Done' : 'Mark Complete'}
            </button>
          </div>
        </div>
      </section>

      {/* 4. WELLBEING CHECK SECTION */}
      <section aria-labelledby="wellbeing-heading" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <h2 id="wellbeing-heading" className="text-2xl font-extrabold text-slate-900">
            {isCaregiverAuthenticated ? "Mariam's Daily Wellbeing" : "How are you feeling today?"}
          </h2>
          {isCaregiverAuthenticated && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shrink-0">
              <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Read-Only for Caregiver</span>
            </span>
          )}
        </div>
        <p className="text-base text-slate-600 mb-6">
          {isCaregiverAuthenticated
            ? "Elderly user's personal daily mood cannot be edited by the caregiver."
            : "Your daily wellbeing helps your family and caregivers support you."}
        </p>

        {/* 3 Large Choices */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <button
            type="button"
            disabled={isCaregiverAuthenticated}
            onClick={() => handleWellbeingSelect('good')}
            className={`min-h-[72px] p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${
              isCaregiverAuthenticated ? 'cursor-not-allowed opacity-90' : 'active:scale-98'
            } ${
              wellbeing === 'good'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-600/20'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
            }`}
            title={isCaregiverAuthenticated ? "Elderly mood cannot be edited by caregiver" : undefined}
          >
            <span className="text-3xl">😊</span>
            <span className="text-xl font-bold">Good</span>
            {isCaregiverAuthenticated && wellbeing === 'good' && (
              <span className="text-xs bg-emerald-200/70 text-emerald-900 font-bold px-2 py-0.5 rounded-md ml-1">
                Active
              </span>
            )}
          </button>

          <button
            type="button"
            disabled={isCaregiverAuthenticated}
            onClick={() => handleWellbeingSelect('okay')}
            className={`min-h-[72px] p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${
              isCaregiverAuthenticated ? 'cursor-not-allowed opacity-90' : 'active:scale-98'
            } ${
              wellbeing === 'okay'
                ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-600/20'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
            }`}
            title={isCaregiverAuthenticated ? "Elderly mood cannot be edited by caregiver" : undefined}
          >
            <span className="text-3xl">😐</span>
            <span className="text-xl font-bold">Okay</span>
            {isCaregiverAuthenticated && wellbeing === 'okay' && (
              <span className="text-xs bg-amber-200/70 text-amber-900 font-bold px-2 py-0.5 rounded-md ml-1">
                Active
              </span>
            )}
          </button>

          <button
            type="button"
            disabled={isCaregiverAuthenticated}
            onClick={() => handleWellbeingSelect('not_well')}
            className={`min-h-[72px] p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${
              isCaregiverAuthenticated ? 'cursor-not-allowed opacity-90' : 'active:scale-98'
            } ${
              wellbeing === 'not_well'
                ? 'bg-rose-50 border-rose-600 text-rose-900 ring-2 ring-rose-600/20'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
            }`}
            title={isCaregiverAuthenticated ? "Elderly mood cannot be edited by caregiver" : undefined}
          >
            <span className="text-3xl">❤️</span>
            <span className="text-xl font-bold">Not well</span>
            {isCaregiverAuthenticated && wellbeing === 'not_well' && (
              <span className="text-xs bg-rose-200/70 text-rose-900 font-bold px-2 py-0.5 rounded-md ml-1">
                Active
              </span>
            )}
          </button>
        </div>

        {/* If "Not well" is selected */}
        {showWellbeingSupport && (
          <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in duration-200">
            <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-5 sm:p-6">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-lg mb-1">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Would you like to contact someone?</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mb-4">
                We are right by your side. Select who you would like to reach:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* 1. Primary Caregiver (Aisha) */}
                <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between gap-3.5">
                  <div>
                    <div className="flex items-center justify-between gap-2.5 mb-3">
                      <div className="w-9.5 h-9.5 rounded-xl bg-teal-100 text-teal-800 font-black text-base flex items-center justify-center border border-teal-200 shadow-2xs shrink-0">
                        {primaryCaregiver?.name?.charAt(0) || 'A'}
                      </div>
                      <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200/90 px-2 py-0.5 rounded-lg shrink-0">
                        Primary
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {primaryCaregiver?.name || 'Aisha Ahmed'}
                    </h4>
                    <p className="text-xs font-semibold text-teal-800 mt-0.5 leading-snug">
                      {primaryCaregiver?.relationship || 'Daughter'} · Caregiver
                    </p>
                    <p className="text-xs font-mono font-medium text-slate-500 mt-1">
                      {primaryCaregiver?.phone || '+971 50 123 4567'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      startCall({
                        name: primaryCaregiver?.name || 'Aisha Ahmed',
                        relationship: primaryCaregiver?.relationship || 'Daughter',
                        phone: primaryCaregiver?.phone || '+971 50 123 4567',
                        type: 'caregiver',
                      })
                    }
                    className="w-full min-h-[44px] py-2.5 px-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-xs whitespace-nowrap"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span>Call Caregiver</span>
                  </button>
                </div>

                {/* 2. Next Caregiver */}
                <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between gap-3.5">
                  <div>
                    <div className="flex items-center justify-between gap-2.5 mb-3">
                      <div className="w-9.5 h-9.5 rounded-xl bg-indigo-100 text-indigo-800 font-black text-base flex items-center justify-center border border-indigo-200 shadow-2xs shrink-0">
                        {nextCaregiver?.name?.charAt(0) || 'O'}
                      </div>
                      <span className="text-[11px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200/90 px-2 py-0.5 rounded-lg shrink-0">
                        Caregiver
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {nextCaregiver?.name || 'Omar Ahmed'}
                    </h4>
                    <p className="text-xs font-semibold text-indigo-700 mt-0.5 leading-snug">
                      {nextCaregiver?.relationship || 'Son'} · Caregiver
                    </p>
                    <p className="text-xs font-mono font-medium text-slate-500 mt-1">
                      {nextCaregiver?.phone || '+971 55 987 6543'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      startCall({
                        name: nextCaregiver?.name || 'Omar Ahmed',
                        relationship: nextCaregiver?.relationship || 'Son',
                        phone: nextCaregiver?.phone || '+971 55 987 6543',
                        type: 'caregiver',
                      })
                    }
                    className="w-full min-h-[44px] py-2.5 px-3.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-xs whitespace-nowrap"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span>Call {nextCaregiver?.name ? nextCaregiver.name.split(' ')[0] : 'Caregiver'}</span>
                  </button>
                </div>

                {/* 3. Emergency Ambulance (998) */}
                <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200/90 shadow-2xs hover:border-rose-300 transition-all flex flex-col justify-between gap-3.5">
                  <div>
                    <div className="flex items-center justify-between gap-2.5 mb-3">
                      <div className="w-9.5 h-9.5 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200 shadow-2xs shrink-0">
                        <ShieldAlert className="w-4.5 h-4.5 text-rose-600" />
                      </div>
                      <span className="text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200/90 px-2 py-0.5 rounded-lg shrink-0">
                        Emergency
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      UAE Ambulance
                    </h4>
                    <p className="text-xs font-semibold text-rose-700 mt-0.5 leading-snug">
                      Emergency Medical Service
                    </p>
                    <p className="text-xs font-mono font-medium text-slate-500 mt-1">
                      Dial 998 · 24/7 Dispatch
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      startCall({
                        name: 'UAE Ambulance',
                        relationship: 'Emergency Medical Dispatch',
                        phone: '998',
                        type: 'emergency',
                      })
                    }
                    className="w-full min-h-[44px] py-2.5 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-xs whitespace-nowrap"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span>Call 998</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 6. QUICK ACTIONS */}
      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="text-xl font-bold text-slate-900 mb-3">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Emergency SOS */}
          <button
            type="button"
            onClick={() => setActiveTab('emergency')}
            className="min-h-[96px] p-4 rounded-3xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 text-left flex flex-col justify-between transition-all active:scale-98 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="block text-lg font-bold text-rose-950">Emergency</span>
              <span className="text-xs font-semibold text-rose-700">999 · 998 · 997</span>
            </div>
          </button>

          {/* Voice & Text Assistant */}
          <button
            type="button"
            onClick={openVoiceAssistant}
            className="min-h-[96px] p-4 rounded-3xl bg-teal-50 hover:bg-teal-100 border-2 border-teal-200 text-left flex flex-col justify-between transition-all active:scale-98 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-teal-700 text-white flex items-center justify-center shadow-sm">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-lg font-bold text-teal-950">Gemini Assistant</span>
              <span className="text-xs font-semibold text-teal-700">Voice & Text</span>
            </div>
          </button>

          {/* Meal Plan */}
          <button
            type="button"
            onClick={() => setActiveTab('meals')}
            className="min-h-[96px] p-4 rounded-3xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 text-left flex flex-col justify-between transition-all active:scale-98 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-700 text-white flex items-center justify-center shadow-sm">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-lg font-bold text-amber-950">Meal Plan</span>
              <span className="text-xs font-semibold text-amber-700">Today's Meals</span>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};
