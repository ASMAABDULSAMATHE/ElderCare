import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Fingerprint, CheckCircle2, X } from 'lucide-react';

export const FingerprintModal: React.FC = () => {
  const { fingerprintModal, closeFingerprintAuth } = useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (fingerprintModal.isOpen) {
      setIsScanning(false);
      setIsVerified(false);
    }
  }, [fingerprintModal.isOpen]);

  if (!fingerprintModal.isOpen) return null;

  const handleSimulateTouch = () => {
    if (isScanning || isVerified) return;
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      setIsVerified(true);

      setTimeout(() => {
        if (fingerprintModal.onSuccessCallback) {
          fingerprintModal.onSuccessCallback();
        }
        closeFingerprintAuth();
      }, 900);
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fingerprint-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 relative">
        <button
          onClick={closeFingerprintAuth}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 id="fingerprint-title" className="text-2xl font-bold text-slate-900 mb-2">
          {fingerprintModal.title}
        </h2>

        <p className="text-base text-slate-600 mb-6">
          {isVerified
            ? 'Fingerprint verified'
            : isScanning
            ? 'Verifying fingerprint...'
            : fingerprintModal.description}
        </p>

        {/* Tactile Sensor Target */}
        <div className="flex justify-center my-6">
          <button
            type="button"
            onClick={handleSimulateTouch}
            disabled={isScanning || isVerified}
            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center relative transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-500/30 ${
              isVerified
                ? 'bg-emerald-500 text-white scale-105 shadow-xl shadow-emerald-500/30'
                : isScanning
                ? 'bg-teal-600 text-white animate-pulse shadow-xl shadow-teal-600/30 ring-8 ring-teal-100'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-700 active:scale-95 shadow-md border-2 border-teal-200'
            }`}
            aria-label="Touch fingerprint sensor"
          >
            {isVerified ? (
              <CheckCircle2 className="w-16 h-16 animate-in zoom-in-75 duration-200" />
            ) : (
              <Fingerprint className={`w-16 h-16 ${isScanning ? 'animate-pulse' : ''}`} />
            )}
          </button>
        </div>

        <p className="text-sm font-medium text-slate-500 mb-4">
          {isVerified ? (
            <span className="text-emerald-700 font-bold text-base">✓ Fingerprint verified</span>
          ) : (
            'Tap the sensor icon above to authenticate'
          )}
        </p>

        <button
          type="button"
          onClick={closeFingerprintAuth}
          className="w-full py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-base transition-colors"
        >
          Use Password or PIN Instead
        </button>

        <p className="text-[11px] text-slate-400 mt-4 leading-normal">
          Prototype biometric authentication preview. Device biometric prompts trigger when supported.
        </p>
      </div>
    </div>
  );
};
