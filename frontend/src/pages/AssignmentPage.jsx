import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  FileText,
  CalendarDays,
  Clock,
  FileDown,
  Eye,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  X,
  FileUp,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';

const AssignmentPage = () => {
  const { user, authenticatedFetch } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]); // Submissions for selected assignment (Teacher view)
  const [studentSubmissions, setStudentSubmissions] = useState([]); // Submission history (Student view)
  const [selectedAssignment, setSelectedAssignment] = useState(null); // Selected assignment for viewing submissions
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [creating, setCreating] = useState(false);

  // File Upload State
  const [uploadingId, setUploadingId] = useState(null);

  // Comments State (assignmentId -> active comment text)
  const [commentTexts, setCommentTexts] = useState({});
  const [expandedComments, setExpandedComments] = useState({}); // assignmentId -> boolean

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const assignRes = await authenticatedFetch('/assignments');
      if (!assignRes.ok) throw new Error('Failed to load assignments');
      const assignData = await assignRes.json();
      setAssignments(assignData);

      if (user.role === 'student') {
        const subHistoryRes = await authenticatedFetch('/assignments/history');
        if (!subHistoryRes.ok) throw new Error('Failed to load submission history');
        const subHistoryData = await subHistoryRes.json();
        setStudentSubmissions(subHistoryData);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!title || !description || !deadline) return;

    try {
      setCreating(true);
      setErrorMsg('');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('deadline', deadline);
      formData.append('notes', notes);
      if (file) {
        formData.append('file', file);
      }

      const response = await authenticatedFetch('/assignments', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create assignment');
      }

      setSuccessMsg('Assignment created successfully!');
      setTitle('');
      setDescription('');
      setDeadline('');
      setNotes('');
      setFile(null);
      setShowCreateModal(false);
      await fetchData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCreating(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      setErrorMsg('');
      const response = await authenticatedFetch(`/assignments/${assignmentId}/submissions`);
      if (!response.ok) throw new Error('Failed to load submissions');
      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleViewSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    await fetchSubmissions(assignment._id);
  };

  const handleFileUpload = async (e, assignmentId) => {
    const fileObj = e.target.files[0];
    if (!fileObj) return;

    const formData = new FormData();
    formData.append('file', fileObj);

    try {
      setUploadingId(assignmentId);
      setErrorMsg('');
      const response = await authenticatedFetch(`/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'File submission failed');
      }

      setSuccessMsg('Assignment submitted successfully!');
      await fetchData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setUploadingId(null);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handlePostComment = async (e, assignmentId) => {
    e.preventDefault();
    const commentText = commentTexts[assignmentId];
    if (!commentText || !commentText.trim()) return;

    try {
      setErrorMsg('');
      const response = await authenticatedFetch(`/assignments/${assignmentId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text: commentText })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to post comment');
      }

      const updatedAssignment = await response.json();
      
      // Update local assignments state
      setAssignments(prev => 
        prev.map(item => item._id === assignmentId ? updatedAssignment : item)
      );

      // Clear input
      setCommentTexts(prev => ({
        ...prev,
        [assignmentId]: ''
      }));
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const toggleComments = (assignmentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }));
  };

  const handleCommentTextChange = (assignmentId, value) => {
    setCommentTexts(prev => ({
      ...prev,
      [assignmentId]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const getStudentSubmission = (assignmentId) => {
    return studentSubmissions.find(s => s.assignment?._id === assignmentId);
  };

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Assignments</h1>
          <p className="text-sm text-slate-400 mt-1">
            {user.role === 'teacher'
              ? `Manage assignments and view student submissions for ${user.subject}.`
              : 'View pending and submitted academic assignments.'}
          </p>
        </div>

        {user.role === 'teacher' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus size={16} />
            <span>Create Assignment</span>
          </button>
        )}
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

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left/Middle: Assignments List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {assignments.map(assignment => {
              const deadline = new Date(assignment.deadline);
              const isOverdue = new Date() > deadline;
              const submission = user.role === 'student' ? getStudentSubmission(assignment._id) : null;
              const isExpanded = expandedComments[assignment._id];
              const commentCount = assignment.comments?.length || 0;

              return (
                <div key={assignment._id} className="p-6 rounded-2xl glass-panel space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/10">
                        {assignment.subject}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-3">{assignment.title}</h3>
                      {user.role === 'student' && (
                        <p className="text-xs text-slate-400">Instructor: {assignment.teacher?.name}</p>
                      )}
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5 self-start">
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>Deadline: {deadline.toLocaleDateString('en-GB')}</span>
                      </span>
                      {isOverdue && !submission && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/10 text-rose-400 rounded border border-rose-500/20">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{assignment.description}</p>

                  {/* Teacher Attached File */}
                  {assignment.filePath && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="truncate text-xs">
                          <p className="font-bold text-slate-200 truncate">{assignment.fileName}</p>
                          <p className="text-slate-400 mt-0.5">Attachment added by Instructor</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`http://localhost:5000${assignment.filePath}`}
                          download={assignment.fileName}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/10 transition-all hover:scale-[1.02] text-xs cursor-pointer"
                        >
                          <FileDown size={14} />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {assignment.notes && (
                    <div className="p-3 bg-slate-950/20 border border-slate-800/40 rounded-xl">
                      <p className="text-xs text-slate-400"><span className="font-semibold text-slate-300">Note:</span> {assignment.notes}</p>
                    </div>
                  )}

                  {/* Actions footer */}
                  <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-2">
                    {user.role === 'teacher' ? (
                      <button
                        onClick={() => handleViewSubmissions(assignment)}
                        className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        <Eye size={14} />
                        <span>View Student Submissions</span>
                        <ChevronRight size={12} />
                      </button>
                    ) : (
                      <>
                        {/* Student action */}
                        {submission ? (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
                            <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                              <CheckCircle2 size={14} />
                              <span>Submitted ({submission.status})</span>
                            </span>
                            <div className="flex items-center gap-3">
                              <a
                                href={`http://localhost:5000${submission.filePath}`}
                                download={submission.fileName}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:underline font-bold rounded-lg border border-indigo-500/10"
                              >
                                <FileDown size={12} />
                                <span>Download Submission File</span>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-lg shadow-indigo-500/15 hover:scale-[1.02] active:scale-[0.98] transition-all">
                              <FileUp size={14} />
                              <span>{uploadingId === assignment._id ? 'Uploading...' : 'Submit Work'}</span>
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                onChange={(e) => handleFileUpload(e, assignment._id)}
                                disabled={uploadingId === assignment._id}
                              />
                            </label>
                            <span className="text-xs text-slate-400">PDF/DOC/Image up to 10MB</span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Discussions Toggler */}
                    <button
                      onClick={() => toggleComments(assignment._id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      <MessageSquare size={14} />
                      <span>Discussion ({commentCount})</span>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  {/* Comments Section Accordion */}
                  {isExpanded && (
                    <div className="space-y-4 border-t border-slate-800/60 pt-4 mt-2 transition-all">
                      {/* Comments list */}
                      <div className="space-y-3.5 max-h-[250px] overflow-y-auto scrollbar-thin pr-1">
                        {assignment.comments?.map(comment => (
                          <div key={comment._id} className="p-3 bg-slate-950/20 border border-slate-900/60 rounded-xl space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-200">
                                {comment.user?.name}
                                <span className={`ml-2 px-1.5 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                                  comment.user?.role === 'teacher'
                                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}>
                                  {comment.user?.role}
                                </span>
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(comment.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">{comment.text}</p>
                          </div>
                        ))}
                        {commentCount === 0 && (
                          <p className="text-xs text-slate-500 text-center py-6">No discussions yet. Ask a question or post a query below!</p>
                        )}
                      </div>

                      {/* Add comment form */}
                      <form onSubmit={(e) => handlePostComment(e, assignment._id)} className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={commentTexts[assignment._id] || ''}
                          onChange={(e) => handleCommentTextChange(assignment._id, e.target.value)}
                          placeholder="Ask a question or reply to assignment queries..."
                          className="flex-1 px-4 py-2 bg-slate-950/40 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <Send size={14} />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
            {assignments.length === 0 && (
              <div className="p-8 rounded-xl bg-slate-900/40 text-center text-slate-400 text-sm">
                No assignments posted.
              </div>
            )}
          </div>
        </div>

        {/* Right side details panel: Teacher View Submissions / Student Summary statistics */}
        <div className="space-y-6">
          {user.role === 'teacher' ? (
            <div className="p-6 rounded-2xl glass-panel space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Submissions List</h3>
                {selectedAssignment && (
                  <button onClick={() => setSelectedAssignment(null)} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                    <X size={16} />
                  </button>
                )}
              </div>

              {selectedAssignment ? (
                <div className="space-y-4">
                  <div className="bg-slate-950/20 p-3.5 border border-slate-800/40 rounded-xl">
                    <h4 className="text-sm font-bold text-indigo-400 line-clamp-1">{selectedAssignment.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">Submissions: {submissions.length}</p>
                  </div>

                  <div className="space-y-3 overflow-y-auto scrollbar-thin max-h-[400px]">
                    {submissions.map(sub => (
                      <div key={sub._id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/40 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="text-sm font-bold text-white">{sub.student?.name}</h5>
                            <p className="text-[10px] text-slate-400 font-mono">Roll: {sub.student?.rollNumber || 'N/A'}</p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sub.status === 'Submitted'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-[10px]">
                          <a
                            href={`http://localhost:5000${sub.filePath}`}
                            download={sub.fileName}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:underline font-bold rounded-lg border border-indigo-500/10"
                          >
                            <FileDown size={10} />
                            <span>Download Submission</span>
                          </a>
                          <span className="text-slate-500">Date: {new Date(sub.submittedAt).toLocaleDateString('en-GB')}</span>
                        </div>
                      </div>
                    ))}
                    {submissions.length === 0 && (
                      <div className="text-center py-12 text-slate-500 text-sm">
                        No student submissions recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Select an assignment to view student file uploads.
                </div>
              )}
            </div>
          ) : (
            // Student stats summary side block
            <div className="p-6 rounded-2xl glass-panel space-y-4">
              <h3 className="text-lg font-bold text-white">Your Progress</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
                  <span className="text-slate-400">Total Assignments</span>
                  <span className="font-bold text-white">{assignments.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
                  <span className="text-slate-400">Submitted</span>
                  <span className="font-bold text-emerald-400">{studentSubmissions.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
                  <span className="text-slate-400">Pending</span>
                  <span className="font-bold text-indigo-400">{assignments.length - studentSubmissions.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Teacher Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl glass-panel shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-400" />
                <span>Create Subject Assignment</span>
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFile(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midterm Lab Exercise"
                  className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Instructions / Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  placeholder="Write clear instructions for students..."
                  className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Attach Study Material / Questions (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full px-4 py-2 bg-slate-950/40 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/20 file:text-indigo-400 file:hover:bg-indigo-600/30 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Deadline Date</label>
                  <input
                     type="date"
                     required
                     value={deadline}
                     onChange={(e) => setDeadline(e.target.value)}
                     className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Additional Notes (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Late penalties apply"
                    className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFile(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Post Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentPage;
