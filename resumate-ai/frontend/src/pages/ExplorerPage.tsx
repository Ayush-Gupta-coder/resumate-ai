import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Briefcase,
  Users,
  UploadCloud,
  Loader2,
  RefreshCw,
  FileSpreadsheet,
  FileCode,
  ArrowUpDown,
} from 'lucide-react';
import {
  getCandidates,
  deleteCandidateRecord,
  getExportCsvUrl,
  getExportJsonUrl,
} from '../services/api';
import { CandidateListItem } from '../types';
import { SkillBadge } from '../components/SkillBadge';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';

interface ExplorerPageProps {
  onNavigate: (tab: string, candidateId?: string) => void;
}

export const ExplorerPage: React.FC<ExplorerPageProps> = ({ onNavigate }) => {
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [candidateToDelete, setCandidateToDelete] = useState<CandidateListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await getCandidates({
        search: search.trim() || undefined,
        skill: selectedSkill || undefined,
        sort_by: sortBy,
        limit: 100,
      });
      setCandidates(res.items);
      setTotalCount(res.total);
    } catch (err: any) {
      showToast(err.message || 'Failed to load candidates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCandidates();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedSkill, sortBy]);

  const confirmDelete = async () => {
    if (!candidateToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCandidateRecord(candidateToDelete.candidate_id);
      showToast(`Candidate '${candidateToDelete.name || candidateToDelete.filename}' deleted`, 'success');
      setCandidateToDelete(null);
      loadCandidates();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete record', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCsv = () => {
    window.location.href = getExportCsvUrl();
    showToast('Exporting candidates CSV...', 'info');
  };

  const handleExportJson = () => {
    window.location.href = getExportJsonUrl();
    showToast('Exporting candidates JSON...', 'info');
  };

  // Common skills for filter dropdown
  const commonSkills = [
    'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js',
    'Docker', 'Kubernetes', 'AWS', 'PyTorch', 'SQL', 'FastAPI',
    'Machine Learning', 'Natural Language Processing', 'PostgreSQL'
  ];

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto">
      {/* Header and Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Candidate Explorer
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Search, filter by technical skills, inspect parsed profiles, and export structured talent data.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-xs sm:text-sm rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-xs sm:text-sm rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <FileCode className="w-4 h-4 text-teal-700" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => onNavigate('upload')}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Resumes</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by candidate name, email, filename, or skills..."
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl pl-9 pr-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Skill Filter Dropdown */}
        <div className="sm:col-span-3">
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">All Detected Skills</option>
            {commonSkills.map((sk) => (
              <option key={sk} value={sk}>
                Skill: {sk}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="sm:col-span-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="highest_score">Sort: Highest Match Score</option>
            <option value="name">Sort: Candidate Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Table / Results */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mx-auto" />
            <p className="text-sm text-slate-500">Querying database records...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-16 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {search || selectedSkill ? 'No matching candidates found' : 'No Resumes in Database'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {search || selectedSkill
                ? 'Try adjusting your search terms or clearing the skill filter.'
                : 'Upload PDF or DOCX resumes to populate the candidate explorer.'}
            </p>
            {search || selectedSkill ? (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedSkill('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => onNavigate('upload')}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm"
              >
                Upload Resumes Now
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Candidate</th>
                  <th className="px-5 py-3.5">Detected Skills</th>
                  <th className="px-5 py-3.5">Education</th>
                  <th className="px-5 py-3.5">Experience</th>
                  <th className="px-5 py-3.5">Match Score</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((cand) => (
                  <tr key={cand.candidate_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{cand.name || 'Name Not Detected'}</div>
                      <div className="text-xs text-slate-500">{cand.email || cand.filename}</div>
                      {cand.phone && <div className="text-[11px] text-slate-400">{cand.phone}</div>}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {cand.technical_skills.slice(0, 4).map((s) => (
                          <SkillBadge key={s} name={s} size="sm" />
                        ))}
                        {cand.technical_skills.length > 4 && (
                          <span className="text-[11px] font-semibold text-slate-400 self-center">
                            +{cand.technical_skills.length - 4} more
                          </span>
                        )}
                        {cand.technical_skills.length === 0 && (
                          <span className="text-xs text-slate-400 italic">None detected</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-700 max-w-[160px] truncate">
                      {cand.education_summary || <span className="text-slate-400 italic">N/A</span>}
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-700 max-w-[180px] truncate">
                      {cand.experience_summary || <span className="text-slate-400 italic">N/A</span>}
                    </td>

                    <td className="px-5 py-4">
                      {cand.latest_match_score !== null ? (
                        <span className="inline-flex items-center font-extrabold text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {cand.latest_match_score}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Not Evaluated</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          cand.parse_status === 'success'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {cand.parse_status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigate('analysis', cand.candidate_id)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View Profile Analysis"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onNavigate('matching', cand.candidate_id)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Match against Job Description"
                        >
                          <Briefcase className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCandidateToDelete(cand)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Candidate Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer with count */}
        {candidates.length > 0 && (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
            <span>Showing {candidates.length} of {totalCount} total candidates</span>
            <span>SQLite Persisted Storage</span>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!candidateToDelete}
        onClose={() => setCandidateToDelete(null)}
        title="Confirm Candidate Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete candidate{' '}
            <strong className="text-slate-900">
              {candidateToDelete?.name || candidateToDelete?.filename}
            </strong>?
            This will permanently remove the parsed resume record and any associated job match calculations.
          </p>
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              onClick={() => setCandidateToDelete(null)}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>Delete Permanently</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
