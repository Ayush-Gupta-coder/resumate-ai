import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileCheck,
  ShieldCheck,
  Loader2,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { matchResumeWithJob, getCandidates } from '../services/api';
import { JobMatchResult, CandidateListItem, WeightConfiguration } from '../types';
import { ScoreGauge } from '../components/ScoreGauge';
import { SkillBadge } from '../components/SkillBadge';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';

interface MatchingPageProps {
  initialCandidateId?: string | null;
  onNavigate: (tab: string, candidateId?: string) => void;
}

const SAMPLE_JDS: Record<string, { title: string; text: string }> = {
  ai_engineer: {
    title: 'Senior AI & Machine Learning Engineer',
    text: `Role: Senior AI & Machine Learning Engineer
Key Responsibilities:
- Design, train, and fine-tune deep learning and transformer models using PyTorch and Hugging Face.
- Build high-performance RESTful APIs with Python and FastAPI.
- Deploy scalable services using Docker and Kubernetes on AWS cloud infrastructure.
- Implement automated testing and CI/CD pipelines via GitHub Actions.

Required Qualifications & Skills:
- Strong proficiency in Python, PyTorch, and TensorFlow.
- Solid experience with Natural Language Processing (NLP) and Large Language Models (LLMs).
- Demonstrated experience building APIs with FastAPI and Docker containerization.
- Knowledge of relational databases like PostgreSQL and caching with Redis.
- Bachelor's or Master's degree in Computer Science, AI, or related field.
- Excellent Problem Solving and Team Leadership skills.`,
  },
  fullstack: {
    title: 'Full Stack React & Node.js Developer',
    text: `Role: Full Stack React & Node.js Developer
Responsibilities:
- Build modern, interactive user interfaces using React, TypeScript, and Tailwind CSS.
- Develop scalable backend RESTful APIs using Node.js, Express.js, and PostgreSQL.
- Write clean, modular code with unit tests and Git version control.
- Package applications into Docker containers and deploy to AWS.

Requirements:
- 3+ years experience with React, TypeScript, and JavaScript.
- Proficiency with Tailwind CSS, Next.js, and state management (Redux).
- Backend proficiency with Node.js and PostgreSQL.
- Familiarity with Docker, AWS, and CI/CD pipelines.
- Bachelor's degree in Computer Science or related degree.
- Strong Communication and Collaboration skills.`,
  },
  data_scientist: {
    title: 'Data Scientist',
    text: `Role: Data Scientist
Overview:
Analyze high-volume business metrics and deploy predictive machine learning solutions.

Key Requirements:
- Proven experience with Python, R, and SQL.
- Strong grounding in Machine Learning algorithms, Scikit-Learn, Pandas, and NumPy.
- Experience building dashboards in Tableau or Power BI.
- Database expertise with MySQL, PostgreSQL, or Snowflake.
- Degree in Mathematics, Statistics, Computer Science or equivalent.
- Problem Solving and Attention to Detail.`,
  },
};

