import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Megaphone, Plus, MessageSquare, Send, Calendar, Sparkles, X, ChevronDown, ChevronUp, FileText, Eye, FileDown } from 'lucide-react';

const NoticesPage = () => {
  const { user, authenticatedFetch } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Create Notice Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [creating, setCreating] = useState(false);

  // Comments State (noticeId -> active comment text)
  const [commentTexts, setCommentTexts] = useState({});
  const [expandedComments, setExpandedComments] = useState({}); // noticeId -> boolean

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const response = await authenticatedFetch('/notices');
      if (!response.ok) throw new Error('Failed to load notices');
      const data = await response.json();
      setNotices(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      setCreating(true);
      setErrorMsg('');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (file) {
        formData.append('file', file);
      }

      const response = await authenticatedFetch('/notices', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to post notice');
      }

      setSuccessMsg('Notice posted successfully!');
      setTitle('');
      setContent('');
      setFile(null);
      setShowCreateForm(false);
      await fetchNotices();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCreating(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handlePostComment = async (e, noticeId) => {
    e.preventDefault();
    const commentText = commentTexts[noticeId];
    if (!commentText || !commentText.trim()) return;

    try {
      setErrorMsg('');
      const response = await authenticatedFetch(`/notices/${noticeId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text: commentText })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to post comment');
      }

      const updatedNotice = await response.json();
      
      // Update local notices state with the new comments list
      setNotices(prevNotices => 
        prevNotices.map(notice => 
          notice._id === noticeId ? updatedNotice : notice
        )
      );

      // Clear input
      setCommentTexts(prev => ({
        ...prev,
        [noticeId]: ''
      }));
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const toggleComments = (noticeId) => {
    setExpandedComments(prev => ({
      ...prev,
      [noticeId]: !prev[noticeId]
    }));
  };

  const handleCommentTextChange = (noticeId, value) => {
    setCommentTexts(prev => ({
      ...prev,
      [noticeId]: value
    }));
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
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Class Notices</h1>
          <p className="text-sm text-slate-400 mt-1">Read class announcements and ask doubts under discussion threads.</p>
        </div>

        {user.role === 'teacher' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus size={16} />
            <span>New Announcement</span>
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

      {/* Notices Board list */}
      <div className="grid grid-cols-1 gap-6 max-w-4xl">
        {notices.map(notice => {
          const isExpanded = expandedComments[notice._id];
          const commentCount = notice.comments?.length || 0;
          return (
            <div key={notice._id} className="p-6 rounded-2xl glass-panel space-y-4">
              {/* Notice Metadata */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">
                      {notice.subject}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-2">{notice.title}</h3>
                  <p className="text-xs text-slate-400">
                    Posted by: <span className="font-semibold text-slate-300">{notice.teacher?.name}</span>
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500 flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{new Date(notice.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
              </div>

              {/* Notice Content */}
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{notice.content}</p>

              {/* Notice Attached File */}
              {notice.filePath && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="truncate text-xs">
                      <p className="font-bold text-slate-200 truncate">{notice.fileName}</p>
                      <p className="text-slate-400 mt-0.5">Attachment added with Notice</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`http://localhost:5000${notice.filePath}`}
                      download={notice.fileName}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-455 hover:text-indigo-300 font-bold rounded-lg transition-colors text-xs cursor-pointer"
                    >
                      <FileDown size={14} />
                      <span>Download File</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Discussions Toggler */}
              <div className="flex items-center justify-between border-t border-slate-850 pt-3 mt-2">
                <button
                  onClick={() => toggleComments(notice._id)}
                  className="flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <MessageSquare size={14} />
                  <span>Discussion Thread ({commentCount})</span>
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              {/* Comments Section Accordian */}
              {isExpanded && (
                <div className="space-y-4 border-t border-slate-800/60 pt-4 mt-2 transition-all">
                  {/* Comments list */}
                  <div className="space-y-3.5 max-h-[250px] overflow-y-auto scrollbar-thin pr-1">
                    {notice.comments?.map(comment => (
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
                          <span className="text-[10px] text-slate-500">
                            {new Date(comment.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{comment.text}</p>
                      </div>
                    ))}
                    {commentCount === 0 && (
                      <p className="text-xs text-slate-500 text-center py-6">No discussions yet. Ask a question or comment publicly...</p>
                    )}
                  </div>

                  {/* Add comment form */}
                  <form onSubmit={(e) => handlePostComment(e, notice._id)} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={commentTexts[notice._id] || ''}
                      onChange={(e) => handleCommentTextChange(notice._id, e.target.value)}
                      placeholder="Ask a question or comment publicly..."
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
        {notices.length === 0 && (
          <div className="p-8 rounded-xl bg-slate-900/40 text-center text-slate-400 text-sm">
            No notices posted.
          </div>
        )}
      </div>

      {/* Teacher Create Notice Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl glass-panel shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-400" />
                <span>Post Announcement</span>
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setFile(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notice Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule for Midterm Examination"
                  className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Announcement Content</label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="5"
                  placeholder="Enter notice details for students..."
                  className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Attach Document / Notice Image (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full px-4 py-2 bg-slate-950/40 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/20 file:text-indigo-400 file:hover:bg-indigo-600/30 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
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
                  {creating ? 'Posting...' : 'Post Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticesPage;
