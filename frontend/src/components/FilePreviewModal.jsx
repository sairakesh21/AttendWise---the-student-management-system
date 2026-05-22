import React from 'react';
import { X, FileDown, Eye, FileText, ImageIcon, Download, ExternalLink } from 'lucide-react';

const FilePreviewModal = ({ isOpen, onClose, fileUrl, fileName }) => {
  if (!isOpen || !fileUrl) return null;

  // Determine file type from extension
  const extension = fileName?.split('.').pop()?.toLowerCase() || '';
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension);
  const isPDF = extension === 'pdf';
  const isDoc = ['doc', 'docx', 'odt'].includes(extension);

  // Full backend URL
  const absoluteUrl = fileUrl.startsWith('http') ? fileUrl : `http://localhost:5000${fileUrl}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl h-[85vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/40 border-b border-slate-850">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
              {isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate max-w-[250px] sm:max-w-md" title={fileName}>
                {fileName}
              </h3>
              <p className="text-[10px] text-slate-400 capitalize mt-0.5">{extension || 'Unknown'} Document</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={absoluteUrl}
              download={fileName}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </a>
            <a
              href={absoluteUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs border border-slate-750 transition-colors shrink-0"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Open in Tab</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-slate-950/20 overflow-hidden flex flex-col">
          {isPDF && (
            <iframe
              src={`${absoluteUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full border-0 bg-slate-900"
              title="PDF Document Preview"
            />
          )}

          {isImage && (
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto bg-slate-950/40">
              <img
                src={absoluteUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg select-none"
              />
            </div>
          )}

          {isDoc && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/20">
              <div className="w-24 h-24 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/10">
                <FileText size={48} />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Word Document Preview</h4>
              <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
                Word files (<span className="font-mono text-xs text-indigo-400">.doc / .docx</span>) cannot be previewed natively in the browser. 
                Please download the file to open it in Microsoft Word or upload to Google Docs.
              </p>
              <a
                href={absoluteUrl}
                download={fileName}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/10 transition-all hover:scale-[1.02]"
              >
                <Download size={18} />
                <span>Download Word Document</span>
              </a>
            </div>
          )}

          {!isPDF && !isImage && !isDoc && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/20">
              <div className="w-20 h-20 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mb-6">
                <FileText size={40} />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Preview Unrecognized File</h4>
              <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
                This file type cannot be previewed directly. You can open it in a new tab or download it to your device.
              </p>
              <div className="flex gap-4">
                <a
                  href={absoluteUrl}
                  download={fileName}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all"
                >
                  <Download size={16} />
                  <span>Download File</span>
                </a>
                <a
                  href={absoluteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-750 transition-all"
                >
                  <ExternalLink size={16} />
                  <span>Open in New Tab</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
