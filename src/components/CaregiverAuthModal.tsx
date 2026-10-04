import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Eye, EyeOff, Fingerprint, X, ShieldCheck } from 'lucide-react';

interface CaregiverAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CaregiverAuthModal: React.FC<CaregiverAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { openFingerprintAuth } = useApp();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo PIN is 1234 or any non-empty PIN for testing
    if (pin === '1234' || pin === '0000' || pin.length >= 4) {
      setError(null);
      setPin('');
      onSuccess();
      onClose();
    } else {
      setError('Incorrect Caregiver PIN. Demo PIN is 1234');
    }
  };

  const handleFingerprintClick = () => {
    onClose();
    openFingerprintAuth({
      title: 'Caregiver Biometric Sign In',
      onSuccess: () => {
        onSuccess();
      },
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="caregiver-auth-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-8 h-8" />
        </div>

        <h2 id="caregiver-auth-title" className="text-2xl font-bold text-slate-900 mb-1">
          Caregiver Mode
        </h2>
        <p className="text-sm text-slate-600 mb-5">
          Please enter your caregiver PIN or authenticate with fingerprint to edit medical settings.
        </p>

        <form onSubmit={handleSubmit} className="w-full text-left space-y-4">
          <div>
            <label
              htmlFor="caregiver-pin"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Caregiver PIN / Password
            </label>
            <div className="relative">
              <input
                id="caregiver-pin"
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN (e.g. 1234)"
                autoFocus
                className="w-full py-3.5 px-4 pr-12 rounded-xl border-2 border-slate-200 focus:border-teal-600 focus:outline-none text-lg tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600"
                aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {error ? (
              <p className="text-xs font-semibold text-rose-600 mt-1.5">{error}</p>
            ) : (
              <p className="text-xs text-slate-400 mt-1.5">Demo PIN is: 1234</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-lg shadow-md transition-all active:scale-[0.98]"
          >
            Unlock Caregiver Portal
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-500 font-semibold tracking-wider">
              OR
            </span>
          </div>
        </div>

        {/* Biometric Fingerprint Button */}
        <button
          type="button"
          onClick={handleFingerprintClick}
          className="w-full py-3.5 px-4 rounded-2xl border-2 border-teal-200 hover:border-teal-400 bg-teal-50/50 hover:bg-teal-50 text-teal-800 font-bold text-base flex items-center justify-center gap-2.5 transition-colors"
        >
          <Fingerprint className="w-5 h-5 text-teal-700" />
          <span>🔐 Sign in with Fingerprint</span>
        </button>
      </div>
    </div>
  );
};
