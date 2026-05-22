import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Save, CheckCircle, XCircle, ChevronRight, FileText, CheckCircle2, User } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const AttendancePage = () => {
  const { user, authenticatedFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('mark'); // 'mark' | 'sheet' for teacher; 'student' for student
  const [students, setStudents] = useState([]);
  const [report, setReport] = useState(null);
  const [studentReport, setStudentReport] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // studentId -> 'Present' | 'Absent'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      // 1. Fetch student list
      const studentsRes = await authenticatedFetch('/students');
      if (!studentsRes.ok) throw new Error('Failed to fetch student directory');
      const studentsData = await studentsRes.json();
      setStudents(studentsData);

      // Initialize attendance records to 'Present' by default
      const defaultRecords = {};
      studentsData.forEach(student => {
        defaultRecords[student._id] = 'Present';
      });
      setAttendanceRecords(defaultRecords);

      // 2. Fetch monthly report sheet
      const reportRes = await authenticatedFetch('/attendance/teacher-report');
      if (!reportRes.ok) throw new Error('Failed to fetch attendance sheets');
      const reportData = await reportRes.json();
      setReport(reportData);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const response = await authenticatedFetch('/attendance/student-report');
      if (!response.ok) throw new Error('Failed to fetch attendance logs');
      const data = await response.json();
      setStudentReport(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.role === 'teacher') {
      fetchTeacherData();
    } else {
      fetchStudentData();
    }
  }, [user]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach(student => {
      updated[student._id] = status;
    });
    setAttendanceRecords(updated);
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      setSuccessMsg('');
      setErrorMsg('');

      const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        studentId,
        status
      }));

      const response = await authenticatedFetch('/attendance', {
        method: 'POST',
        body: JSON.stringify({
          date,
          records
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit attendance logs');
      }

      setSuccessMsg('Attendance saved successfully!');
      // Re-fetch report sheet to update grids
      await fetchTeacherData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (user.role === 'teacher') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Attendance Sheets</h1>
            <p className="text-sm text-slate-400 mt-1">
              Course: <span className="text-indigo-400 font-semibold">{report?.subject}</span>
            </p>
          </div>

          {/* Tab selectors */}
          <div className="flex p-1 bg-slate-950/40 border border-slate-800/80 rounded-xl max-w-xs self-start sm:self-center">
            <button
              onClick={() => setActiveTab('mark')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'mark'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mark Log
            </button>
            <button
              onClick={() => setActiveTab('sheet')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'sheet'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Sheet
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            {successMsg}
          </div>
        )}

        {/* Tab 1: Mark Attendance */}
        {activeTab === 'mark' && (
          <div className="p-6 rounded-2xl glass-panel space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-slate-300">Select Date:</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="px-3.5 py-1.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Fast toggles */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMarkAll('Present')}
                  className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-400 rounded-lg text-xs font-semibold transition-colors"
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => handleMarkAll('Absent')}
                  className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-400 rounded-lg text-xs font-semibold transition-colors"
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            {/* Students List */}
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Roll No</th>
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3 text-right pr-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-sm">
                  {students.map(student => (
                    <tr key={student._id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="py-4 pl-2 font-mono text-slate-400">{student.rollNumber || 'N/A'}</td>
                      <td className="py-4 font-semibold text-white">{student.name}</td>
                      <td className="py-4 text-slate-400">{student.email}</td>
                      <td className="py-4 text-right pr-4">
                        <div className="inline-flex p-0.5 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                          <button
                            onClick={() => handleStatusChange(student._id, 'Present')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                              attendanceRecords[student._id] === 'Present'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                : 'text-slate-500 hover:text-slate-400'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleStatusChange(student._id, 'Absent')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                              attendanceRecords[student._id] === 'Absent'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20'
                                : 'text-slate-500 hover:text-slate-400'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-500">
                        No students enrolled. Add students in the Student Directory first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {students.length > 0 && (
              <div className="flex justify-end pt-4 border-t border-slate-800/50">
                <button
                  onClick={saveAttendance}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>Save Attendance</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Monthly Grid Sheet */}
        {activeTab === 'sheet' && (
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <h3 className="text-lg font-bold text-white">Attendance Matrix Sheet</h3>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left border border-slate-800 text-sm">
                <thead>
                  <tr className="bg-slate-950/40 text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-800">
                    <th className="p-4 border-r border-slate-800 min-w-[150px]">Student Name</th>
                    <th className="p-4 border-r border-slate-800 text-center">Avg %</th>
                    {report?.dates?.map(dateStr => {
                      const d = new Date(dateStr);
                      return (
                        <th key={dateStr} className="p-4 text-center border-r border-slate-800 font-mono text-[10px] min-w-[70px]">
                          {d.getDate()}/{d.getMonth() + 1}
                        </th>
                      );
                    })}
                    {report?.dates?.length === 0 && <th className="p-4 text-center text-slate-500">No logs marked</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {report?.students?.map(student => (
                    <tr key={student._id} className="hover:bg-slate-900/10 transition-colors">
                      <td className="p-4 font-semibold text-white border-r border-slate-800">
                        {student.name}
                        <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{student.rollNumber || 'N/A'}</span>
                      </td>
                      <td className="p-4 text-center border-r border-slate-800">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-black ${
                            student.percentage < 75
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {student.percentage}%
                        </span>
                      </td>
                      {report?.dates?.map(dateStr => {
                        const status = student.dailyStatus[dateStr];
                        return (
                          <td key={dateStr} className="p-4 text-center border-r border-slate-800">
                            {status === 'Present' ? (
                              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-xs border border-emerald-500/10">P</span>
                            ) : status === 'Absent' ? (
                              <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded text-xs border border-rose-500/10">A</span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {report?.students?.length === 0 && (
                    <tr>
                      <td colSpan={(report?.dates?.length || 0) + 2} className="text-center py-8 text-slate-500">
                        No student logs available.
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
  }

  // Student chart formatting
  const studentChartData = studentReport.map(report => ({
    subject: report.subject,
    percentage: report.percentage
  }));

  // Student portal view
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Attendance Logs</h1>
        <p className="text-sm text-slate-400 mt-1">Review your subject-wise classroom attendance details.</p>
      </div>

      {/* Recharts Graphical Attendance Analytics for Students */}
      {studentReport.length > 0 && (
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h3 className="text-lg font-bold text-white">Subject-wise Attendance Analytics</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={studentChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="subject" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '75%', fill: '#ef4444', position: 'right' }} />
                <Bar dataKey="percentage" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {studentReport.map(report => {
          const isLow = report.percentage < 75;
          return (
            <div key={report.subject} className="p-6 rounded-2xl glass-panel space-y-6">
              {/* Card Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h3 className="text-xl font-bold text-white">{report.subject}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Instructor: {report.teacherName}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Total Conducted</p>
                    <p className="text-sm font-bold text-slate-200">{report.totalClasses} classes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Attended</p>
                    <p className="text-sm font-bold text-emerald-400">{report.attended} classes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Average %</p>
                    <span
                      className={`inline-block mt-0.5 px-2.5 py-0.5 text-sm font-black rounded-full ${
                        isLow
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {report.percentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress gauge bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400 font-semibold">
                  <span>Progress Ratio</span>
                  <span>75% Minimum Required</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800/80 overflow-hidden relative">
                  {/* Minimum 75% red line marker */}
                  <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-rose-500/40 z-10" />
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLow ? 'bg-gradient-to-r from-rose-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    }`}
                    style={{ width: `${report.percentage}%` }}
                  />
                </div>
              </div>

              {/* Individual History Dates List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Logs History</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {report.history.map(item => (
                    <div
                      key={item.date}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                        item.status === 'Present'
                          ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400'
                          : 'bg-rose-500/5 border-rose-500/15 text-rose-400'
                      }`}
                    >
                      <CalendarDays size={14} className="opacity-75" />
                      <span className="text-xs font-mono font-medium">{new Date(item.date).toLocaleDateString('en-GB')}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        {studentReport.length === 0 && (
          <div className="p-8 rounded-xl bg-slate-900/40 text-center text-slate-400 text-sm">
            No attendance records found. Have your teachers marked attendance yet?
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
