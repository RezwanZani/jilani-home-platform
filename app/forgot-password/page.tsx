'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle2, Lock } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { sendForgotPasswordOTP, resetPasswordWithOTP } from '@/lib/actions/auth-action';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [isLoading, setIsLoading] = useState(false);

  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      toast.error('Please enter your email or phone number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendForgotPasswordOTP(identifier);
      if (res.success) {
        toast.success(res.message);
        setStep('verify');
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPasswordWithOTP(identifier, otp, newPassword);
      if (res.success) {
        toast.success(res.message);
        setStep('success');
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] font-sans flex items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-[#3B82F6]/30">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-[#3B82F6] rounded-full blur-[220px] opacity-[0.06] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[460px] rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)] border border-white/[0.06] bg-[#111111]"
      >
        <div className="px-8 py-10 sm:px-12 sm:py-14">
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

          {step === 'request' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h1 className="font-heading text-white mb-1.5" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: '1.2' }}>
                Reset password.
              </h1>
              <p className="text-[#6B7280] mb-8 text-sm leading-relaxed">
                Enter your email address or phone number and we'll send you a verification code to reset your password.
              </p>

              <form className="space-y-4" onSubmit={handleRequestOTP}>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#9CA3AF]">Email or Phone Number</label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@example.com or 01XXXXXXXXX"
                    disabled={isLoading}
                    className="w-full bg-[#1A1A1A] border border-white/[0.08] rounded-xl py-3 px-4 text-white placeholder-[#4B5563] text-sm focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/60 focus:border-[#3B82F6]/50 transition-all disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Code'}
                  {!isLoading && <Send className="w-4 h-4" />}
                </button>
              </form>
            </motion.div>
          )}

          {step === 'verify' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h1 className="font-heading text-white mb-1.5" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: '1.2' }}>
                Enter Code.
              </h1>
              <p className="text-[#6B7280] mb-8 text-sm leading-relaxed">
                We've sent a 6-digit code to <strong>{identifier}</strong>. Enter it below to create a new password.
              </p>

              <form className="space-y-4" onSubmit={handleResetPassword}>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#9CA3AF]">Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    disabled={isLoading}
                    className="w-full bg-[#1A1A1A] border border-white/[0.08] rounded-xl py-3 px-4 text-white placeholder-[#4B5563] text-sm focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/60 focus:border-[#3B82F6]/50 transition-all text-center tracking-[0.5em] disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#9CA3AF]">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full bg-[#1A1A1A] border border-white/[0.08] rounded-xl py-3 px-4 text-white placeholder-[#4B5563] text-sm focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/60 focus:border-[#3B82F6]/50 transition-all disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                  {!isLoading && <Lock className="w-4 h-4" />}
                </button>
              </form>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-4"
            >
              <div className="w-14 h-14 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
              </div>
              <h2 className="font-heading text-white mb-2" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                Password Reset!
              </h2>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-8">
                Your password has been successfully reset. You can now use your new password to log in.
              </p>

              <Link href="/login"
                className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                Go to Sign In
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </motion.div>
          )}

          <div className="flex items-center justify-center mt-8">
            <Link href="/login"
              className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
