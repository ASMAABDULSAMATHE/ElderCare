import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Appointment, MealPlan } from '../types';
import {
  Calendar,
  Utensils,
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  FileText,
  X,
} from 'lucide-react';

export const PlansView: React.FC = () => {
  const { appointments, meals, startCall, setActiveTab } = useApp();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const openGoogleMaps = (locationName: string, address: string) => {
    const query = encodeURIComponent(`${locationName}, ${address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-10">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Appointments & Daily Meals
        </h1>
        <p className="text-base text-slate-500 mt-1">
          Review upcoming doctor visits, hospital locations, and today's planned nutrition.
        </p>
      </div>

      {/* 1. DOCTOR APPOINTMENTS SECTION */}
      <section aria-labelledby="appointments-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <h2 id="appointments-heading" className="text-xl sm:text-2xl font-bold text-slate-900">
            Doctor Appointments
          </h2>
        </div>

        <div className="space-y-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-black font-mono text-purple-950 bg-purple-100 px-3 py-1 rounded-xl border border-purple-300 whitespace-nowrap">
                      {apt.date} · {apt.time}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mt-2">
                    {apt.doctor}
                  </h3>
                  <p className="text-base font-semibold text-purple-900">
                    {apt.specialty}
                  </p>
                  <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{apt.clinic}</span>
                  </p>
                  <p className="text-xs text-slate-500 ml-5">
                    {apt.locationAddress}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                    Type
                  </span>
                  <span className="text-sm font-bold text-slate-700 block mt-0.5">
                    {apt.type}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Reminder: {apt.reminder}
                  </span>
                </div>
              </div>

              {/* Action Buttons: [ View ] [ Open Maps ] [ Call Clinic ] */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedAppointment(apt)}
                  className="min-h-[46px] px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-sm flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => openGoogleMaps(apt.clinic, apt.locationAddress)}
                  className="min-h-[46px] px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm flex items-center gap-2 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>Open Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    startCall({
                      name: apt.clinic,
                      relationship: `Clinic (${apt.doctor})`,
                      phone: apt.phone,
                      type: 'doctor',
                    })
                  }
                  className="min-h-[46px] px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm flex items-center gap-2 transition-colors ml-auto sm:ml-0"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Clinic</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. MEALS SECTION */}
      <section aria-labelledby="meals-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <Utensils className="w-5 h-5" />
          </div>
          <h2 id="meals-heading" className="text-xl sm:text-2xl font-bold text-slate-900">
            Daily Meals & Preferences
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-950 bg-amber-100 px-3.5 py-1.5 rounded-xl border border-amber-300 shadow-2xs whitespace-nowrap">
                    {meal.title}
                  </span>
                  <span className="text-sm sm:text-base font-black font-mono text-amber-950 bg-amber-100 px-3.5 py-1.5 rounded-xl border border-amber-300 shadow-2xs whitespace-nowrap shrink-0">
                    {meal.time}
                  </span>
                </div>

                <p className="text-base text-slate-800 font-medium mt-2 leading-snug">
                  {meal.description}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wide block">
                    Food Preferences:
                  </span>
                  <span className="text-slate-700 font-medium">{meal.preferences}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wide block">
                    Allergen Notes:
                  </span>
                  <span className="text-rose-700 font-semibold">{meal.allergens}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
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
                <span className="text-slate-400 font-semibold uppercase text-xs block">Date & Time</span>
                <span className="font-bold text-slate-800 text-base">{selectedAppointment.date} at {selectedAppointment.time}</span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-xs block">Hospital / Clinic</span>
                <span className="font-bold text-slate-800">{selectedAppointment.clinic}</span>
                <p className="text-xs text-slate-500 mt-0.5">{selectedAppointment.locationAddress}</p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-xs block">Visit Reason</span>
                <span className="text-slate-700">{selectedAppointment.type}</span>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-xs block">Caregiver Instructions</span>
                  <span className="text-slate-700 italic">{selectedAppointment.notes}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  openGoogleMaps(selectedAppointment.clinic, selectedAppointment.locationAddress);
                }}
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
                    relationship: `Clinic (${apt.doctor})`,
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
    </div>
  );
};
