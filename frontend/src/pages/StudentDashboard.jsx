import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, AlertTriangle, CheckSquare, Clock, FileUp, FileDown, CheckCircle2, Eye, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { authenticatedFetch } = useAuth();
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState('');

  const fetchData = async () => {
    try {
      setError('');
      const [attRes, assignRes, subRes] = await Promise.all([
        authenticatedFetch('/attendance/student-report'),
        authenticatedFetch('/assignments'),
        authenticatedFetch('/assignments/history')
      ]);

      if (!attRes.ok) throw new Error('Failed to load attendance reports');
      if (!assignRes.ok) throw new Error('Failed to load assignments');
      if (!subRes.ok) throw new Error('Failed to load submissions');

      const attData = await attRes.json();
      const assignData = await assignRes.json();
      const subData = await subRes.json();

      setAttendanceReport(attData);
      setAssignments(assignData);
      setSubmissions(subData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e, assignmentId) => {
    const fileObj = e.target.files[0];
    if (!fileObj) return;

    const formData = new FormData();
    formData.append('file', fileObj);

    try {
      setUploadingId(assignmentId);
      setError('');
      setUploadSuccess('');

      const response = await authenticatedFetch(`/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'File submission failed');
      }

      setUploadSuccess('Assignment submitted successfully!');
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingId(null);
      setTimeout(() => setUploadSuccess(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Filter assignments that are NOT submitted yet
  const pendingAssignments = assignments.filter(assign => {
    return !submissions.some(sub => sub.assignment?._id === assign._id);
  });

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Student Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Monitor your subject attendance, deadlines, and upload submissions.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Attendance Stats Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarDays size={18} className="text-indigo-400" />
            <span>Subject-wise Attendance Status</span>
          </h3>
          <Link to="/attendance" className="text-xs text-indigo-455 hover:text-indigo-300 font-semibold hover:underline">
            View Analytics Chart &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attendanceReport.map(report => {
            const isLow = report.percentage < 75;
            return (
              <div
                key={report.subject}
                className={`p-5 rounded-2xl glass-panel border transition-all hover:scale-[1.01] ${
                  isLow ? 'border-rose-500/25 bg-rose-500/5' : 'border-slate-800/80 bg-slate-900/10'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">{report.subject}</h4>
                    <p className="text-3xl font-extrabold text-white mt-2">
                      {report.percentage.toFixed(0)}%
                    </p>
                  </div>
                  {isLow ? (
                    <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/10 flex items-center justify-center shrink-0">
                      <AlertTriangle size={18} />
                    </span>
                  ) : (
                    <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} />
                    </span>
                  )}
                </div>

                <div className="flex justify-between text-xs text-slate-400 mt-4 border-t border-slate-850 pt-3">
                  <span>Attended: <strong className="text-slate-200">{report.present}</strong></span>
                  <span>Total Lectures: <strong className="text-slate-200">{report.total}</strong></span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950/40 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${
                      isLow ? 'bg-gradient-to-r from-rose-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    }`}
                    style={{ width: `${report.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          {attendanceReport.length === 0 && (
            <div className="col-span-full p-8 rounded-xl bg-slate-900/40 text-center text-slate-400 text-sm">
              No attendance logs found. Have your teachers marked attendance yet?
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Pending Assignments and Submission History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Assignments */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckSquare size={18} className="text-indigo-400" />
              <span>Pending Assignments</span>
            </h3>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-500/10 text-indigo-400 rounded-full">
              {pendingAssignments.length} Pending
            </span>
          </div>

          {uploadSuccess && (
            <div className="p-3.5 text-sm rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{uploadSuccess}</span>
            </div>
          )}

          <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
            {pendingAssignments.map(assignment => {
              const deadline = new Date(assignment.deadline);
              const isOverdue = new Date() > deadline;
              return (
                <div key={assignment._id} className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/50 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">
                        {assignment.subject}
                      </span>
                      <h4 className="text-base font-bold text-white mt-2">{assignment.title}</h4>
                      <p className="text-sm text-slate-300 mt-1.5 leading-relaxed whitespace-pre-wrap">{assignment.description}</p>
                      {assignment.notes && (
                        <p className="text-xs text-slate-400 italic mt-1.5">Note: {assignment.notes}</p>
                      )}
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        <span>Deadline: {deadline.toLocaleDateString('en-GB')}</span>
                      </span>
                      {isOverdue && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/10 text-rose-400 rounded border border-rose-500/20">
                          Overdue (Late Submission)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Teacher Attached File */}
                  {assignment.filePath && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <FileText size={14} className="text-indigo-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-200 truncate">{assignment.fileName}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`http://localhost:5000${assignment.filePath}`}
                          download={assignment.fileName}
                          className="flex items-center gap-1 text-[10px] bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 font-bold px-3 py-1.5 rounded cursor-pointer"
                        >
                          <FileDown size={10} />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Submission drag & drop / button action */}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-lg shadow-indigo-500/15 hover:scale-[1.02] active:scale-[0.98] transition-all">
                      <FileUp size={14} />
                      <span>{uploadingId === assignment._id ? 'Uploading...' : 'Upload File'}</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileUpload(e, assignment._id)}
                        disabled={uploadingId === assignment._id}
                      />
                    </label>
                    <span className="text-xs text-slate-400">PDF, DOC, DOCX or Images up to 10MB</span>
                  </div>
                </div>
              );
            })}
            {pendingAssignments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-2">
                <CheckCircle2 size={40} className="text-emerald-500/40" />
                <p className="text-sm">You are all caught up! No pending assignments.</p>
              </div>
            )}
          </div>
        </div>

        {/* Submission history list */}
        <div className="p-6 rounded-2xl glass-panel space-y-4 flex flex-col">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock size={18} className="text-violet-400" />
            <span>Submission History</span>
          </h3>
          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 max-h-[350px]">
            {submissions.map(sub => (
              <div key={sub._id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/40 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="overflow-hidden mr-2">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {sub.assignment?.title || 'Unknown Assignment'}
                    </h4>
                    <p className="text-xs text-slate-400">{sub.assignment?.subject || 'N/A'}</p>
                  </div>
                  <div>
                    {sub.status === 'Submitted' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        On-time
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Late
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <a
                    href={`http://localhost:5000${sub.filePath}`}
                    download={sub.fileName}
                    className="flex items-center gap-1 text-indigo-400 hover:underline font-bold"
                  >
                    <FileDown size={10} />
                    <span>Download Submission</span>
                  </a>
                  <span>Subm: {new Date(sub.submittedAt).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            ))}
            {submissions.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-sm">
                No assignment submission records.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
