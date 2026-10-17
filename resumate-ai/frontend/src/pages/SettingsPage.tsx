import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileCheck,
  Server,
  Trash2,
  AlertTriangle,
  Lock,
  Cpu,
  Database,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { clearAllCandidates, checkHealth } from '../services/api';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';

interface SettingsPageProps {
  onNavigate: (tab: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const [healthInfo, setHealthInfo] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { showToast } = useToast();

  const fetchHealth = async () => {
    setChecking(true);
    try {
      const res = await checkHealth();
      setHealthInfo(res);
    } catch {
      setHealthInfo({ status: 'offline', service: 'Resumate AI Backend' });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      const res = await clearAllCandidates();
      showToast(res.message || 'All candidate records cleared successfully', 'success');
      setShowClearModal(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to clear database', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System Settings & Privacy
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Review system security architectures, file constraints, NLP pipelines, and data retention policies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Supported File Formats */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Supported File Formats</h3>
              <p className="text-xs text-slate-500">Document ingestion capabilities</p>
            </div>
          </div>
          <ul className="text-xs sm:text-sm text-slate-600 space-y-2.5">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong className="text-slate-800">PDF (.pdf):</strong> Ingested via PyMuPDF (fitz) with layout extraction, unicode normalization, and magic byte validation (%PDF).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong className="text-slate-800">Word (.docx):</strong> Extracted via python-docx, including multi-column tables, headers, and bullet markers.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong className="text-slate-800">File Size Limit:</strong> Maximum 10MB per document with in-memory validation to safeguard server resources.</span>
            </li>
          </ul>
        </div>

        {/* Card 2: Privacy Guarantees */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Data Privacy & Ethics</h3>
              <p className="text-xs text-slate-500">Responsible AI principles</p>
            </div>
          </div>
          <ul className="text-xs sm:text-sm text-slate-600 space-y-2.5">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong className="text-slate-800">100% Local Execution:</strong> Zero data transmission to third-party paid APIs or cloud LLMs. Resumes remain private on your machine.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong className="text-slate-800">Anti-Bias Architecture:</strong> Strictly evaluates skills, education, and experience. No demographic profiling (gender, race, age, religion).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong className="text-slate-800">Recruiter Support Tool:</strong> Designed to assist human review, not make automated hiring decisions.</span>
            </li>
          </ul>
        </div>

        {/* Card 3: Backend Runtime Diagnostics */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">System Diagnostics</h3>
                <p className="text-xs text-slate-500">FastAPI backend health & stack</p>
              </div>
            </div>
            <button
              onClick={fetchHealth}
              disabled={checking}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Service Status:</span>
              <span className={`font-bold capitalize ${healthInfo?.status === 'healthy' ? 'text-emerald-700' : 'text-rose-600'}`}>
                {healthInfo?.status || 'Checking...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">NLP Engine:</span>
              <span className="font-medium text-slate-800">{healthInfo?.nlp_engine || 'spaCy (en_core_web_sm)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Persistence Store:</span>
              <span className="font-medium text-slate-800">{healthInfo?.storage || 'SQLite DB'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">API Version:</span>
              <span className="font-medium text-slate-800">{healthInfo?.version || '1.0.0'}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Danger Zone / Data Management */}
        <div className="p-6 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Data Retention & Reset</h3>
              <p className="text-xs text-slate-500">Clear stored resumes for privacy</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Need to wipe candidate records after testing or demonstration? You can purge all persisted records from the local SQLite database.
          </p>
          <button
            onClick={() => setShowClearModal(true)}
            className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Purge All Candidate Records</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Purge All Candidate Records"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              This action cannot be undone. All extracted resumes and job match histories will be permanently removed.
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Are you sure you want to proceed with resetting the candidate database?
          </p>
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              onClick={() => setShowClearModal(false)}
              disabled={isClearing}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={handleClearAll}
              disabled={isClearing}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              {isClearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>Confirm Purge</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
