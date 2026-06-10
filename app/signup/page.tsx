'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { verifyAndRegisterUser } from '@/lib/actions/register';
import { sendPhoneOTP } from '@/lib/actions/auth-action'; // MAKE SURE THIS IMPORT MATCHES YOUR PATH
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

const SIGNUP_IMAGE = "https://images.unsplash.com/photo-1657816925116-9bbb2a45fb6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjb252ZW50aW9uJTIwaGFsbCUyMGRhcmslMjBtb2Rlcm4lMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzY3NTYxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080";

export default function SignUp() {
  const router = useRouter();

  // Basic UI States
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // New OTP Two-Step Flow States
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  // --- HANDLER 1: Request OTP ---
  const handleRequestOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const phoneNumber = formData.get("phoneNumber") as string;

    // Save the form data in React state so we don't lose it
    setPendingFormData(formData);

    // Call the SMS Gateway Server Action to send the text
    const result = await sendPhoneOTP(phoneNumber);

    if (result.success) {
      setIsOtpMode(true); // Switch the UI to show the OTP input
    } else {
      setError(result.message || "Failed to send OTP.");
    }
    setLoading(false);
  };

  // --- HANDLER 2: Verify OTP & Register ---
  const handleVerifyAndRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pendingFormData || !otp) return;

    setLoading(true);
    setError("");

    const phoneNumber = pendingFormData.get("phoneNumber") as string;
    const password = pendingFormData.get("password") as string;

    // 1. Call the Registration Action with the OTP
    const result = await verifyAndRegisterUser(pendingFormData, otp);

    if (result.error) {
      setError(result.error);
      console.log("Registration Error:", result.error);
      setLoading(false);
      return;
    }

    // 2. Auto-Login using Auth.js Password Provider
    const loginResult = await signIn("password-login", {
      identifier: phoneNumber,
      password: password,
      redirect: false,
    });

    if (loginResult?.error) {
      setError("Account created, but auto-login failed. Please go to login page.");
      console.log("Login Error:", loginResult.error);
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] font-sans flex items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-[#3B82F6]/30">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#3B82F6] rounded-full blur-[200px] opacity-[0.07]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-[#3B82F6] rounded-full blur-[180px] opacity-[0.05]" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[900px] rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-[0_0_80px_rgba(0,0,0,0.6)] border border-white/[0.06]"
      >
        {/* ── Left: Image Panel ── */}
        <div className="hidden lg:block lg:w-[420px] xl:w-[460px] relative overflow-hidden shrink-0 order-last lg:order-first">
          <img
            src={SIGNUP_IMAGE}
            alt="Premium convention hall"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/30 to-transparent" />
          <div className="absolute inset-0 bg-[#3B82F6]/5" />

          {/* Bottom overlay text */}
          <div className="absolute bottom-10 left-8 right-8">
            <p className="font-heading mb-2" style={{ fontSize: '1.6rem', fontWeight: 600, lineHeight: '1.25', color: '#ffffff' }}>
              Start your journey.
            </p>
            <p className="text-[#9CA3AF] text-sm leading-relaxed">
              Join our curated network of premium venues and connect with the world's best-in-class spaces.
            </p>
          </div>
        </div>

        {/* ── Right: Form Panel ── */}
        <div className="flex-1 bg-[#111111] px-8 py-10 sm:px-12 sm:py-14 flex flex-col justify-center min-h-[580px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10 group w-fit">
            <ImageWithFallback
              src="/imports/jilanihome_logo.jpg"
              alt="Jilani Home"
              className="w-9 h-9 rounded-lg object-cover"
            />
            <span className="font-heading font-bold text-white text-lg tracking-wide group-hover:text-[#3B82F6] transition-colors">
              Jilani Home
            </span>
          </Link>

          {/* Back to Home */}
          <Link href="/"
            className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-white transition-colors mb-6 w-fit"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Home
          </Link>

          {/* Heading */}
          <h1 className="font-heading text-white mb-1.5" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: '1.2' }}>
            Create an account.
          </h1>
          <p className="text-[#6B7280] mb-8 text-sm">Join Jilani Home to start discovering premium spaces</p>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* Conditionally Render Step 1 or Step 2 */}
          {!isOtpMode ? (
            // ==========================================
            // STEP 1: INITIAL DETAILS FORM
            // ==========================================
            <>
              <form className="space-y-4" onSubmit={handleRequestOTP}>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#9CA3AF]">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="John Doe"
                    className="w-full bg-[#1A1A1A] border border-white/[0.08] rounded-xl py-3 px-4 text-white placeholder-[#4B5563] text-sm focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/60 focus:border-[#3B82F6]/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#9CA3AF]">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    required
                    placeholder="017XXXXXXXX"
                    className="w-full bg-[#1A1A1A] border border-white/[0.08] rounded-xl py-3 px-4 text-white placeholder-[#4B5563] text-sm focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/60 focus:border-[#3B82F6]/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#9CA3AF]">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className="w-full bg-[#1A1A1A] border border-white/[0.08] rounded-xl py-3 px-4 text-white placeholder-[#4B5563] text-sm focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/60 focus:border-[#3B82F6]/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#9CA3AF]">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      placeholder="Create a strong password"
                      className="w-full bg-[#1A1A1A] border border-white/[0.08] rounded-xl py-3 px-4 pr-11 text-white placeholder-[#4B5563] text-sm focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/60 focus:border-[#3B82F6]/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                >
                  {loading ? "Sending Code..." : "Continue"}
                  {!loading && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/[0.07]" />
                <span className="text-[#4B5563] text-[11px] font-medium tracking-widest uppercase">Or sign up with</span>
                <div className="flex-1 h-px bg-white/[0.07]" />
              </div>

              {/* Google */}
              <button
                type="button"
                className="w-full bg-[#1A1A1A] cursor-pointer hover:bg-[#222222] border border-white/[0.08] text-[#D1D5DB] text-sm font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2.5"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              >
                <GoogleIcon />
                Sign up with Google
              </button>
            </>
          ) : (
            // ==========================================
            // STEP 2: OTP VERIFICATION FORM
            // ==========================================
            <form className="space-y-6" onSubmit={handleVerifyAndRegister}>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-[#9CA3AF] leading-relaxed backdrop-blur-sm">
                Please check your SMS. We have sent a 6-digit verification code to{' '}
                <span className="text-white font-semibold">{pendingFormData?.get("phoneNumber") as string}</span>.
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#9CA3AF]">Enter 6-Digit Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className="w-full bg-[#1A1A1A] border border-white/[0.08] rounded-xl py-3 px-4 text-white placeholder-[#4B5563] text-sm text-center tracking-widest text-2xl focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/60 focus:border-[#3B82F6]/50 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
              >
                {loading ? "Verifying..." : "Verify & Create Account"}
              </button>

              <button
                type="button"
                onClick={() => setIsOtpMode(false)}
                className="w-full text-center text-sm text-[#6B7280] hover:text-white transition-colors"
              >
                Cancel and edit details
              </button>
            </form>
          )}

          <p className="text-xs text-[#4B5563] text-center mt-6 leading-relaxed">
            By continuing, you agree to Jilani Home's{' '}
            <a href="#" className="text-[#6B7280] hover:text-white underline underline-offset-2 transition-colors">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-[#6B7280] hover:text-white underline underline-offset-2 transition-colors">Privacy Policy</a>.
          </p>

          <p className="text-center text-sm text-[#6B7280] mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-white font-semibold hover:text-[#3B82F6] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
