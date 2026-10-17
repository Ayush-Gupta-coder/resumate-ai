import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Globe,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  FileCode,
  ArrowRight,
  Copy,
  Check,
  Loader2,
  Calendar,
  Building,
} from 'lucide-react';
import { getCandidateDetails, getCandidates } from '../services/api';
import type { ExtractedResume, CandidateListItem } from '../types';
import { SkillBadge } from '../components/SkillBadge';

const LinkedInIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const GitHubIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);
import { useToast } from '../components/Toast';

interface AnalysisPageProps {
  initialCandidateId?: string | null;
  onNavigate: (tab: string, candidateId?: string) => void;
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({
  initialCandidateId,
  onNavigate,
}) => {
  const [candidateList, setCandidateList] = useState<CandidateListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialCandidateId || null);
  const [candidate, setCandidate] = useState<ExtractedResume | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'experience' | 'education' | 'projects' | 'raw'>('overview');
  const [copiedRaw, setCopiedRaw] = useState(false);
  const { showToast } = useToast();

  // Load candidate list for the dropdown selector
  useEffect(() => {
    const loadList = async () => {
      try {
        const res = await getCandidates({ limit: 50 });
        setCandidateList(res.items);
        if (!selectedId && res.items.length > 0) {
          setSelectedId(res.items[0].candidate_id);
        }
      } catch {
        // silent fail
      }
    };
    loadList();
  }, []);

  // When initialCandidateId changes from parent, sync it
  useEffect(() => {
    if (initialCandidateId) {
      setSelectedId(initialCandidateId);
    }
  }, [initialCandidateId]);

