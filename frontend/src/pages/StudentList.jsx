import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Users, UserPlus, Key, Mail, Hash, User, AlertCircle, Copy, Check, Sparkles } from 'lucide-react';

const StudentList = () => {
  const { authenticatedFetch } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedId, setCopiedId] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const response = await authenticatedFetch('/students');
      if (!response.ok) {
        throw new Error('Failed to load students directory');
      }
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!name || !email || !rollNumber || !password) {
      return setErrorMsg('Please fill in all fields');
    }

    try {
      setSaving(true);
      setErrorMsg('');
      const response = await authenticatedFetch('/students', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          rollNumber,
          password
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to register student');
      }

      setSuccessMsg(`Student registered! Share credentials: Password = ${password}`);
      setName('');
      setEmail('');
      setRollNumber('');
      setPassword('');
      setShowAddForm(false);
      await fetchStudents();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCredentials = (student, pass = 'password123') => {
    const text = `AttendWise Login Credentials:\nEmail: ${student.email}\nPassword: ${pass}`;
    navigator.clipboard.writeText(text);
    setCopiedId(student._id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Student Directory</h1>
          <p className="text-sm text-slate-400 mt-1">Add and manage student credentials and profiles.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all hover:scale-[1.02]"
        >
          <UserPlus size={16} />
          <span>{showAddForm ? 'View Directory' : 'Add Student'}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-xs underline hover:text-emerald-300">Dismiss</button>
        </div>
      )}

      {showAddForm ? (
        /* Add Student Form */
        <div className="p-6 rounded-2xl glass-panel max-w-lg mx-auto space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <UserPlus size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Provision Student Account</h3>
          </div>

          <form onSubmit={handleAddStudent} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Student Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Student Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@institution.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Roll Number / ID</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                    <Hash size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. CS-105"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                      <Key size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter or auto-generate"
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles size={14} />
                    <span>Auto</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? 'Registering...' : 'Provision Account'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Enrolled Students Directory Table */
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800/60 pb-4">
            <Users size={20} className="text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Student Enrollment Roster</h3>
            <span className="ml-auto text-xs text-slate-400 font-semibold bg-slate-950/40 border border-slate-800 px-2.5 py-0.5 rounded-full">
              {students.length} Enrolled
            </span>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Roll Number</th>
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3 text-right pr-4">Credentials Tool</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {students.map(student => (
                  <tr key={student._id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-4 pl-2 font-mono text-slate-400">{student.rollNumber || 'N/A'}</td>
                    <td className="py-4 font-semibold text-white">{student.name}</td>
                    <td className="py-4 text-slate-400">{student.email}</td>
                    <td className="py-4 text-right pr-4">
                      <button
                        onClick={() => handleCopyCredentials(student)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 hover:border-indigo-500 transition-all active:scale-95"
                      >
                        {copiedId === student._id ? (
                          <>
                            <Check size={12} className="text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy Login Info</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-500">
                      No students registered. Use the "Add Student" button to register one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
