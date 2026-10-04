import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Appointment } from '../types';
import { formatCurrentDate } from '../utils/dateUtils';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Lock,
  Check,
  X,
  FileText,
  ShieldCheck,
  Stethoscope,
  Bell,
} from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    isCaregiverAuthenticated,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    startCall,
  } = useApp();

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deletingApt, setDeletingApt] = useState<{ id: string; doctor: string } | null>(null);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    doctor: string;
    specialty: string;
    clinic: string;
    locationAddress: string;
    date: string;
    time: string;
    type: string;
    phone: string;
    reminder: string;
    notes: string;
  }>({
    doctor: '',
    specialty: 'General Medicine',
    clinic: 'NMC Royal Hospital, Abu Dhabi',
    locationAddress: 'Khalifa City, Abu Dhabi, UAE',
    date: 'Wednesday, 7 October',
    time: '4:00 PM',
    type: 'Doctor appointment',
    phone: '+971 2 633 2255',
    reminder: '1 hour before',
    notes: '',
  });

  const openGoogleMaps = (clinic: string, address: string) => {
    const query = encodeURIComponent(`${clinic}, ${address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleOpenAdd = () => {
    setEditingAppointment(null);
    setFormData({
      doctor: '',
      specialty: 'Internal Medicine',
      clinic: 'NMC Royal Hospital, Abu Dhabi',
      locationAddress: 'Khalifa City, Abu Dhabi, UAE',
      date: 'Monday, 5 October',
      time: '4:00 PM',
      type: 'Doctor appointment',
      phone: '+971 2 633 2255',
      reminder: '1 hour before',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (apt: Appointment) => {
    setEditingAppointment(apt);
    setFormData({
      doctor: apt.doctor,
      specialty: apt.specialty,
      clinic: apt.clinic,
      locationAddress: apt.locationAddress,
      date: apt.date,
      time: apt.time,
      type: apt.type,
      phone: apt.phone,
      reminder: apt.reminder,
      notes: apt.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.doctor || !formData.date || !formData.time) return;

    if (editingAppointment) {
      updateAppointment(editingAppointment.id, formData);
    } else {
      addAppointment(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, doctor: string) => {
    setDeletingApt({ id, doctor });
  };

  const handleConfirmDelete = () => {
    if (deletingApt) {
      deleteAppointment(deletingApt.id);
      setDeletingApt(null);
    }
  };

  const handleSetReminderNotification = (apt: Appointment) => {
    setReminderToast(`Reminder active: "${apt.type} with ${apt.doctor}" set for ${apt.reminder}.`);
    setTimeout(() => setReminderToast(null), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-28 lg:pb-24 space-y-6 sm:space-y-8">
      {/* Title & Clear Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
              Healthcare Appointments
            </span>
            {isCaregiverAuthenticated ? (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Caregiver Mode Active
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                Caregiver Managed
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Medical Appointments
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 flex flex-wrap items-center gap-2">
            <span>Scheduled doctor visits, hospital screenings, dental, and physiotherapy checkups.</span>
            <span className="font-semibold text-purple-900 bg-purple-100/80 px-2.5 py-0.5 rounded-lg text-xs">
              Today: {formatCurrentDate()}
            </span>
          </p>
        </div>

        {/* PROMINENT "ADD APPOINTMENT" BUTTON (Caregiver Only) */}
        {isCaregiverAuthenticated && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="min-h-[50px] w-full sm:w-auto px-6 py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-base shadow-md flex items-center justify-center gap-2.5 transition-transform active:scale-98 self-stretch sm:self-center touch-manipulation"
          >
            <Plus className="w-5 h-5" />
            <span>Add Appointment</span>
          </button>
        )}
      </div>

      {reminderToast && (
        <div className="bg-purple-50 border border-purple-300 text-purple-900 px-4 py-3 rounded-2xl flex items-center gap-3 animate-in fade-in">
          <Bell className="w-5 h-5 text-purple-700 shrink-0" />
          <span className="text-sm font-semibold">{reminderToast}</span>
        </div>
      )}

      {/* Appointment Cards List */}
      <div className="space-y-5">
        {appointments.map((apt) => (
          <div
            key={apt.id}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-4"
          >
            {/* Top header row */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base sm:text-lg font-black font-mono text-purple-950 bg-purple-100 px-3.5 py-1.5 rounded-xl border border-purple-300 flex items-center gap-1.5 shadow-2xs">
                    <Calendar className="w-4 h-4 text-purple-700" />
                    <span>{apt.date}</span>
                    <span className="text-purple-400">·</span>
                    <span className="text-purple-900 bg-white/90 px-2 py-0.5 rounded-lg border border-purple-200">
                      {apt.time}
                    </span>
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {apt.type}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mt-2">
                  {apt.doctor}
                </h3>
                <p className="text-base font-semibold text-purple-950 mt-0.5">
                  {apt.specialty}
                </p>

                <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800">{apt.clinic}</span>
                </p>
                <p className="text-xs text-slate-500 ml-5">
                  {apt.locationAddress}
                </p>

                {apt.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 mt-2 italic">
                    Note: {apt.notes}
                  </p>
                )}
              </div>

              {/* Top right reminder & actions */}
              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5 text-purple-600" />
                  <span>Reminder: {apt.reminder}</span>
                </div>

                {isCaregiverAuthenticated && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(apt)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                      aria-label="Edit Appointment"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-purple-700" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(apt.id, apt.doctor)}
                      className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1 transition-colors"
                      aria-label="Delete Appointment"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom action row: [ View Details ] [ Open Google Maps ] [ Call Clinic ] [ Set Reminder ] */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedAppointment(apt)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>View Details</span>
              </button>

              <button
                type="button"
                onClick={() => openGoogleMaps(apt.clinic, apt.locationAddress)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() =>
                  startCall({
                    name: apt.clinic,
                    relationship: `Doctor / Clinic (${apt.doctor})`,
                    phone: apt.phone,
                    type: 'doctor',
                  })
                }
                className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call Clinic</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetReminderNotification(apt)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl border border-purple-200 hover:bg-purple-50 text-purple-800 font-bold text-xs flex items-center gap-1.5 transition-colors ml-auto sm:ml-0"
              >
                <Bell className="w-3.5 h-3.5 text-purple-700" />
                <span>Remind Me</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-8 shadow-2xl border border-slate-100 max-h-[92dvh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedAppointment(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900">
              {selectedAppointment.doctor}
            </h3>
            <p className="text-base font-semibold text-purple-900 mt-0.5">
              {selectedAppointment.specialty}
            </p>

            <div className="mt-4 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm">
              <div>
                <span className="text-slate-400 font-semibold uppercase text-xs block">
                  Date & Time
                </span>
                <span className="font-bold text-slate-800 text-base">
                  {selectedAppointment.date} at {selectedAppointment.time}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-xs block">
                  Hospital / Clinic
                </span>
                <span className="font-bold text-slate-800">
                  {selectedAppointment.clinic}
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedAppointment.locationAddress}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-xs block">
                  Appointment Type
                </span>
                <span className="text-slate-700 font-medium">
                  {selectedAppointment.type}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-xs block">
                  Reminder Window
                </span>
                <span className="text-slate-700 font-medium">
                  {selectedAppointment.reminder}
                </span>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-xs block">
                    Preparation & Instructions
                  </span>
                  <span className="text-slate-700 italic">
                    {selectedAppointment.notes}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() =>
                  openGoogleMaps(
                    selectedAppointment.clinic,
                    selectedAppointment.locationAddress
                  )
                }
                className="w-full py-3.5 px-4 rounded-xl border border-slate-300 font-bold text-slate-800 hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5 text-emerald-700" />
                <span>Open in Google Maps</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const apt = selectedAppointment;
                  setSelectedAppointment(null);
                  startCall({
                    name: apt.clinic,
                    relationship: `Doctor (${apt.doctor})`,
                    phone: apt.phone,
                    type: 'doctor',
                  });
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <Phone className="w-5 h-5" />
                <span>Call Clinic ({selectedAppointment.phone})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Appointment Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl border border-slate-100 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Doctor / Provider Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.doctor}
                  placeholder="e.g. Dr. Ahmed, Dr. Sara Ahmed"
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Specialty
                  </label>
                  <input
                    type="text"
                    value={formData.specialty}
                    placeholder="e.g. Internal Medicine, Cardiology"
                    onChange={(e) =>
                      setFormData({ ...formData, specialty: e.target.value })
                    }
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Appointment Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-purple-600 bg-white"
                  >
                    <option value="Doctor appointment">Doctor appointment</option>
                    <option value="Hospital appointment">Hospital appointment</option>
                    <option value="Medical checkup">Medical checkup</option>
                    <option value="Dental appointment">Dental appointment</option>
                    <option value="Physiotherapy appointment">Physiotherapy appointment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Hospital / Clinic Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.clinic}
                  placeholder="e.g. NMC Royal Hospital Abu Dhabi, Cleveland Clinic"
                  onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Location Address
                </label>
                <input
                  type="text"
                  value={formData.locationAddress}
                  placeholder="e.g. Khalifa City, Abu Dhabi, UAE"
                  onChange={(e) =>
                    setFormData({ ...formData, locationAddress: e.target.value })
                  }
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.date}
                    placeholder="e.g. October 5, Wednesday 7 Oct"
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    placeholder="e.g. 4:00 PM"
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    placeholder="e.g. +971 2 633 2255"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Reminder Time
                  </label>
                  <select
                    value={formData.reminder}
                    onChange={(e) =>
                      setFormData({ ...formData, reminder: e.target.value })
                    }
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-purple-600 bg-white"
                  >
                    <option value="30 minutes before">30 minutes before</option>
                    <option value="1 hour before">1 hour before</option>
                    <option value="2 hours before">2 hours before</option>
                    <option value="1 day before">1 day before</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Preparation Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  placeholder="e.g. Fast 8 hours prior, bring previous lab test results"
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[46px] rounded-xl border border-slate-300 font-bold text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[46px] rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingAppointment ? 'Update Appointment' : 'Save Appointment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Iframe & Web Safe) */}
      {deletingApt && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Cancel Appointment?</h3>
              <p className="text-sm text-slate-600 mt-1">
                Are you sure you want to remove the appointment with <strong>{deletingApt.doctor}</strong>?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingApt(null)}
                className="min-h-[46px] rounded-xl border border-slate-300 font-bold text-sm text-slate-700 hover:bg-slate-50"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="min-h-[46px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
