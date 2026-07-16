"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/services/api.service';
import { User, Lock, Save, Loader2, CheckCircle, Shield } from 'lucide-react';

export default function AccountSettings() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await axiosInstance.patch('/users/profile', { firstName, lastName });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    setIsSaving(true);
    try {
      await axiosInstance.patch('/users/password', { currentPassword, newPassword });
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = `${user?.firstName?.[0] || 'A'}${user?.lastName?.[0] || 'B'}`.toUpperCase();

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">Account Settings</h2>
        <p className="text-foreground/60 font-light text-sm">Manage your profile, security credentials, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-4">
          <div className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0066CC] to-[#00D6FF] shadow-[0_0_30px_rgba(0,102,204,0.3)] mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white">
              {initials}
            </div>
            <h3 className="text-lg font-semibold text-foreground">{user?.firstName} {user?.lastName}</h3>
            <p className="text-sm text-foreground/50 font-light">{user?.email}</p>
            <div className="flex items-center justify-center gap-1.5 mt-3 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full mx-auto w-fit">
              <Shield className="w-3 h-3 text-accent" />
              <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          {/* Profile Info Form */}
          <form onSubmit={handleProfileSave} className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                <User className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">Profile Information</h3>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-foreground/50 font-semibold uppercase tracking-wider mb-2">First Name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-xs text-foreground/50 font-semibold uppercase tracking-wider mb-2">Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-foreground/50 font-semibold uppercase tracking-wider mb-2">Email</label>
              <input type="email" value={email} disabled
                className="w-full bg-background border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-foreground/50 cursor-not-allowed" />
            </div>

            <button type="submit" disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent hover:bg-accent/90 text-white font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </form>

          {/* Password Change Form */}
          <form onSubmit={handlePasswordChange} className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">Change Password</h3>
            </div>

            {passwordError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs">{passwordError}</div>}
            {passwordSaved && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs">Password updated successfully!</div>}

            <div>
              <label className="block text-xs text-foreground/50 font-semibold uppercase tracking-wider mb-2">Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-foreground/50 font-semibold uppercase tracking-wider mb-2">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-xs text-foreground/50 font-semibold uppercase tracking-wider mb-2">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent" />
              </div>
            </div>

            <button type="submit" disabled={isSaving || !currentPassword || !newPassword}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold text-sm hover:bg-amber-500/20 transition-colors disabled:opacity-50 cursor-pointer">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
