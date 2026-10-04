import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Phone,
  HeartPulse,
  AlertTriangle,
  Pill,
  User,
  Activity,
  FileText,
} from 'lucide-react';

export const EmergencyView: React.FC = () => {
  const { profile, emergencyContacts, medications, startCall } = useApp();

  const uaeEmergencyServices = [
    {
      number: '998',
      service: 'Ambulance & Paramedics',
      arabic: 'الإسعاف',
      description: 'Immediate medical emergency, severe chest pain, shortness of breath, fall with injury',
      color: 'bg-rose-600 hover:bg-rose-700 text-white ring-rose-300',
      badge: 'Immediate Medical',
    },
    {
      number: '999',
      service: 'Police',
      arabic: 'الشرطة',
      description: 'Urgent public safety, immediate assistance, security emergency',
      color: 'bg-slate-900 hover:bg-slate-800 text-white ring-slate-400',
      badge: 'Public Safety',
    },
    {
      number: '997',
      service: 'Civil Defence (Fire & Rescue)',
      arabic: 'الدفاع المدني',
      description: 'Fire emergency, rescue, home hazard or gas smell',
      color: 'bg-amber-600 hover:bg-amber-700 text-white ring-amber-300',
      badge: 'Fire & Rescue',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 pb-28 lg:pb-24 space-y-6 sm:space-y-10">
      {/* Header */}
      <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-6 sm:p-8 flex items-start gap-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-rose-950 tracking-tight">
            UAE Emergency Assistance & SOS
          </h1>
          <p className="text-base text-rose-900 font-medium mt-1">
            Tap any service to call directly via your device dialer. Emergency calling does not require caregiver authentication.
          </p>
        </div>
      </div>

      {/* 1. UAE OFFICIAL EMERGENCY NUMBERS */}
      <section aria-labelledby="uae-numbers-heading" className="space-y-4">
        <h2 id="uae-numbers-heading" className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Official UAE Emergency Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {uaeEmergencyServices.map((srv) => (
            <div
              key={srv.number}
              className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {srv.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-serif">
                    {srv.arabic}
                  </span>
                </div>

                <div className="my-2">
                  <span className="text-4xl font-black font-mono tracking-tight text-slate-950 block">
                    {srv.number}
                  </span>
                  <span className="text-lg font-bold text-slate-800 block mt-0.5">
                    {srv.service}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {srv.description}
                </p>
              </div>

              {/* Working phone call link */}
              <a
                href={`tel:${srv.number}`}
                className={`w-full min-h-[52px] py-3.5 px-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2.5 transition-transform active:scale-98 shadow-md ${srv.color}`}
              >
                <Phone className="w-5 h-5 fill-current" />
                <span>Call {srv.number}</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 2. SAVED EMERGENCY CONTACTS */}
      <section aria-labelledby="saved-contacts-heading" className="space-y-4">
        <h2 id="saved-contacts-heading" className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Personal Emergency Contacts
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between gap-3"
            >
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase">
                  {contact.relationship}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {contact.name}
                </h3>
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
                className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-98"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>Call Now</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. EMERGENCY MEDICAL INFORMATION (HIGHLY READABLE) */}
      <section aria-labelledby="medical-passport-heading" className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 block">
              Emergency Responder Info
            </span>
            <h2 id="medical-passport-heading" className="text-2xl font-black text-slate-900">
              Mariam Ahmed — Medical Card
            </h2>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Abu Dhabi Resident · 74 Years Old
          </div>
        </div>

        {/* Four distinct highly readable sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Blood Type */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Blood Type
            </span>
            <span className="text-4xl font-black font-mono text-rose-600 block">
              {profile.bloodType}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Compatible donor blood type on record
            </span>
          </div>

          {/* Allergies */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Allergies
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.allergies.map((allergy) => (
                <span
                  key={allergy}
                  className="bg-rose-100 text-rose-900 font-bold px-3 py-1.5 rounded-xl text-base border border-rose-200"
                >
                  ⚠️ {allergy}
                </span>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Medical Conditions
            </span>
            <ul className="mt-2 space-y-1.5 text-base font-semibold text-slate-800">
              {profile.conditions.map((condition) => (
                <li key={condition} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0"></span>
                  <span>{condition}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Current Medications */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Active Prescribed Medications
            </span>
            <ul className="mt-2 space-y-1.5 text-base font-medium text-slate-800">
              {medications.map((m) => (
                <li key={m.id} className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-900">
                    💊 {m.name} {m.dosage}
                  </span>
                  <span className="text-slate-500 font-mono text-xs">{m.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Show this screen to UAE National Ambulance paramedics or hospital triage doctors if emergency care is required.
          </p>
        </div>
      </section>
    </div>
  );
};
