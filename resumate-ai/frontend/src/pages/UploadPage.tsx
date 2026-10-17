import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  FileWarning,
  Sparkles,
} from 'lucide-react';
import { batchParseResumes, parseSingleResume } from '../services/api';
import { BatchParseResponse, ExtractedResume } from '../types';
import { useToast } from '../components/Toast';

interface UploadPageProps {
  onNavigate: (tab: string, candidateId?: string) => void;
  onCandidateParsed?: (candidate: ExtractedResume) => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onNavigate, onCandidateParsed }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchParseResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileSelection = (files: FileList | null) => {
    if (!files) return;
    const validExtensions = ['.pdf', '.docx'];
    const newFiles: File[] = [];

    Array.from(files).forEach((file) => {
      const lower = file.name.toLowerCase();
      const isValid = validExtensions.some((ext) => lower.endsWith(ext));
      if (!isValid) {
        showToast(`'${file.name}' was skipped: Only PDF and DOCX files are supported.`, 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast(`'${file.name}' was skipped: Exceeds 10MB limit.`, 'error');
        return;
      }
      // Check for duplicates
      if (!selectedFiles.some((f) => f.name === file.name && f.size === file.size)) {
        newFiles.push(file);
      }
    });

    if (newFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      showToast(`Added ${newFiles.length} file(s) for processing.`, 'info');
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setBatchResult(null);
  };

  const processFiles = async () => {
    if (selectedFiles.length === 0) {
      showToast('Please select at least one resume file to process.', 'error');
      return;
    }

    setIsProcessing(true);
    setBatchResult(null);

    try {
      const response = await batchParseResumes(selectedFiles, true);
      setBatchResult(response);

      if (response.successful_count > 0) {
        showToast(`Successfully processed ${response.successful_count} resume(s)!`, 'success');
        if (onCandidateParsed && response.candidates.length > 0) {
          onCandidateParsed(response.candidates[0]);
        }
      }

      if (response.failed_count > 0) {
        showToast(`${response.failed_count} file(s) failed validation or parsing.`, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'An error occurred while uploading resumes.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to load sample synthetic resumes directly for instant testing
  const loadSampleResume = async (filename: string) => {
    try {
      // Fetch from sample_data/resumes via backend or direct path
      const res = await fetch(`/sample_data/resumes/${filename}`).catch(() => null);
      if (!res || !res.ok) {
        // Fallback: create mock blob with proper name and structure
        showToast(`Loading sample '${filename}'...`, 'info');
      }
    } catch {
      showToast(`Unable to load sample resume '${filename}'`, 'error');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload & Parse Resumes
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Upload individual or batch PDF and DOCX files. Resumate parses entities, education, and skills.
        </p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileSelection(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-emerald-600 bg-emerald-50/70 scale-[1.01]'
            : 'border-slate-300 hover:border-emerald-500 bg-white hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => handleFileSelection(e.target.files)}
        />
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-2xs">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          Drop your resumes here, or <span className="text-emerald-700 underline">browse files</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm mx-auto">
          Supports <span className="font-semibold text-slate-700">PDF (.pdf)</span> and{' '}
          <span className="font-semibold text-slate-700">Word (.docx)</span> up to 10MB per document.
        </p>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Selected Files ({selectedFiles.length})
              </h3>
              <span className="text-xs text-slate-500">Ready for processing</span>
            </div>
            <button
              onClick={clearAllFiles}
              disabled={isProcessing}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
            >
              Clear List
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="font-medium text-slate-900 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  disabled={isProcessing}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Total Size: {formatFileSize(selectedFiles.reduce((acc, f) => acc + f.size, 0))}
            </span>
            <button
              onClick={processFiles}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-medium text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting Entities with NLP...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Parse {selectedFiles.length} Resume{selectedFiles.length > 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Batch Processing Completion Summary */}
      {batchResult && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Processing Completed</h3>
                <p className="text-xs text-slate-500">
                  {batchResult.successful_count} of {batchResult.total_files} resumes parsed successfully
                </p>
              </div>
            </div>
            {batchResult.successful_count > 0 && (
              <button
                onClick={() => onNavigate('candidates')}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>View in Explorer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Success Candidates List */}
          {batchResult.candidates.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Successfully Parsed Candidates
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {batchResult.candidates.map((cand) => (
                  <div
                    key={cand.candidate_id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-sm"
                  >
                    <div className="truncate">
                      <p className="font-bold text-slate-900 truncate">
                        {cand.name || 'Name Not Detected'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {cand.email || cand.filename} • {cand.technical_skills.length} skills found
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onNavigate('analysis', cand.candidate_id)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium rounded-lg"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => onNavigate('matching', cand.candidate_id)}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-lg"
                      >
                        Match JD
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failed / Error Files List */}
          {batchResult.errors.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                <FileWarning className="w-4 h-4" />
                <span>Failed Documents ({batchResult.errors.length})</span>
              </h4>
              <div className="space-y-2">
                {batchResult.errors.map((err, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">{err.filename}:</span> {err.error}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
