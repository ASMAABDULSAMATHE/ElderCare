import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Caregiver, Medication, MealPlan, Appointment, LovedOne } from '../types';
import { formatCurrentDate } from '../utils/dateUtils';
import {
  ShieldCheck,
  User,
  HeartPulse,
  Pill,
  Droplet,
  Utensils,
  Calendar,
  Heart,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Save,
  X,
  LogOut,
  Users,
} from 'lucide-react';

export const CaregiverDashboardView: React.FC = () => {
  const {
    profile,
    updateProfile,
    caregivers,
    addCaregiver,
    updateCaregiver,
    deleteCaregiver,
    medications,
    addMedication,
    updateMedication,
    deleteMedication,
    meals,
    addMeal,
    updateMeal,
    deleteMeal,
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    lovedOnes,
    lovedOneReminders,
    addLovedOne,
    updateLovedOne,
    deleteLovedOne,
    waterCount,
    waterGoal,
    updateWaterGoal,
    workouts,
    wellbeing,
    exitCaregiverMode,
    setActiveTab,
  } = useApp();

  const [activeSection, setActiveSection] = useState<
    'overview' | 'caregivers' | 'medications' | 'meals' | 'appointments' | 'medical'
  >('overview');

  // Caregiver form state
  const [isAddingCaregiver, setIsAddingCaregiver] = useState(false);
  const [cgName, setCgName] = useState('');
  const [cgRelationship, setCgRelationship] = useState('');
  const [cgPhone, setCgPhone] = useState('+971 5');
  const [cgEmail, setCgEmail] = useState('');
  const [cgIsPrimary, setCgIsPrimary] = useState(false);
  const [cgError, setCgError] = useState<string | null>(null);

  // Medication form state
  const [isAddingMed, setIsAddingMed] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medTime, setMedTime] = useState('8:00 AM');
  const [medFoodInstruction, setMedFoodInstruction] = useState<
    'before_food' | 'after_food' | 'with_food' | 'no_instruction'
  >('after_food');
  const [medInstructions, setMedInstructions] = useState('');

  // Medical info state
  const [bloodType, setBloodType] = useState(profile.bloodType);
  const [allergiesStr, setAllergiesStr] = useState(profile.allergies.join(', '));
  const [conditionsStr, setConditionsStr] = useState(profile.conditions.join(', '));
  const [medicalSavedToast, setMedicalSavedToast] = useState(false);

  // Water goal state
  const [tempWaterGoal, setTempWaterGoal] = useState(waterGoal);

  // Calculate compliance statistics
  const takenMedsCount = medications.filter((m) => m.status === 'taken').length;
  const totalMedsCount = medications.length;

  const handleAddCaregiverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cgName || !cgPhone) {
      setCgError('Name and phone are required');
      return;
    }

    const res = addCaregiver({
      name: cgName,
      relationship: cgRelationship || 'Family Member',
      phone: cgPhone,
      email: cgEmail || `${cgName.toLowerCase().replace(/\s+/g, '')}@example.ae`,
      isPrimary: cgIsPrimary,
    });

    if (!res.success) {
      setCgError(res.message || 'You can have up to 3 caregivers.');
      return;
    }

    // Reset form
    setCgName('');
    setCgRelationship('');
    setCgPhone('+971 5');
    setCgEmail('');
    setCgIsPrimary(false);
    setCgError(null);
    setIsAddingCaregiver(false);
  };

  const handleAddMedicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !medDosage) return;

    addMedication({
      name: medName,
      dosage: medDosage,
      time: medTime,
      foodInstruction: medFoodInstruction,
      instructions: medInstructions,
    });

    setMedName('');
    setMedDosage('');
    setMedTime('8:00 AM');
    setMedFoodInstruction('after_food');
    setMedInstructions('');
    setIsAddingMed(false);
  };

  const handleSaveMedicalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      bloodType,
      allergies: allergiesStr.split(',').map((s) => s.trim()).filter(Boolean),
      conditions: conditionsStr.split(',').map((s) => s.trim()).filter(Boolean),
    });
    setMedicalSavedToast(true);
    setTimeout(() => setMedicalSavedToast(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-28 lg:pb-24 space-y-6 sm:space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Caregiver Administration Mode</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {profile.name}'s Care Center
          </h1>
          <p className="text-sm text-teal-100 mt-1 flex flex-wrap items-center gap-2">
            <span className="bg-teal-800/80 px-2 py-0.5 rounded text-teal-200 text-xs font-semibold">
              Today: {formatCurrentDate()}
            </span>
            <span>Manage medications, meal plans, schedules, and up to 3 authorized family caregivers.</span>
          </p>
        </div>

        <button
          type="button"
          onClick={exitCaregiverMode}
          className="min-h-[44px] w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-teal-50 text-slate-900 font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-98 self-stretch sm:self-center touch-manipulation"
        >
          <LogOut className="w-4 h-4 text-teal-800" />
          <span>Exit Caregiver View</span>
        </button>
      </div>

      {/* Section Sub-Navigation Tabs - Unscrollable, fits all tabs seamlessly */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-slate-100 rounded-2xl w-full">
        {[
          { id: 'overview', short: 'Overview', full: 'Overview' },
          { id: 'caregivers', short: 'Caregivers', full: 'Caregivers' },
          { id: 'medications', short: 'Medications', full: 'Medications' },
          { id: 'meals', short: 'Meals', full: 'Meals' },
          { id: 'appointments', short: 'Appointments', full: 'Appointments' },
          { id: 'medical', short: 'Medical', full: 'Medical Info' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id as any)}
            className={`min-h-[44px] px-1 sm:px-2 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all text-center flex items-center justify-center active:scale-95 touch-manipulation whitespace-nowrap ${
              activeSection === tab.id
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="hidden md:inline">{tab.full}</span>
            <span className="md:hidden">{tab.short}</span>
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW DASHBOARD */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Mariam's Wellbeing */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Mariam's Wellbeing
                </span>
                <div className="flex items-center gap-2.5 mt-2">
                  <span className="text-2xl shrink-0">
                    {wellbeing === 'good' ? '😊' : wellbeing === 'okay' ? '😐' : '❤️'}
                  </span>
                  <span className="text-base font-bold text-slate-900 leading-snug">
                    {wellbeing === 'good'
                      ? 'Feeling Good'
                      : wellbeing === 'okay'
                      ? 'Feeling Okay'
                      : 'Needs Attention'}
                  </span>
                </div>
              </div>
              <span className="text-xs text-slate-500 mt-3 block">
                Updated today by Mariam
              </span>
            </div>

            {/* Medication Compliance */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Medication Status
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-teal-800 whitespace-nowrap">
                    {takenMedsCount} / {totalMedsCount}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">taken</span>
                </div>
              </div>
              <span className="text-xs text-slate-500 mt-3 block">
                {totalMedsCount - takenMedsCount === 0
                  ? 'All doses complete'
                  : `${totalMedsCount - takenMedsCount} dose(s) pending today`}
              </span>
            </div>

            {/* Water Tracker */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Water Hydration
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-700 whitespace-nowrap">
                    {waterCount} / {waterGoal}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">glasses</span>
                </div>
              </div>
              <span className="text-xs text-slate-500 mt-3 block">
                Target: {waterGoal} glasses/day
              </span>
            </div>

            {/* Next Appointment */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Next Appointment
                </span>
                <div className="text-base sm:text-lg font-bold text-purple-900 mt-2 leading-tight">
                  {appointments[0]?.time} Today
                </div>
                <div className="mt-1">
                  <span className="text-xs font-bold text-slate-700 block leading-tight">
                    {appointments[0]?.doctor}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 block leading-tight mt-0.5">
                    {appointments[0]?.clinic}
                  </span>
                </div>
              </div>
              <span className="text-xs text-slate-500 mt-3 block">
                {appointments[0]?.type || 'Medical Checkup'}
              </span>
            </div>
          </div>

          {/* Quick Monitoring Alert Rows */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Live Care Activity Stream
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-700" />
                  <span className="text-sm font-medium text-teal-950">
                    Workout Activity: Evening Walk ({workouts[0]?.completed ? 'Completed' : 'Pending'})
                  </span>
                </div>
                <span className="text-xs font-mono text-teal-700">4:00 PM</span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Droplet className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-950">
                    Water progress: {waterCount} glasses consumed today
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('medications')}
                  className="text-xs font-bold text-blue-700 hover:underline"
                >
                  Adjust Goals
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-rose-600 fill-current shrink-0" />
                  <div>
                    <span className="text-sm font-bold text-rose-950 block">
                      Family Call Reminders
                    </span>
                    <span className="text-xs text-rose-800">
                      {lovedOneReminders.length > 0
                        ? `${lovedOneReminders.length} reminder(s) configured for Mariam (e.g. Call ${lovedOneReminders[0]?.name})`
                        : `Default schedule: Call ${lovedOnes[0]?.name || 'Family'} at ${lovedOnes[0]?.reminderTime || '7:00 PM'}`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('people')}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 self-start sm:self-auto transition-transform active:scale-98"
                >
                  Manage Reminders
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CAREGIVERS MANAGEMENT (MAXIMUM 3 STRICT RULE) */}
      {activeSection === 'caregivers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Authorized Caregivers
                  </h2>
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg">
                    {caregivers.length} / 3
                  </span>
                </div>
                {/* STRICT PROMPT REQUIREMENT: "You can have up to 3 caregivers." */}
                <p className="text-sm text-slate-600 mt-1 font-semibold text-teal-800">
                  "You can have up to 3 caregivers."
                </p>
              </div>

              {caregivers.length < 3 ? (
                <button
                  type="button"
                  onClick={() => setIsAddingCaregiver(true)}
                  className="min-h-[46px] px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm flex items-center gap-2 self-start sm:self-auto transition-transform active:scale-98 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Caregiver</span>
                </button>
              ) : (
                <div className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                  Maximum 3 caregivers reached
                </div>
              )}
            </div>

            {cgError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{cgError}</span>
              </div>
            )}

            {/* List of Caregivers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {caregivers.map((cg) => (
                <div
                  key={cg.id}
                  className={`rounded-2xl p-5 border flex flex-col justify-between space-y-4 ${
                    cg.isPrimary
                      ? 'bg-teal-50/50 border-teal-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      {cg.isPrimary ? (
                        <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                          Primary Caregiver
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateCaregiver(cg.id, { isPrimary: true })}
                          className="text-xs text-slate-500 hover:text-teal-700 font-semibold"
                        >
                          Set as Primary
                        </button>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{cg.name}</h3>
                    <p className="text-sm font-medium text-slate-600">{cg.relationship}</p>
                    <p className="text-sm font-mono text-slate-800 mt-2 font-bold">{cg.phone}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{cg.email}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        const newPhone = prompt('Update phone number:', cg.phone);
                        if (newPhone) updateCaregiver(cg.id, { phone: newPhone });
                      }}
                      className="text-xs font-semibold text-slate-600 hover:text-teal-700 flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Phone</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remove ${cg.name} as caregiver?`)) {
                          deleteCaregiver(cg.id);
                        }
                      }}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal / Form to Add Caregiver */}
            {isAddingCaregiver && (
              <form
                onSubmit={handleAddCaregiverSubmit}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4 animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">
                    Add New Caregiver (Slot {caregivers.length + 1} of 3)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddingCaregiver(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={cgName}
                      onChange={(e) => setCgName(e.target.value)}
                      placeholder="e.g. Fatima Ahmed"
                      required
                      className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Relationship *
                    </label>
                    <input
                      type="text"
                      value={cgRelationship}
                      onChange={(e) => setCgRelationship(e.target.value)}
                      placeholder="e.g. Daughter / Nurse / Son"
                      required
                      className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      UAE Phone Number *
                    </label>
                    <input
                      type="text"
                      value={cgPhone}
                      onChange={(e) => setCgPhone(e.target.value)}
                      placeholder="+971 50 XXX XXXX"
                      required
                      className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 text-sm font-medium font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={cgEmail}
                      onChange={(e) => setCgEmail(e.target.value)}
                      placeholder="caregiver@example.ae"
                      className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="cg-primary"
                    checked={cgIsPrimary}
                    onChange={(e) => setCgIsPrimary(e.target.checked)}
                    className="w-4 h-4 text-teal-700 rounded"
                  />
                  <label htmlFor="cg-primary" className="text-sm font-semibold text-slate-700">
                    Designate as Primary Caregiver
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm"
                  >
                    Save Caregiver
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCaregiver(false)}
                    className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. MEDICATIONS MANAGEMENT */}
      {activeSection === 'medications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Prescription & Medication Schedule
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Enter exact dosage, schedule times, and food instructions per doctor's instructions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingMed(true)}
                className="min-h-[46px] px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm flex items-center gap-2 self-start sm:self-auto shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Medication</span>
              </button>
            </div>

            {/* List of Medications */}
            <div className="space-y-3">
              {medications.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {m.name} {m.dosage}
                      </h3>
                      <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg capitalize">
                        {m.foodInstruction.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm font-semibold font-mono text-slate-700 mt-0.5">
                      Scheduled: {m.time}
                    </p>
                    {m.instructions && (
                      <p className="text-xs text-slate-500 mt-1">{m.instructions}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        const newFood = prompt(
                          'Update food instruction (before_food, after_food, with_food, no_instruction):',
                          m.foodInstruction
                        );
                        if (
                          newFood &&
                          ['before_food', 'after_food', 'with_food', 'no_instruction'].includes(
                            newFood
                          )
                        ) {
                          updateMedication(m.id, { foodInstruction: newFood as any });
                        }
                      }}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Edit Food Rule
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remove ${m.name}?`)) deleteMedication(m.id);
                      }}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50"
                      aria-label="Delete medication"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Medication Form */}
            {isAddingMed && (
              <form
                onSubmit={handleAddMedicationSubmit}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4 animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Add New Medication</h3>
                  <button
                    type="button"
                    onClick={() => setIsAddingMed(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Medication Name *
                    </label>
                    <input
                      type="text"
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      placeholder="e.g. Amlodipine"
                      required
                      className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Dosage *
                    </label>
                    <input
                      type="text"
                      value={medDosage}
                      onChange={(e) => setMedDosage(e.target.value)}
                      placeholder="e.g. 5 mg"
                      required
                      className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Time *
                    </label>
                    <input
                      type="text"
                      value={medTime}
                      onChange={(e) => setMedTime(e.target.value)}
                      placeholder="e.g. 9:00 AM"
                      required
                      className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Food Instruction (Per Doctor's Prescription) *
                    </label>
                    <select
                      value={medFoodInstruction}
                      onChange={(e) => setMedFoodInstruction(e.target.value as any)}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 text-sm font-medium bg-white"
                    >
                      <option value="before_food">Before food</option>
                      <option value="after_food">After food</option>
                      <option value="with_food">With food</option>
                      <option value="no_instruction">No food instruction</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Special Instructions
                  </label>
                  <input
                    type="text"
                    value={medInstructions}
                    onChange={(e) => setMedInstructions(e.target.value)}
                    placeholder="e.g. Take with a full glass of warm water"
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm"
                  >
                    Save Medication
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingMed(false)}
                    className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Water Goal Configuration */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Senior Water Daily Target
                </h3>
                <p className="text-xs text-slate-500">
                  Target glasses of water for Mariam to consume daily.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tempWaterGoal}
                  onChange={(e) => setTempWaterGoal(parseInt(e.target.value) || 8)}
                  className="w-20 py-2 px-3 border border-slate-300 rounded-xl text-center font-bold text-base"
                />
                <button
                  type="button"
                  onClick={() => updateWaterGoal(tempWaterGoal)}
                  className="py-2 px-4 rounded-xl bg-teal-700 text-white font-bold text-sm"
                >
                  Update Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MEALS & NUTRITION MANAGEMENT */}
      {activeSection === 'meals' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Meals, Allergens & Dietary Preferences
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Manage Mariam's daily meals, food preferences, and allergens.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('meals')}
                className="py-2 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs"
              >
                Go to Dedicated Meal Plan Screen →
              </button>
            </div>

            <div className="space-y-4">
              {meals.map((meal) => (
                <div key={meal.id} className="p-5 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 capitalize">
                      {meal.title} ({meal.time})
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newDesc = prompt('Update meal description:', meal.description);
                        if (newDesc) updateMeal(meal.id, { description: newDesc });
                      }}
                      className="text-xs font-bold text-teal-700 hover:underline"
                    >
                      Edit Meal
                    </button>
                  </div>
                  <p className="text-sm font-medium text-slate-700">{meal.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                    <span>Preferences: <strong>{meal.preferences}</strong></span>
                    <span>
                      Allergens:{' '}
                      <strong
                        className={
                          meal.allergens?.toLowerCase().includes('contains')
                            ? 'text-rose-600'
                            : 'text-emerald-700'
                        }
                      >
                        {meal.allergens}
                      </strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. APPOINTMENTS MANAGEMENT */}
      {activeSection === 'appointments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Upcoming Medical Consultations
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Add, update, or cancel doctor consultations and clinic visits.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('appointments')}
                className="py-2 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs"
              >
                Go to Dedicated Appointments Screen →
              </button>
            </div>

            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-5 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{apt.doctor}</h3>
                      <p className="text-sm text-purple-900 font-semibold">{apt.specialty} · {apt.clinic}</p>
                    </div>
                    <span className="text-xs sm:text-sm font-bold font-mono text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 self-start sm:self-center">
                      {apt.date} · {apt.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{apt.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. MEDICAL INFORMATION EDITING */}
      {activeSection === 'medical' && (
        <div className="space-y-6">
          <form
            onSubmit={handleSaveMedicalInfo}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Medical Passport & Emergency Profile
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Changes made here update Mariam's Emergency SOS screen immediately.
                </p>
              </div>

              {medicalSavedToast && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
                  ✓ Profile Saved
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  Blood Group / Type
                </label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 font-bold font-mono text-base"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  Known Allergies (Comma separated)
                </label>
                <input
                  type="text"
                  value={allergiesStr}
                  onChange={(e) => setAllergiesStr(e.target.value)}
                  placeholder="e.g. Penicillin, Aspirin"
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  Chronic Diagnosed Conditions (Comma separated)
                </label>
                <input
                  type="text"
                  value={conditionsStr}
                  onChange={(e) => setConditionsStr(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes, Hypertension, Mild Osteoarthritis"
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-3 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-base flex items-center gap-2 shadow-sm transition-transform active:scale-98"
            >
              <Save className="w-5 h-5" />
              <span>Save Medical Profile</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