  // Load selected candidate details
  useEffect(() => {
    if (!selectedId) return;
    const fetchCandidate = async () => {
      setLoading(true);
      try {
        const data = await getCandidateDetails(selectedId);
        setCandidate(data);
      } catch (err: any) {
        showToast(err.message || 'Failed to load candidate details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [selectedId]);

  const copyRawText = () => {
    if (!candidate?.raw_text) return;
    navigator.clipboard.writeText(candidate.raw_text);
    setCopiedRaw(true);
    showToast('Raw extracted text copied to clipboard', 'info');
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  if (!selectedId && candidateList.length === 0 && !loading) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">No Resumes Analyzed Yet</h3>
        <p className="text-sm text-slate-600">
          Upload and parse a resume first to view the extracted skills, experience history, and credentials.
        </p>
        <button
          onClick={() => onNavigate('upload')}
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm rounded-xl shadow-sm transition-colors"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 max-w-6xl mx-auto">
      {/* Top Bar with Candidate Selector & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Select Candidate:
          </label>
          <select
            value={selectedId || ''}
            onChange={(e) => setSelectedId(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {candidateList.map((c) => (
              <option key={c.candidate_id} value={c.candidate_id}>
                {c.name || 'Unnamed Candidate'} ({c.filename})
              </option>
            ))}
          </select>
        </div>

        {candidate && (
          <button
            onClick={() => onNavigate('matching', candidate.candidate_id)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            <Briefcase className="w-4 h-4" />
            <span>Match with Job Description</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mx-auto" />
          <p className="text-sm text-slate-600 font-medium">Loading candidate data...</p>
        </div>
      ) : !candidate ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
          Select a candidate to view parsed information.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Candidate Profile Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {candidate.name || 'Candidate Name Not Identified'}
                  </h2>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      candidate.parse_status === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {candidate.parse_status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Extracted from <span className="font-semibold text-slate-700">{candidate.filename}</span>
                </p>
              </div>

              {/* Contact Information Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {candidate.email && (
                  <a
                    href={`mailto:${candidate.email}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{candidate.email}</span>
                  </a>
                )}
                {candidate.phone && (
                  <a
                    href={`tel:${candidate.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{candidate.phone}</span>
                  </a>
                )}
                {candidate.linkedin && (
                  <a
                    href={candidate.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-blue-700 font-medium transition-colors"
                  >
                    <LinkedInIcon className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {candidate.github && (
                  <a
                    href={candidate.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-medium transition-colors"
                  >
                    <GitHubIcon className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
                {candidate.portfolio && (
                  <a
                    href={candidate.portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-emerald-800 font-medium transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Portfolio</span>
                  </a>
                )}
              </div>
            </div>

            {/* Summary Block */}
            {candidate.summary && (
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Professional Summary
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">{candidate.summary}</p>
              </div>
            )}
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-slate-200 space-x-1 sm:space-x-4 overflow-x-auto pb-px">
            {[
              { id: 'overview', label: `Skills (${candidate.technical_skills.length + candidate.soft_skills.length})`, icon: User },
              { id: 'experience', label: `Experience (${candidate.experience.length})`, icon: Briefcase },
              { id: 'education', label: `Education & Certs (${candidate.education.length + candidate.certifications.length})`, icon: GraduationCap },
              { id: 'projects', label: `Projects (${candidate.projects.length})`, icon: FolderGit2 },
              { id: 'raw', label: 'Raw Extracted Text', icon: FileCode },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-emerald-700 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-Tab Contents */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            {/* 1. OVERVIEW & SKILLS */}
            {activeSubTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Technical Skills ({candidate.technical_skills.length})
                  </h3>
                  {candidate.technical_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {candidate.technical_skills.map((s) => (
                        <SkillBadge key={s} name={s} variant="tech" />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No specific technical skills detected.</p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Soft Skills & Competencies ({candidate.soft_skills.length})
                  </h3>
                  {candidate.soft_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {candidate.soft_skills.map((s) => (
                        <SkillBadge key={s} name={s} variant="soft" />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No soft skills detected in resume text.</p>
                  )}
                </div>
              </div>
            )}

            {/* 2. EXPERIENCE */}
            {activeSubTab === 'experience' && (
              <div className="space-y-6">
                {candidate.experience.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No formal employment history extracted.</p>
                ) : (
                  <div className="space-y-6 divide-y divide-slate-100">
                    {candidate.experience.map((exp, idx) => (
                      <div key={idx} className={`${idx > 0 ? 'pt-6' : ''} space-y-2`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className="text-base font-bold text-slate-900">
                            {exp.title || 'Role Title Not Specified'}
                          </h4>
                          {exp.dates && (
                            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{exp.dates}</span>
                            </span>
                          )}
                        </div>
                        {exp.company && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                            <Building className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{exp.company}</span>
                          </div>
                        )}
                        {exp.bullet_points.length > 0 && (
                          <ul className="list-disc list-outside pl-4 space-y-1.5 text-xs sm:text-sm text-slate-600 mt-2">
                            {exp.bullet_points.map((bp, bidx) => (
                              <li key={bidx} className="leading-relaxed">
                                {bp}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. EDUCATION & CERTS */}
            {activeSubTab === 'education' && (
              <div className="space-y-8">
                {/* Education section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Education & Academic Qualifications ({candidate.education.length})
                  </h3>
                  {candidate.education.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No education records extracted.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {candidate.education.map((edu, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-slate-900 text-sm">{edu.degree || 'Degree'}</span>
                            {edu.year && <span className="text-xs text-slate-500 font-semibold">{edu.year}</span>}
                          </div>
                          {edu.institution && (
                            <p className="text-xs text-emerald-800 font-medium">{edu.institution}</p>
                          )}
                          {edu.field_of_study && (
                            <p className="text-xs text-slate-600">Major: {edu.field_of_study}</p>
                          )}
                          {edu.gpa && (
                            <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold">
                              GPA: {edu.gpa}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Certifications section */}
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Industry Certifications ({candidate.certifications.length})
                  </h3>
                  {candidate.certifications.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No certifications detected.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {candidate.certifications.map((cert, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                          <Award className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-900">{cert.name}</p>
                            {cert.issuer && <p className="text-[11px] text-slate-500">{cert.issuer}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. PROJECTS */}
            {activeSubTab === 'projects' && (
              <div className="space-y-4">
                {candidate.projects.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No projects extracted.</p>
                ) : (
                  <div className="space-y-4">
                    {candidate.projects.map((proj, idx) => (
                      <div key={idx} className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900">{proj.title}</h4>
                        {proj.description && (
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {proj.description}
                          </p>
                        )}
                        {proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {proj.technologies.map((t) => (
                              <SkillBadge key={t} name={t} size="sm" variant="additional" />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. RAW TEXT VIEWER */}
            {activeSubTab === 'raw' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Extracted text as parsed by PyMuPDF / python-docx. Use for audit and verification.
                  </p>
                  <button
                    onClick={copyRawText}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRaw ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto max-h-96 leading-relaxed whitespace-pre-wrap">
                  {candidate.raw_text}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
