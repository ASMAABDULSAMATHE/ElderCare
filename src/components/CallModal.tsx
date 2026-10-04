import React from 'react';
import { useApp } from '../context/AppContext';
import { Phone, X, ShieldAlert, Heart, User } from 'lucide-react';

export const CallModal: React.FC = () => {
  const { callModal, closeCall } = useApp();

  if (!callModal.isOpen) return null;

  // Clean phone number for tel: link (remove spaces)
  const telLink = `tel:${callModal.phone.replace(/\s+/g, '')}`;

  const isEmergency =
    callModal.type === 'emergency' ||
    callModal.phone === '999' ||
    callModal.phone === '998' ||
    callModal.phone === '997';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="call-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 flex flex-col items-center">
        {/* Contact Icon / Avatar */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
            isEmergency
              ? 'bg-rose-100 text-rose-600 animate-pulse'
              : callModal.type === 'loved_one'
              ? 'bg-amber-100 text-amber-600'
              : 'bg-teal-100 text-teal-700'
          }`}
        >
          {isEmergency ? (
            <ShieldAlert className="w-10 h-10" />
          ) : callModal.type === 'loved_one' ? (
            <Heart className="w-10 h-10 fill-current" />
          ) : (
            <Phone className="w-10 h-10" />
          )}
        </div>

        {/* Status Prompt */}
        <p className="text-sm font-semibold tracking-wide uppercase text-slate-500 mb-1">
          {isEmergency ? 'Emergency Call' : 'Calling Contact'}
        </p>

        {/* Display Actual Contact Name Prominently */}
        <h2 id="call-modal-title" className="text-2xl font-bold text-slate-900 mb-1 leading-snug">
          Calling {callModal.name}
        </h2>

        {/* Relationship */}
        {callModal.relationship && (
          <p className="text-base font-medium text-slate-600 mb-2">
            {callModal.relationship}
          </p>
        )}

        {/* Phone number */}
        <div className="bg-slate-50 px-4 py-2 rounded-xl text-lg font-bold font-mono tracking-wider text-slate-800 border border-slate-200 mb-6">
          {callModal.phone}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          {/* Working Phone Call Link (tel: schema) */}
          <a
            href={telLink}
            onClick={closeCall}
            className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-xl flex items-center justify-center gap-3 transition-transform active:scale-[0.98] shadow-lg ${
              isEmergency
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                : 'bg-teal-700 hover:bg-teal-800 shadow-teal-700/25'
            }`}
          >
            <Phone className="w-6 h-6 fill-current" />
            <span>CALL</span>
          </a>

          <button
            type="button"
            onClick={closeCall}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg transition-colors"
          >
            CANCEL
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-4">
          Tapping CALL opens your phone dialer directly.
        </p>
      </div>
    </div>
  );
};
