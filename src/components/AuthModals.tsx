import React, { useState } from 'react';
import { Check, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { MANILA_DISTRICTS } from '../data/seedData';
import { DEMO_USER, isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types/pawpath';

interface AuthModalsProps {
  mode: 'login' | 'signup' | null;
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'signup') => void;
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModals: React.FC<AuthModalsProps> = ({
  mode,
  onClose,
  onSwitchMode,
  onAuthSuccess,
}) => {
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup state
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('+63');
  const [district, setDistrict] = useState('Sampaloc');
  const [barangay, setBarangay] = useState('');
  const [isAdultConfirmed, setIsAdultConfirmed] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Interactive Captcha state
  const [captchaA, setCaptchaA] = useState(() => Math.floor(Math.random() * 8) + 2);
  const [captchaB, setCaptchaB] = useState(() => Math.floor(Math.random() * 7) + 1);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!mode) return null;

  const refreshCaptcha = () => {
    setCaptchaA(Math.floor(Math.random() * 8) + 2);
    setCaptchaB(Math.floor(Math.random() * 7) + 1);
    setCaptchaInput('');
    setCaptchaVerified(false);
  };

  const handleVerifyCaptcha = () => {
    if (Number(captchaInput.trim()) === captchaA + captchaB) {
      setCaptchaVerified(true);
      setError('');
    } else {
      setCaptchaVerified(false);
      setError('Captcha answer is incorrect. Please try again.');
    }
  };

  const handleDemoLogin = () => {
    onAuthSuccess(DEMO_USER);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    if (supabase && isSupabaseConfigured) {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (authErr) {
        setLoading(false);
        setError(authErr.message);
        return;
      }
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        setLoading(false);
        onAuthSuccess({
          id: data.user.id,
          fullName: profile?.full_name || loginEmail.split('@')[0],
          email: data.user.email || loginEmail,
          mobile: profile?.mobile || '+63 917 000 0000',
          age: profile?.age || 25,
          district: profile?.district || 'Sampaloc',
          barangay: profile?.barangay || 'Manila',
          role: (profile?.role as UserProfile['role']) || 'citizen',
        });
        return;
      }
    }

    // Hybrid local fallback login
    setLoading(false);
    const derivedName = loginEmail.includes('cinna')
      ? 'Cinna Moroll'
      : loginEmail
          .split('@')[0]
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

    onAuthSuccess({
      id: `local-${Date.now()}`,
      fullName: derivedName || 'Manila Citizen',
      email: loginEmail.trim(),
      mobile: '+63 917 555 0188',
      age: 25,
      district: 'Sampaloc',
      barangay: 'Barangay 402',
      role: 'citizen',
    });
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAge = Number(age);
    if (!fullName.trim()) {
      setError('Full Name or Organization Name is required.');
      return;
    }
    if (Number.isNaN(parsedAge) || parsedAge < 18) {
      setError('You must be at least 18 years old to register on PawPath Manila.');
      return;
    }
    if (!isAdultConfirmed) {
      setError('Please confirm that you are at least 18 years old.');
      return;
    }
    if (!captchaVerified) {
      setError('Please complete the human verification Captcha.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    if (supabase && isSupabaseConfigured) {
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (signUpErr) {
        setLoading(false);
        setError(signUpErr.message);
        return;
      }
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: fullName.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          age: parsedAge,
          is_adult_confirmed: true,
          district,
          barangay: barangay.trim() || `${district} Proper`,
          role: 'citizen',
        });
        setLoading(false);
        onAuthSuccess({
          id: data.user.id,
          fullName: fullName.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          age: parsedAge,
          district,
          barangay: barangay.trim() || `${district} Proper`,
          role: 'citizen',
        });
        return;
      }
    }

    setLoading(false);
    onAuthSuccess({
      id: `user-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      age: parsedAge,
      district,
      barangay: barangay.trim() || `${district} Proper`,
      role: 'citizen',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 my-auto max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#F7F8F4] text-[#5A635C] hover:text-[#1A1A1A] flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {mode === 'login' ? (
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1A1A1A]">Log In</h2>
            <p className="text-sm text-[#5A635C] mt-1">
              Access PawPath Animal Adoption &amp; Healthcare Dashboard.
            </p>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-[#FCE8E6] text-[#A50E0E] text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                  Email Address <span className="text-[#D9383A]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="juan@gmail.com"
                  className="w-full h-12 px-3.5 rounded-xl border border-[#E2E4DE] bg-white text-sm focus:outline-none focus:border-[#2D5A3C] focus:ring-2 focus:ring-[#2D5A3C]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1.5">
                  Password <span className="text-[#D9383A]">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-3.5 rounded-xl border border-[#E2E4DE] bg-white text-sm focus:outline-none focus:border-[#2D5A3C] focus:ring-2 focus:ring-[#2D5A3C]/15"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-[#2D5A3C] hover:bg-[#21432C] text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Log In'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full h-11 rounded-full border border-[#2D5A3C] text-[#2D5A3C] hover:bg-[#2D5A3C]/5 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>1-Click Demo Login (Cinna Moroll)</span>
              </button>
            </div>

            <p className="text-center text-xs text-[#5A635C] mt-5">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('signup')}
                className="text-[#2D5A3C] font-semibold hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        ) : (
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1A1A1A]">
              Create your PawPath Account
            </h2>
            <p className="text-sm text-[#5A635C] mt-1">
              Join Manila&apos;s centralized network for pet health, adoption, and reporting.
            </p>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-[#FCE8E6] text-[#A50E0E] text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSignupSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Full Name / Organization Name <span className="text-[#D9383A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Cinna Moroll or Tondo Animal Rescue"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E4DE] text-sm focus:outline-none focus:border-[#2D5A3C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                    Age <span className="text-[#D9383A]">*</span>
                  </label>
                  <input
                    type="number"
                    min={18}
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E4DE] text-sm focus:outline-none focus:border-[#2D5A3C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                    Mobile Number <span className="text-[#D9383A]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+63 917 xxx xxxx"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E4DE] text-sm focus:outline-none focus:border-[#2D5A3C]"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F7F8F4] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAdultConfirmed}
                  onChange={(e) => setIsAdultConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#2D5A3C] rounded"
                />
                <span className="text-xs text-[#1A1A1A] font-medium">
                  I confirm I am at least 18 years old and a resident or partner in Metro Manila.
                </span>
              </label>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Email Address <span className="text-[#D9383A]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan@gmail.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E2E4DE] text-sm focus:outline-none focus:border-[#2D5A3C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                    Manila District <span className="text-[#D9383A]">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#E2E4DE] bg-white text-sm focus:outline-none focus:border-[#2D5A3C]"
                  >
                    {MANILA_DISTRICTS.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                    Barangay
                  </label>
                  <input
                    type="text"
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    placeholder="e.g. Brgy 402"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E4DE] text-sm focus:outline-none focus:border-[#2D5A3C]"
                  />
                </div>
              </div>

              {/* Interactive Captcha */}
              <div className="p-3 rounded-xl bg-[#F7F8F4] border border-[#E2E4DE]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#1A1A1A]">
                    Human Verification (Captcha)
                  </span>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="text-xs text-[#2D5A3C] flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>New</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-white border border-[#E2E4DE] text-sm font-bold text-[#1A1A1A] tabular-nums">
                    {captchaA} + {captchaB} = ?
                  </span>
                  <input
                    type="number"
                    value={captchaInput}
                    onChange={(e) => {
                      setCaptchaInput(e.target.value);
                      setCaptchaVerified(false);
                    }}
                    placeholder="Answer"
                    className="w-24 h-9 px-2.5 rounded-lg border border-[#E2E4DE] bg-white text-sm focus:outline-none focus:border-[#2D5A3C]"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCaptcha}
                    className={`h-9 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      captchaVerified
                        ? 'bg-[#E6F4EA] text-[#137333]'
                        : 'bg-[#2D5A3C] text-white hover:bg-[#21432C]'
                    }`}
                  >
                    {captchaVerified ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </>
                    ) : (
                      <span>Verify</span>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                    Password <span className="text-[#D9383A]">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E4DE] text-sm focus:outline-none focus:border-[#2D5A3C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                    Confirm <span className="text-[#D9383A]">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E2E4DE] text-sm focus:outline-none focus:border-[#2D5A3C]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-[#2D5A3C] hover:bg-[#21432C] text-white font-semibold text-sm transition-colors shadow-sm mt-2"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-xs text-[#5A635C] mt-4">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('login')}
                className="text-[#2D5A3C] font-semibold hover:underline"
              >
                Log In
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
