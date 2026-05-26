import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Shield, User, GraduationCap, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

const SettingsPage = () => {
  const { user, authenticatedFetch, updateUser } = useAuth();

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [subject, setSubject] = useState(user?.subject || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validations
    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    try {
      setSaving(true);

      const response = await authenticatedFetch('/auth/settings', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          ...(user.role === 'teacher' && { subject }),
          ...(password && { password })
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update settings');
      }

      // Update auth context state to reflect changes instantly
      updateUser(data);

      setSuccessMsg('Account settings updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Settings size={28} className="text-indigo-400 animate-spin-slow" />
          <span>Account Settings</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your account profile details, change passwords, and update subjects.
        </p>
      </div>

      {/* Main Alert Message box */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3 animate-fade-in">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Side: Quick info panel card */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 bg-slate-900/10 space-y-6 text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-24 h-24 rounded-full font-bold text-3xl text-indigo-300 bg-indigo-500/10 border-2 border-indigo-500/20 shadow-xl shadow-indigo-500/5">
              {name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-lg font-bold text-white mt-4">{name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          </div>

          <div className="border-t border-slate-850 pt-4 text-left space-y-3.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Account Type</span>
              <strong className="text-slate-200 capitalize font-semibold">{user.role}</strong>
            </div>
            {user.role === 'student' ? (
              <>
                <div className="flex justify-between">
                  <span>Roll Number</span>
                  <strong className="text-slate-200 font-mono">{user.rollNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Class / Section</span>
                  <strong className="text-slate-200">{user.class || 'Grade 10'}</strong>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span>Teaching Department</span>
                <strong className="text-slate-200">{subject || 'N/A'}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Inputs form block */}
        <div className="md:col-span-2 p-6 rounded-2xl glass-panel space-y-6">
          {/* Section 1: Profile Details */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <User size={16} className="text-indigo-400" />
              <span>Personal Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {user.role === 'teacher' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Subject Department
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Security & Password */}
          <div className="space-y-4 pt-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <Shield size={16} className="text-indigo-400" />
              <span>Security & Password (Optional)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Leave these fields blank if you do not wish to change your password.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <Save size={16} />
              <span>{saving ? 'Saving changes...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
