import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, CalendarDays, CheckSquare, AlertTriangle, TrendingUp } from 'lucide-react';
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

const TeacherDashboard = () => {
  const { authenticatedFetch } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await authenticatedFetch('/attendance/teacher-report');
        if (!response.ok) {
          throw new Error('Failed to load report data');
        }
        const data = await response.json();
        setReportData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center">
        {error}
      </div>
    );
  }

  // Calculate stats
  const totalStudents = reportData?.students?.length || 0;
  const totalClasses = reportData?.totalClasses || 0;
  
  const avgAttendance = totalStudents > 0 
    ? Math.round(reportData.students.reduce((acc, s) => acc + s.percentage, 0) / totalStudents)
    : 0;

  const lowAttendanceCount = reportData?.students?.filter(s => s.percentage < 75).length || 0;

  // Chart data format
  const chartData = reportData?.students?.map(s => ({
    name: s.name,
    percentage: s.percentage,
  })) || [];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">
          Subject: <span className="text-indigo-400 font-semibold">{reportData?.subject}</span> | Overview of academic participation.
        </p>
      </div>

      {/* Analytics grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</p>
            <h3 className="text-2xl font-black text-white">{totalStudents}</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Users size={24} />
          </div>
        </div>

        {/* Total Classes */}
        <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Classes Tracked</p>
            <h3 className="text-2xl font-black text-white">{totalClasses}</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-violet-500/10 text-violet-400">
            <CalendarDays size={24} />
          </div>
        </div>

        {/* Avg Attendance */}
        <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Attendance</p>
            <h3 className="text-2xl font-black text-white">{avgAttendance}%</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Low Attendance Warning */}
        <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Below 75% Limit</p>
            <h3 className="text-2xl font-black text-white">{lowAttendanceCount} Students</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-500/10 text-rose-400">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel space-y-4">
          <h3 className="text-lg font-bold text-white">Student Attendance Percentages</h3>
          <div className="h-80 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
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
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Low attendance warning list */}
        <div className="p-6 rounded-2xl glass-panel space-y-4 flex flex-col">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-400" />
            <span>Attendance Warning List</span>
          </h3>
          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 max-h-[300px]">
            {reportData?.students?.filter(s => s.percentage < 75).map(s => (
              <div key={s._id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/40 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">{s.name}</h4>
                  <p className="text-xs text-slate-400">Roll: {s.rollNumber || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {s.percentage}%
                  </span>
                </div>
              </div>
            ))}
            {lowAttendanceCount === 0 && (
              <div className="flex items-center justify-center h-full text-sm text-slate-500 py-12">
                All students are above the 75% attendance threshold! 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
