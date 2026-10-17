import React from 'react';
import {
  FileText,
  Briefcase,
  Cpu,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 border border-emerald-100 p-8 sm:p-14 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold mb-6 border border-emerald-200 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>AI-Powered Resume Parsing & Job Matching</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Turn Resumes into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700">
            Actionable Insights
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Resumate AI automates resume extraction with local NLP, compares candidate qualifications against real job descriptions, detects critical skill gaps, and empowers recruiters with explainable scoring.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('upload')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-medium text-base border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4 text-emerald-700" />
            <span>Recruiter Dashboard</span>
          </button>
        </div>

        {/* Feature Badges */}
        <div className="mt-12 pt-8 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-slate-700">PDF & DOCX Support</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-slate-700">Explainable Scoring</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-slate-700">Skill Gap Diagnosis</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-slate-700">100% Local & Private</span>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Engineered for Modern Talent Teams
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Combine linguistic extraction, semantic matching, and explainable AI in a unified workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Modular NLP Extraction</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                PyMuPDF and python-docx extract full document text with layout awareness. spaCy NER and rule-based taxonomies accurately isolate candidate names, emails, phones, education history, and 70+ technical and soft skills.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <Zap className="w-3.5 h-3.5" />
              <span>Zero hallucinations</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Explainable Job Matching</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Recruiters paste any job description. Resumate calculates a deterministic weighted score based on skill coverage (65%), experience alignment (20%), and education qualifications (15%). Every score includes clear mathematical evidence.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-teal-700">
              <Zap className="w-3.5 h-3.5" />
              <span>Configurable weight models</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Ethical & Private by Design</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Built strictly to assist human decision-making. No candidate profiling based on gender, age, race, religion, or disability. Data is processed locally without external API dependencies, with instant deletion controls.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Zap className="w-3.5 h-3.5" />
              <span>Local SQLite persistence</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Guide */}
      <section className="p-8 sm:p-10 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">
          How to Test Resumate AI (Internship Demo Journey)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="font-semibold text-sm text-slate-900">Upload Resumes</h4>
            <p className="text-xs text-slate-600 leading-normal">
              Drop sample PDF or DOCX files in the Upload page. Validate magic bytes and extract entities.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="font-semibold text-sm text-slate-900">Inspect Analysis</h4>
            <p className="text-xs text-slate-600 leading-normal">
              Review structured contact details, parsed education, experience timeline, and raw text verification.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="font-semibold text-sm text-slate-900">Match Job Description</h4>
            <p className="text-xs text-slate-600 leading-normal">
              Paste or load pre-built job descriptions. Calculate overall match score and identify missing skills.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
              4
            </div>
            <h4 className="font-semibold text-sm text-slate-900">Export & Manage</h4>
            <p className="text-xs text-slate-600 leading-normal">
              Filter in Candidate Explorer, export clean CSV/JSON, or test atomic candidate deletion.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