export const MatchingPage: React.FC<MatchingPageProps> = ({
  initialCandidateId,
  onNavigate,
}) => {
  const [candidateList, setCandidateList] = useState<CandidateListItem[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(initialCandidateId || '');
  const [jobTitle, setJobTitle] = useState('Senior AI Engineer');
  const [jobDescription, setJobDescription] = useState(SAMPLE_JDS.ai_engineer.text);
  const [weights, setWeights] = useState<WeightConfiguration>({
    skills: 0.65,
    experience: 0.20,
    education: 0.15,
  });
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchCands = async () => {
      try {
        const res = await getCandidates({ limit: 50 });
        setCandidateList(res.items);
        if (!selectedCandidateId && res.items.length > 0) {
          setSelectedCandidateId(res.items[0].candidate_id);
        }
      } catch {
        // silent
      }
    };
    fetchCands();
  }, []);

  useEffect(() => {
    if (initialCandidateId) {
      setSelectedCandidateId(initialCandidateId);
    }
  }, [initialCandidateId]);

  const loadPresetJD = (key: string) => {
    const preset = SAMPLE_JDS[key];
    if (preset) {
      setJobTitle(preset.title);
      setJobDescription(preset.text);
      showToast(`Loaded sample JD: ${preset.title}`, 'info');
    }
  };

  const handleRunMatch = async () => {
    if (!selectedCandidateId) {
      showToast('Please select a candidate to match against.', 'error');
      return;
    }
    if (!jobDescription.trim() || jobDescription.length < 10) {
      showToast('Please enter a valid job description with requirements.', 'error');
      return;
    }

    setIsMatching(true);
    setResult(null);

    try {
      const matchResult = await matchResumeWithJob({
        candidate_id: selectedCandidateId,
        job_title: jobTitle,
        job_description: jobDescription,
        weights: weights,
      });
      setResult(matchResult);
      showToast('Job matching analysis completed!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Matching analysis failed.', 'error');
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-6xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Job Description Matching Assistant
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Evaluate candidate skill coverage, experience alignment, and qualification criteria with explainable scoring.
        </p>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recruiter Input Form (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          {/* Candidate selector & JD Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Candidate
              </label>
              {candidateList.length > 0 ? (
                <select
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {candidateList.map((c) => (
                    <option key={c.candidate_id} value={c.candidate_id}>
                      {c.name || 'Unnamed Candidate'} ({c.filename})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  No candidates in database. <button onClick={() => onNavigate('upload')} className="underline font-bold">Upload one first</button>.
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Machine Learning Engineer"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Sample JD loader buttons */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Job Description Requirements
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => loadPresetJD('ai_engineer')}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                >
                  AI Eng
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetJD('fullstack')}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                >
                  Full Stack
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetJD('data_scientist')}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                >
                  Data Sci
                </button>
              </div>
            </div>
            <textarea
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description or list of required skills here..."
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl p-3.5 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowWeightModal(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>Configure Scoring Weights ({Math.round(weights.skills * 100)}% / {Math.round(weights.experience * 100)}% / {Math.round(weights.education * 100)}%)</span>
            </button>

            <button
              onClick={handleRunMatch}
              disabled={isMatching || candidateList.length === 0}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-medium text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {isMatching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Computing Alignment...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Calculate Explainable Match</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Explainability / Methodology Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Explainable Scoring Formula</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Resumate AI calculates an audit-ready, weighted mathematical alignment score:
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
              <div>Overall = (W_skill × SkillCoverage)</div>
              <div className="pl-6">+ (W_exp × ExpAlignment)</div>
              <div className="pl-6">+ (W_edu × EduScore)</div>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
              <li><strong className="text-slate-800">Skills (65%):</strong> Exact overlap with JD required skills.</li>
              <li><strong className="text-slate-800">Experience (20%):</strong> Relevant role titles and project keywords.</li>
              <li><strong className="text-slate-800">Education (15%):</strong> Academic degree level.</li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>Scores are heuristics to support human review and never infer protected demographic traits.</span>
          </div>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8 animate-fade-in">
          {/* Top Score Banner */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-slate-50 border border-emerald-100">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                Analysis Complete
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Match Result: {result.candidate_name || 'Candidate'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Position: <span className="font-semibold text-slate-800">{result.job_title}</span>
              </p>
            </div>

            {/* Score Gauge */}
            <div className="flex items-center gap-8">
              <ScoreGauge score={result.overall_score} size={130} />
              <div className="space-y-2 border-l border-slate-200 pl-6 text-xs font-medium">
                <div>
                  <span className="text-slate-500">Skill Score:</span>{' '}
                  <strong className="text-slate-900">{result.skill_score}%</strong>
                </div>
                <div>
                  <span className="text-slate-500">Experience Score:</span>{' '}
                  <strong className="text-slate-900">{result.experience_score}%</strong>
                </div>
                <div>
                  <span className="text-slate-500">Education Score:</span>{' '}
                  <strong className="text-slate-900">{result.education_score}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Breakdown (Matching vs Missing vs Additional) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Matching Skills */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Matching Skills ({result.matching_skills.length})</span>
                </h4>
              </div>
              {result.matching_skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {result.matching_skills.map((s) => (
                    <SkillBadge key={s} name={s} variant="match" size="sm" />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No matching skills detected.</p>
              )}
            </div>

            {/* Missing Skills */}
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Missing Skills ({result.missing_skills.length})</span>
                </h4>
              </div>
              {result.missing_skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {result.missing_skills.map((s) => (
                    <SkillBadge key={s} name={s} variant="missing" size="sm" />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-700 font-medium">All required skills are present!</p>
              )}
            </div>

            {/* Additional Candidate Skills */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-slate-600" />
                  <span>Additional Skills ({result.additional_relevant_skills.length})</span>
                </h4>
              </div>
              {result.additional_relevant_skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                  {result.additional_relevant_skills.map((s) => (
                    <SkillBadge key={s} name={s} variant="additional" size="sm" />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No additional skills.</p>
              )}
            </div>
          </div>

          {/* Evidence Supporting Match */}
          {result.evidence.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Match Evidence & Resume Corroboration
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.evidence.map((ev, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                    <span className="font-bold text-emerald-800">{ev.category}:</span>
                    <p className="text-slate-700">{ev.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Recommendations for Missing Skills */}
          {result.suggestions.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Skill Development Recommendations
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                Targeted recommendations for candidate interview prep or professional development:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.suggestions.map((sug, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{sug.skill}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">{sug.category}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{sug.description}</p>
                    </div>
                    {sug.recommended_resource && (
                      <p className="text-[11px] text-emerald-700 font-medium pt-2 border-t border-slate-100">
                        Resource: {sug.recommended_resource}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ethical Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs leading-relaxed space-y-1">
            <span className="font-bold text-slate-800">Ethical AI & Compliance Notice:</span>
            <p>{result.ethical_notice}</p>
          </div>
        </div>
      )}

      {/* Configurable Weights Modal */}
      <Modal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        title="Configure Scoring Formula Weights"
      >
        <div className="space-y-5">
          <p className="text-xs text-slate-600">
            Customize the weighting formula applied when calculating candidate job fit scores. Weights will be normalized automatically.
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Skill Coverage Weight: {Math.round(weights.skills * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={weights.skills}
                onChange={(e) => setWeights({ ...weights, skills: parseFloat(e.target.value) })}
                className="w-full accent-emerald-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Work Experience Weight: {Math.round(weights.experience * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.5"
                step="0.05"
                value={weights.experience}
                onChange={(e) => setWeights({ ...weights, experience: parseFloat(e.target.value) })}
                className="w-full accent-emerald-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Education Qualifications Weight: {Math.round(weights.education * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.5"
                step="0.05"
                value={weights.education}
                onChange={(e) => setWeights({ ...weights, education: parseFloat(e.target.value) })}
                className="w-full accent-emerald-700"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              onClick={() => {
                setWeights({ skills: 0.65, experience: 0.20, education: 0.15 });
                showToast('Reset weights to default 65/20/15', 'info');
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Reset Defaults
            </button>
            <button
              onClick={() => setShowWeightModal(false)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg"
            >
              Apply Weights
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
