import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/Logo';
import {
  Fingerprint,
  Eye,
  EyeOff,
  Lock,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
  Heart,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ChevronLeft,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginAsElderly, unlockCaregiverMode, openFingerprintAuth, registerTemporaryUser } = useApp();

  const [authMode, setAuthMode] = useState<'welcome' | 'signin' | 'signup' | 'forgot'>('signin');

  // Sign In State
  const [signInIdentifier, setSignInIdentifier] = useState('+971 50 111 2233');
  const [signInPassword, setSignInPassword] = useState('••••••••');
  const [signInRole, setSignInRole] = useState<'elderly' | 'caregiver'>('elderly');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpIdentifier, setSignUpIdentifier] = useState('+971 50 ');
  const [signUpCity, setSignUpCity] = useState('Abu Dhabi');
  const [signUpAge, setSignUpAge] = useState('72');
  const [signUpRelativeName, setSignUpRelativeName] = useState('Mariam Ahmed');
  const [signUpRelationship, setSignUpRelationship] = useState('Daughter');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState<'elderly' | 'caregiver'>('elderly');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // Forgot Password State
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState<'enter_id' | 'code_sent' | 'reset_done'>('enter_id');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Handle Sign In Submit
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);

    if (!signInIdentifier.trim()) {
      setSignInError('Please enter your phone number or email.');
      return;
    }
    if (!signInPassword) {
      setSignInError('Please enter your password or PIN.');
      return;
    }

    if (signInRole === 'caregiver') {
      unlockCaregiverMode();
    } else {
      loginAsElderly();
    }
  };

  // Handle Sign Up Submit
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

    if (!signUpName.trim()) {
      setSignUpError('Please enter your full name.');
      return;
    }
    if (!signUpIdentifier.trim() || signUpIdentifier.length < 5) {
      setSignUpError('Please enter a valid phone number or email.');
      return;
    }
    if (signUpPassword.length < 6) {
      setSignUpError('Password must be at least 6 characters long.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError('Passwords do not match. Please re-enter.');
      return;
    }

    setSignUpSuccess(true);
    setTimeout(() => {
      registerTemporaryUser({
        name: signUpName.trim(),
        role: signUpRole,
        identifier: signUpIdentifier.trim(),
        city: signUpCity,
        age: parseInt(signUpAge, 10) || 72,
        relativeName: signUpRole === 'caregiver' ? signUpRelativeName.trim() : undefined,
        relationship: signUpRole === 'caregiver' ? signUpRelationship : undefined,
      });
    }, 1000);
  };

  // Handle Forgot Password
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (forgotStep === 'enter_id') {
      if (!forgotIdentifier.trim()) {
        setForgotError('Please enter your registered phone number or email.');
        return;
      }
      setForgotStep('code_sent');
    } else if (forgotStep === 'code_sent') {
      if (resetCode.trim() !== '1234' && resetCode.trim() !== '9988' && resetCode.length < 4) {
        setForgotError('Invalid code. Please enter 1234 to proceed in demo mode.');
        return;
      }
      if (newPassword.length < 6) {
        setForgotError('New password must be at least 6 characters.');
        return;
      }
      setForgotStep('reset_done');
      setTimeout(() => {
        setAuthMode('signin');
        setForgotStep('enter_id');
      }, 1500);
    }
  };

  const handleFingerprintLogin = () => {
    openFingerprintAuth({
      title: `${signInRole === 'caregiver' ? 'Caregiver' : 'Senior User'} Biometric Sign In`,
      onSuccess: () => {
        if (signInRole === 'caregiver') {
          unlockCaregiverMode();
        } else {
          loginAsElderly();
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/60 via-slate-50 to-white flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-6">
        {/* App Logo */}
        <div className="flex justify-center">
          <Logo size="lg" showSubtitle={true} variant="vertical" />
        </div>

        {/* Primary Sign In / Sign Up Mode Selector */}
        {authMode !== 'welcome' && authMode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className={`min-h-[44px] py-2 px-3 rounded-xl text-sm sm:text-base font-bold transition-all ${
                authMode === 'signin'
                  ? 'bg-white text-teal-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`min-h-[44px] py-2 px-3 rounded-xl text-sm sm:text-base font-bold transition-all ${
                authMode === 'signup'
                  ? 'bg-white text-teal-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* ============================================== */}
        {/* SCREEN 1: WELCOME SCREEN */}
        {/* ============================================== */}
        {authMode === 'welcome' && (
          <div className="space-y-6 text-center animate-in fade-in">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome to ElderCare
              </h1>
              <p className="text-base text-slate-600">
                A compassionate daily health companion and family care connection for seniors.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="min-h-[52px] w-full px-6 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98"
              >
                <span>Sign In to Your Account</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className="min-h-[52px] w-full px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-base flex items-center justify-center gap-2 transition-colors"
              >
                <User className="w-5 h-5 text-teal-700" />
                <span>Create New Account</span>
              </button>
            </div>

            {/* Quick Demo Shortcuts */}
            <div className="border-t border-slate-100 pt-4 space-y-2 text-left">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center">
                Instant Demo Access
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => loginAsElderly()}
                  className="p-3 rounded-2xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100 text-left transition-colors"
                >
                  <span className="text-xs font-bold text-teal-900 block">Senior User</span>
                  <span className="text-xs text-teal-700">Mariam Ahmed</span>
                </button>
                <button
                  type="button"
                  onClick={() => unlockCaregiverMode()}
                  className="p-3 rounded-2xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-left transition-colors"
                >
                  <span className="text-xs font-bold text-amber-900 block">Family Caregiver</span>
                  <span className="text-xs text-amber-700">Aisha (PIN 1234)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* SCREEN 2: SIGN IN SCREEN */}
        {/* ============================================== */}
        {authMode === 'signin' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAuthMode('welcome')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h2 className="text-xl font-bold text-slate-900">Sign In</h2>
              <div className="w-10" />
            </div>

            {/* Role Segmented Selection */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setSignInRole('elderly')}
                className={`min-h-[44px] py-2 px-3 rounded-xl text-sm font-bold transition-all ${
                  signInRole === 'elderly'
                    ? 'bg-white text-teal-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Senior User
              </button>
              <button
                type="button"
                onClick={() => setSignInRole('caregiver')}
                className={`min-h-[44px] py-2 px-3 rounded-xl text-sm font-bold transition-all ${
                  signInRole === 'caregiver'
                    ? 'bg-white text-teal-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Caregiver
              </button>
            </div>

            {signInError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{signInError}</span>
              </div>
            )}

            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  Phone Number or Email
                </label>
                <input
                  type="text"
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="+971 50 XXX XXXX or email"
                  required
                  className="w-full min-h-[48px] px-4 rounded-xl border border-slate-300 text-base font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-bold text-slate-800">
                    {signInRole === 'caregiver' ? 'Caregiver PIN / Password' : 'Password / PIN'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="text-xs font-bold text-teal-700 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                    className="w-full min-h-[48px] px-4 pr-12 rounded-xl border border-slate-300 text-base font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSignInPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="min-h-[50px] w-full px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98"
              >
                <span>Sign In as {signInRole === 'caregiver' ? 'Caregiver' : 'Senior User'}</span>
              </button>

              {/* Fingerprint Biometric UI */}
              <button
                type="button"
                onClick={handleFingerprintLogin}
                className="min-h-[48px] w-full px-4 py-2.5 rounded-2xl border-2 border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Fingerprint className="w-5 h-5 text-teal-700" />
                <span>Sign In with Fingerprint / Face ID</span>
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="font-bold text-teal-700 hover:underline"
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* SCREEN 3: SIGN UP SCREEN */}
        {/* ============================================== */}
        {authMode === 'signup' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAuthMode('welcome')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h2 className="text-xl font-bold text-slate-900">Create Account</h2>
              <div className="w-10" />
            </div>

            {/* Role setup */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Account Type
              </label>
              <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setSignUpRole('elderly')}
                  className={`min-h-[44px] py-2 px-3 rounded-xl text-sm font-bold transition-all ${
                    signUpRole === 'elderly'
                      ? 'bg-white text-teal-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Senior User
                </button>
                <button
                  type="button"
                  onClick={() => setSignUpRole('caregiver')}
                  className={`min-h-[44px] py-2 px-3 rounded-xl text-sm font-bold transition-all ${
                    signUpRole === 'caregiver'
                      ? 'bg-white text-teal-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Caregiver
                </button>
              </div>
            </div>

            {signUpError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{signUpError}</span>
              </div>
            )}

            {signUpSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Account created successfully! Logging you in...</span>
              </div>
            )}

            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              {/* Temporary Session Notice */}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 leading-relaxed flex items-start gap-2">
                <span className="text-teal-700 font-bold text-sm leading-none shrink-0 mt-0.5">ℹ️</span>
                <span>
                  <strong>Temporary Session:</strong> Signing up saves your information temporarily in-memory for this browsing session. When you refresh the browser, this data will be deleted and reset.
                </span>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder={signUpRole === 'caregiver' ? 'e.g. Aisha Ahmed' : 'e.g. Mariam Ahmed'}
                  required
                  className="w-full min-h-[48px] px-4 rounded-xl border border-slate-300 text-base font-medium"
                />
              </div>

              {/* Role-specific fields */}
              {signUpRole === 'elderly' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="120"
                      value={signUpAge}
                      onChange={(e) => setSignUpAge(e.target.value)}
                      className="w-full min-h-[48px] px-4 rounded-xl border border-slate-300 text-base font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      City in UAE
                    </label>
                    <select
                      value={signUpCity}
                      onChange={(e) => setSignUpCity(e.target.value)}
                      className="w-full min-h-[48px] px-3 rounded-xl border border-slate-300 text-base font-medium bg-white"
                    >
                      <option value="Abu Dhabi">Abu Dhabi</option>
                      <option value="Dubai">Dubai</option>
                      <option value="Sharjah">Sharjah</option>
                      <option value="Ajman">Ajman</option>
                      <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                      <option value="Fujairah">Fujairah</option>
                      <option value="Al Ain">Al Ain</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Senior Loved One's Name
                    </label>
                    <input
                      type="text"
                      value={signUpRelativeName}
                      onChange={(e) => setSignUpRelativeName(e.target.value)}
                      placeholder="e.g. Mariam Ahmed"
                      className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm font-medium bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Your Relationship
                      </label>
                      <select
                        value={signUpRelationship}
                        onChange={(e) => setSignUpRelationship(e.target.value)}
                        className="w-full min-h-[44px] px-2 rounded-xl border border-slate-300 text-sm font-medium bg-white"
                      >
                        <option value="Daughter">Daughter</option>
                        <option value="Son">Son</option>
                        <option value="Grandchild">Grandchild</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Nurse / Caregiver">Nurse / Caregiver</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        City
                      </label>
                      <select
                        value={signUpCity}
                        onChange={(e) => setSignUpCity(e.target.value)}
                        className="w-full min-h-[44px] px-2 rounded-xl border border-slate-300 text-sm font-medium bg-white"
                      >
                        <option value="Abu Dhabi">Abu Dhabi</option>
                        <option value="Dubai">Dubai</option>
                        <option value="Sharjah">Sharjah</option>
                        <option value="Al Ain">Al Ain</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  Phone Number or Email *
                </label>
                <input
                  type="text"
                  value={signUpIdentifier}
                  onChange={(e) => setSignUpIdentifier(e.target.value)}
                  placeholder="+971 50 XXX XXXX or email"
                  required
                  className="w-full min-h-[48px] px-4 rounded-xl border border-slate-300 text-base font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  Password (min 6 characters) *
                </label>
                <div className="relative">
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    className="w-full min-h-[48px] px-4 pr-12 rounded-xl border border-slate-300 text-base font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSignUpPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  Confirm Password *
                </label>
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  required
                  className="w-full min-h-[48px] px-4 rounded-xl border border-slate-300 text-base font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={signUpSuccess}
                className="min-h-[50px] w-full px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98 mt-2"
              >
                <span>Complete Registration</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-sm text-slate-600">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="font-bold text-teal-700 hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* SCREEN 4: FORGOT PASSWORD */}
        {/* ============================================== */}
        {authMode === 'forgot' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <h2 className="text-xl font-bold text-slate-900">Reset Password</h2>
              <div className="w-10" />
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotStep === 'enter_id' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-sm text-slate-600">
                  Enter your registered mobile number or email address to receive a secure recovery code.
                </p>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">
                    Phone or Email
                  </label>
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="+971 50 XXX XXXX or email"
                    required
                    className="w-full min-h-[48px] px-4 rounded-xl border border-slate-300 text-base font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-[50px] w-full px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-base shadow-xs"
                >
                  Send Recovery Code
                </button>
              </form>
            )}

            {forgotStep === 'code_sent' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-800">
                  A verification code was sent to <strong>{forgotIdentifier}</strong>. (For demo verification, enter code <strong>1234</strong>)
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">
                    4-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="1234"
                    required
                    className="w-full min-h-[48px] px-4 rounded-xl border border-slate-300 text-center font-mono text-xl font-bold tracking-widest"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full min-h-[48px] px-4 rounded-xl border border-slate-300 text-base font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-[50px] w-full px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-base shadow-xs"
                >
                  Save New Password & Sign In
                </button>
              </form>
            )}

            {forgotStep === 'reset_done' && (
              <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-xl font-bold text-emerald-950">Password Reset Successful</h3>
                <p className="text-sm text-emerald-800">
                  Your password has been updated. Returning you to Sign In...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
