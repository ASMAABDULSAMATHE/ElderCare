import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrentDate } from '../utils/dateUtils';
import {
  Pill,
  Droplet,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ShieldAlert,
  Info,
} from 'lucide-react';

export const HealthView: React.FC = () => {
  const {
    medications,
    markMedicationTaken,
    waterCount,
    waterGoal,
    addWater,
    workouts,
    completeWorkout,
    profile,
  } = useApp();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'taken':
        return (
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Taken
          </span>
        );
      case 'due':
        return (
          <span className="text-xs font-bold text-amber-700 flex items-center gap-1 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" /> Due Now
          </span>
        );
      case 'missed':
        return (
          <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Missed
          </span>
        );
      default:
        return (
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Upcoming
          </span>
        );
    }
  };

  const getFoodInstructionLabel = (instruction: string) => {
    switch (instruction) {
      case 'before_food':
        return 'Before food';
      case 'after_food':
        return 'After food';
      case 'with_food':
        return 'With food';
      default:
        return 'No food instruction';
    }
  };

  const waterPercentage = Math.min(Math.round((waterCount / waterGoal) * 100), 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-28 lg:pb-24 space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Daily Health & Wellness
        </h1>
        <p className="text-base text-slate-500 mt-1 flex flex-wrap items-center gap-2">
          <span>View your daily medications, log water intake, and track gentle workouts.</span>
          <span className="font-semibold text-teal-900 bg-teal-100/80 px-2.5 py-0.5 rounded-lg text-xs">
            {formatCurrentDate()}
          </span>
        </p>
      </div>

      {/* 1. MEDICATIONS SECTION */}
      <section aria-labelledby="medications-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <h2 id="medications-heading" className="text-xl sm:text-2xl font-bold text-slate-900">
              Medications
            </h2>
          </div>
          <span className="text-sm font-semibold text-slate-500">
            {medications.filter((m) => m.status === 'taken').length} of {medications.length} taken today
          </span>
        </div>

        <div className="space-y-3">
          {medications.map((med) => {
            const isTaken = med.status === 'taken';
            return (
              <div
                key={med.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all ${
                  isTaken
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : med.status === 'due'
                    ? 'border-amber-300 ring-2 ring-amber-100'
                    : 'border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-900">
                        {med.name} {med.dosage}
                      </h3>
                      {getStatusBadge(med.status)}
                    </div>

                    <div className="text-base font-medium text-slate-600 flex flex-wrap items-center gap-2.5 mt-1">
                      <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 bg-teal-50 px-3.5 py-1 rounded-xl border border-teal-200">
                        {med.time}
                      </span>
                      <span aria-hidden="true" className="text-slate-400">·</span>
                      <span className="text-teal-900 font-bold text-base sm:text-lg">
                        {getFoodInstructionLabel(med.foodInstruction)}
                      </span>
                    </div>

                    {med.instructions && (
                      <p className="text-sm text-slate-500 mt-1 max-w-xl">
                        {med.instructions}
                      </p>
                    )}

                    {med.takenAt && (
                      <p className="text-xs text-emerald-700 font-medium mt-1">
                        Logged at {med.takenAt}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => markMedicationTaken(med.id)}
                    className={`min-h-[50px] px-6 py-3 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-98 sm:self-center whitespace-nowrap ${
                      isTaken
                        ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                        : med.status === 'due'
                        ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-md shadow-teal-700/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <CheckCircle2 className={`w-5 h-5 ${isTaken ? 'text-emerald-700' : 'text-white'}`} />
                    <span>{isTaken ? 'Taken (Tap to undo)' : 'Mark as Taken'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            Medication instructions and dosage are managed by your authorized caregiver in consultation with your doctor. Seniors can view schedules and record doses taken.
          </p>
        </div>
      </section>

      {/* 2. WATER TRACKER SECTION */}
      <section aria-labelledby="water-heading" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplet className="w-7 h-7" />
            </div>
            <div>
              <h2 id="water-heading" className="text-2xl font-bold text-slate-900">
                Today's Water
              </h2>
              <p className="text-sm text-slate-500">
                Caregiver daily target: {waterGoal} glasses (approx. 2 liters)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={addWater}
            className="min-h-[52px] px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-transform active:scale-98 self-start sm:self-center"
          >
            <Plus className="w-5 h-5" />
            <span>+ Add Water</span>
          </button>
        </div>

        {/* Progress Bar & Glass Visuals */}
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-extrabold font-mono text-slate-900">
              {waterCount} <span className="text-xl text-slate-400 font-sans font-medium">/ {waterGoal} glasses</span>
            </span>
            <span className="text-lg font-bold text-blue-700">{waterPercentage}%</span>
          </div>

          {/* Clean Progress Meter */}
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-300"
              style={{ width: `${waterPercentage}%` }}
            />
          </div>

          {/* Interactive Visual Glass Tokens */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-2">
            {Array.from({ length: waterGoal }).map((_, index) => {
              const isFilled = index < waterCount;
              return (
                <div
                  key={index}
                  className={`h-14 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                    isFilled
                      ? 'bg-blue-50 border-blue-400 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-300'
                  }`}
                >
                  <Droplet className={`w-5 h-5 ${isFilled ? 'fill-current' : ''}`} />
                  <span className="text-[10px] font-bold font-mono">#{index + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. WORKOUTS SECTION */}
      <section aria-labelledby="workouts-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <h2 id="workouts-heading" className="text-xl sm:text-2xl font-bold text-slate-900">
            Daily Activity & Exercise
          </h2>
        </div>

        <div className="space-y-3">
          {workouts.map((w) => (
            <div
              key={w.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all ${
                w.completed
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : 'border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-900">{w.title}</h3>
                    {w.completed && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="font-mono text-lg sm:text-xl font-black text-emerald-950 bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-300">
                      {w.time}
                    </span>
                    <span aria-hidden="true" className="text-slate-400">·</span>
                    <span className="text-sm sm:text-base font-semibold text-slate-700">
                      Duration: <strong className="text-emerald-900">{w.duration}</strong>
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 mt-1 max-w-xl">
                    {w.instructions}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => completeWorkout(w.id)}
                  className={`min-h-[50px] px-6 py-3 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-98 sm:self-center whitespace-nowrap ${
                    w.completed
                      ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{w.completed ? 'Completed (Tap to undo)' : 'Mark Complete'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. EMERGENCY MEDICAL INFORMATION SUMMARY */}
      <section aria-labelledby="medical-info-heading" className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldAlert className="w-4 h-4" />
          <span id="medical-info-heading">Medical Quick Card</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block">
              Blood Type
            </span>
            <span className="text-2xl font-black font-mono text-rose-400 mt-0.5 block">
              {profile.bloodType}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block">
              Known Allergies
            </span>
            <div className="text-base font-semibold text-slate-100 mt-0.5">
              {profile.allergies.join(', ')}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block">
              Chronic Conditions
            </span>
            <div className="text-base font-semibold text-slate-100 mt-0.5">
              {profile.conditions.join(', ')}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
