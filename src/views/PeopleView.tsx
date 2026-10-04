import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Caregiver, LovedOne, LovedOneReminder } from '../types';
import {
  Users,
  Heart,
  Phone,
  ShieldCheck,
  Star,
  Plus,
  Clock,
  Bell,
  Lock,
  Calendar,
  Trash2,
  Check,
  X,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';

export const PeopleView: React.FC = () => {
  const {
    caregivers,
    lovedOnes,
    lovedOneReminders,
    addLovedOneReminder,
    deleteLovedOneReminder,
    addLovedOne,
    deleteLovedOne,
    emergencyContacts,
    startCall,
    isCaregiverAuthenticated,
    setActiveTab,
  } = useApp();

  const [reminderToast, setReminderToast] = useState<string | null>(null);
  const [isKidsReminderModalOpen, setIsKidsReminderModalOpen] = useState(false);
  const [isAddLovedOneModalOpen, setIsAddLovedOneModalOpen] = useState(false);

  // Quick reminder form
  const [selectedChild, setSelectedChild] = useState<string>(lovedOnes[0]?.name || 'Aisha');
  const [reminderPreset, setReminderPreset] = useState<string>('tonight');
  const [customTime, setCustomTime] = useState<string>('7:00 PM');
  const [customDay, setCustomDay] = useState<string>('Tonight');

  // Add loved one form
  const [newLovedOneData, setNewLovedOneData] = useState({
    name: '',
    relationship: 'Daughter',
    phone: '+971 50 ',
    reminderFrequency: 'daily' as const,
    reminderTime: '7:00 PM',
  });

  const handleQuickKidReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const targetLovedOne = lovedOnes.find(
      (l) => l.name.toLowerCase() === selectedChild.toLowerCase()
    );

    let timeToUse = customTime;
    let frequencyToUse = customDay;

    if (reminderPreset === 'tonight') {
      timeToUse = '7:00 PM';
      frequencyToUse = 'Tonight';
    } else if (reminderPreset === 'tomorrow') {
      timeToUse = '6:00 PM';
      frequencyToUse = 'Tomorrow';
    } else if (reminderPreset === 'sunday') {
      timeToUse = '7:00 PM';
      frequencyToUse = 'Every Sunday';
    } else if (reminderPreset === 'friday') {
      timeToUse = '5:00 PM';
      frequencyToUse = 'Every Friday';
    }

    addLovedOneReminder({
      lovedOneId: targetLovedOne?.id,
      name: selectedChild,
      relationship: targetLovedOne?.relationship || 'Family',
      time: timeToUse,
      frequency: frequencyToUse,
      notes: `Reminder set: Call ${selectedChild} at ${timeToUse}`,
    });

    setReminderToast(`Reminder set: Call ${selectedChild} (${frequencyToUse} at ${timeToUse})`);
    setIsKidsReminderModalOpen(false);
    setTimeout(() => setReminderToast(null), 4000);
  };

  const handleAddLovedOneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLovedOneData.name || !newLovedOneData.phone) return;
    addLovedOne(newLovedOneData);
    setIsAddLovedOneModalOpen(false);
    setReminderToast(`Added ${newLovedOneData.name} to loved ones.`);
    setTimeout(() => setReminderToast(null), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-28 lg:pb-24 space-y-6 sm:space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Family & Loved Ones
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Stay close to your children, grandchildren, and primary caregivers.
          </p>
        </div>

        {/* CAREGIVER ACTIONS vs SENIOR VIEW */}
        {isCaregiverAuthenticated ? (
          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-center">
            <button
              type="button"
              onClick={() => setIsKidsReminderModalOpen(true)}
              className="min-h-[46px] px-4 py-2.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <Bell className="w-4 h-4 text-teal-200" />
              <span>Schedule Call Reminder</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddLovedOneModalOpen(true)}
              className="min-h-[46px] px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add Loved One</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100/90 border border-slate-200/80 px-3.5 py-2.5 rounded-2xl self-start sm:self-center">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
            <span>Call reminders are set and managed by caregivers</span>
          </div>
        )}
      </div>

      {reminderToast && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 px-4 py-3 rounded-2xl flex items-center gap-3 animate-in fade-in shadow-xs">
          <Heart className="w-5 h-5 text-rose-600 fill-current shrink-0" />
          <span className="text-sm font-semibold">{reminderToast}</span>
        </div>
      )}

      {/* 1. DEDICATED "CALL LOVED ONES / KIDS" FEATURE SECTION */}
      <section aria-labelledby="loved-ones-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <h2 id="loved-ones-heading" className="text-xl sm:text-2xl font-bold text-slate-900">
              Children & Family Members
            </h2>
          </div>

          {isCaregiverAuthenticated && (
            <button
              type="button"
              onClick={() => setIsAddLovedOneModalOpen(true)}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Loved One</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lovedOnes.map((lo) => (
            <div
              key={lo.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 font-black text-lg flex items-center justify-center border border-rose-200 shadow-2xs">
                      {lo.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                      <Heart className="w-3 h-3 fill-current" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                      {lo.name}
                    </h3>
                    <span className="text-xs font-semibold text-rose-700 block mt-0.5">
                      {lo.relationship}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-sm font-bold font-mono text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {lo.phone}
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>
                    Routine schedule: {lo.reminderFrequency} at {lo.reminderTime}
                  </span>
                </div>
              </div>

              {/* Action buttons: Senior gets prominent 1-tap call, Caregiver gets Call + Set Reminder */}
              {isCaregiverAuthenticated ? (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      startCall({
                        name: lo.name,
                        relationship: lo.relationship,
                        phone: lo.phone,
                        type: 'loved_one',
                      })
                    }
                    className="min-h-[44px] py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-98 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current" />
                    <span>Call {lo.name.split(' ')[0]}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChild(lo.name);
                      setIsKidsReminderModalOpen(true);
                    }}
                    className="min-h-[44px] py-2 px-3 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Bell className="w-3.5 h-3.5 text-teal-700" />
                    <span>Set Reminder</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      startCall({
                        name: lo.name,
                        relationship: lo.relationship,
                        phone: lo.phone,
                        type: 'loved_one',
                      })
                    }
                    className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-xs"
                  >
                    <Phone className="w-5 h-5 fill-current" />
                    <span>Call {lo.name.split(' ')[0]}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 2. ACTIVE "CALL KIDS" REMINDERS LIST */}
      <section aria-labelledby="reminders-list-heading" className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-600" />
            <h3 id="reminders-list-heading" className="text-xl font-bold text-slate-900">
              Active Call Reminders
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {isCaregiverAuthenticated && (
              <button
                type="button"
                onClick={() => setIsKidsReminderModalOpen(true)}
                className="text-xs font-bold text-teal-800 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Reminder</span>
              </button>
            )}
            <span className="text-xs font-semibold text-slate-500">
              {lovedOneReminders.length} scheduled
            </span>
          </div>
        </div>

        {lovedOneReminders.length === 0 ? (
          <div className="py-4 text-sm text-slate-500">
            {isCaregiverAuthenticated ? (
              <div className="space-y-2">
                <p>No call reminders scheduled yet for Mariam.</p>
                <button
                  type="button"
                  onClick={() => setIsKidsReminderModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3.5 py-2 rounded-xl transition-colors"
                >
                  <Bell className="w-3.5 h-3.5 text-teal-700" />
                  <span>+ Schedule Call Reminder for Mariam</span>
                </button>
              </div>
            ) : (
              <p>
                No call reminders scheduled yet. Routine reminders to call family members are scheduled and managed by your authorized caregivers.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {lovedOneReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Call {reminder.name}</span>
                    <span className="text-xs font-bold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                      {reminder.relationship}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {reminder.frequency} at {reminder.time} {reminder.notes && `· ${reminder.notes}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const found = lovedOnes.find(
                        (l) => l.name.toLowerCase() === reminder.name.toLowerCase()
                      ) || lovedOnes[0];
                      if (found) {
                        startCall({
                          name: found.name,
                          relationship: found.relationship,
                          phone: found.phone,
                          type: 'loved_one',
                        });
                      }
                    }}
                    className="py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-98"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current" />
                    <span>Call Now</span>
                  </button>

                  {isCaregiverAuthenticated && (
                    <button
                      type="button"
                      onClick={() => deleteLovedOneReminder(reminder.id)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-white text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete reminder"
                      aria-label="Delete reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. CAREGIVERS SECTION (MAXIMUM 3) */}
      <section aria-labelledby="caregivers-heading" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 id="caregivers-heading" className="text-xl sm:text-2xl font-bold text-slate-900">
              Caregivers
            </h2>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-500">
              {caregivers.length} of 3 active
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg text-xs">
              You can have up to 3 caregivers.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {caregivers.map((cg) => (
            <div
              key={cg.id}
              className={`bg-white rounded-3xl p-6 border flex flex-col justify-between transition-all ${
                cg.isPrimary
                  ? 'border-teal-300 ring-2 ring-teal-100 shadow-sm'
                  : 'border-slate-200 shadow-2xs'
              }`}
            >
              <div>
                {cg.isPrimary ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 mb-3 bg-teal-50 px-2.5 py-1 rounded-lg w-fit">
                    <Star className="w-3.5 h-3.5 fill-teal-600 text-teal-600" />
                    <span>Primary Caregiver</span>
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-slate-400 mb-3">
                    Caregiver
                  </div>
                )}

                <h3 className="text-xl font-bold text-slate-900 leading-snug">
                  {cg.name}
                </h3>
                <p className="text-base font-medium text-slate-600">
                  {cg.relationship}
                </p>

                <div className="mt-3 text-sm font-bold font-mono text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {cg.phone}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() =>
                    startCall({
                      name: cg.name,
                      relationship: cg.relationship,
                      phone: cg.phone,
                      type: 'caregiver',
                    })
                  }
                  className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98"
                >
                  <Phone className="w-4 h-4 fill-current" />
                  <span>Call {cg.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. EMERGENCY CONTACTS */}
      <section aria-labelledby="emergency-contacts-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
              <Phone className="w-5 h-5 text-rose-600" />
            </div>
            <h2 id="emergency-contacts-heading" className="text-xl sm:text-2xl font-bold text-slate-900">
              Emergency Contacts
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Separate from caregivers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col justify-between gap-3 shadow-2xs"
            >
              <div>
                <h4 className="text-base font-bold text-slate-900">{contact.name}</h4>
                <p className="text-xs text-slate-500">{contact.relationship}</p>
                <div className="text-sm font-bold font-mono text-slate-800 mt-1">
                  {contact.phone}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  startCall({
                    name: contact.name,
                    relationship: contact.relationship,
                    phone: contact.phone,
                    type: 'emergency',
                  })
                }
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Directly</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL: "SCHEDULE FAMILY CALL REMINDER (CAREGIVER ONLY)" */}
      {isKidsReminderModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-8 shadow-2xl border border-slate-100 max-h-[92dvh] overflow-y-auto relative">
            <button
              onClick={() => setIsKidsReminderModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {!isCaregiverAuthenticated ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Caregiver Access Required
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Scheduling routine reminders to call family members is an option reserved for authorized caregivers.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsKidsReminderModalOpen(false);
                      setActiveTab('caregiver');
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-xs transition-colors"
                  >
                    Enter Caregiver Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsKidsReminderModalOpen(false)}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                    Caregiver Setting
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Schedule Family Call Reminder
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Configure a regular scheduled reminder for Mariam to call family members.
                </p>

                <form onSubmit={handleQuickKidReminder} className="mt-5 space-y-4">
                  {/* Select Child */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Select Family Member
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {lovedOnes.map((lo) => (
                        <button
                          key={lo.id}
                          type="button"
                          onClick={() => setSelectedChild(lo.name)}
                          className={`min-h-[46px] p-2.5 rounded-xl border text-left flex items-center justify-between text-sm font-bold transition-all ${
                            selectedChild === lo.name
                              ? 'border-teal-600 bg-teal-50 text-teal-950 ring-2 ring-teal-200'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{lo.name}</span>
                          <span className="text-[11px] font-normal text-slate-500">
                            {lo.relationship}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Reminder Schedule
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setReminderPreset('tonight')}
                        className={`p-3 rounded-xl border font-bold text-left transition-all ${
                          reminderPreset === 'tonight'
                            ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-200'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="block font-bold">Tonight</span>
                        <span className="text-[11px] font-medium text-slate-500">at 7:00 PM</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReminderPreset('tomorrow')}
                        className={`p-3 rounded-xl border font-bold text-left transition-all ${
                          reminderPreset === 'tomorrow'
                            ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-200'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="block font-bold">Tomorrow</span>
                        <span className="text-[11px] font-medium text-slate-500">at 6:00 PM</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReminderPreset('sunday')}
                        className={`p-3 rounded-xl border font-bold text-left transition-all ${
                          reminderPreset === 'sunday'
                            ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-200'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="block font-bold">Every Sunday</span>
                        <span className="text-[11px] font-medium text-slate-500">at 7:00 PM</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReminderPreset('friday')}
                        className={`p-3 rounded-xl border font-bold text-left transition-all ${
                          reminderPreset === 'friday'
                            ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-200'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="block font-bold">Every Friday</span>
                        <span className="text-[11px] font-medium text-slate-500">at 5:00 PM</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsKidsReminderModalOpen(false)}
                      className="flex-1 py-3 px-4 rounded-xl border border-slate-300 font-bold text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Call Reminder</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD LOVED ONE (CAREGIVER) */}
      {isAddLovedOneModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-8 shadow-2xl border border-slate-100 max-h-[92dvh] overflow-y-auto relative">
            <button
              onClick={() => setIsAddLovedOneModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Add Child / Loved One
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add family members for one-tap calling and call reminders.
            </p>

            <form onSubmit={handleAddLovedOneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ahmed, Fatima"
                  value={newLovedOneData.name}
                  onChange={(e) =>
                    setNewLovedOneData({ ...newLovedOneData, name: e.target.value })
                  }
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Relationship
                </label>
                <select
                  value={newLovedOneData.relationship}
                  onChange={(e) =>
                    setNewLovedOneData({
                      ...newLovedOneData,
                      relationship: e.target.value,
                    })
                  }
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-rose-600 bg-white"
                >
                  <option value="Daughter">Daughter</option>
                  <option value="Son">Son</option>
                  <option value="Granddaughter">Granddaughter</option>
                  <option value="Grandson">Grandson</option>
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="+971 50 123 4567"
                  value={newLovedOneData.phone}
                  onChange={(e) =>
                    setNewLovedOneData({ ...newLovedOneData, phone: e.target.value })
                  }
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLovedOneModalOpen(false)}
                  className="min-h-[44px] rounded-xl border border-slate-300 font-bold text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Loved One</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
