import React, { useState } from 'react';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { MatchingPage } from './pages/MatchingPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { SettingsPage } from './pages/SettingsPage';
import { ExtractedResume } from './types';
import { FileText, Heart } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const handleNavigate = (tab: string, candidateId?: string) => {
    if (candidateId) {
      setSelectedCandidateId(candidateId);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCandidateParsed = (candidate: ExtractedResume) => {
    setSelectedCandidateId(candidate.candidate_id);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
        {/* Navigation Bar */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {activeTab === 'landing' && <LandingPage onNavigate={handleNavigate} />}
          {activeTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
          {activeTab === 'upload' && (
            <UploadPage
              onNavigate={handleNavigate}
              onCandidateParsed={handleCandidateParsed}
            />
          )}
          {activeTab === 'analysis' && (
            <AnalysisPage
              initialCandidateId={selectedCandidateId}
              onNavigate={handleNavigate}
            />
          )}
          {activeTab === 'matching' && (
            <MatchingPage
              initialCandidateId={selectedCandidateId}
              onNavigate={handleNavigate}
            />
          )}
          {activeTab === 'candidates' && <ExplorerPage onNavigate={handleNavigate} />}
          {activeTab === 'settings' && <SettingsPage onNavigate={handleNavigate} />}
        </main>

        {/* Professional Footer */}
        <footer className="bg-white border-t border-slate-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                R
              </div>
              <span className="font-semibold text-slate-800">Resumate AI</span>
              <span>• Artificial Intelligence Internship Project</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => handleNavigate('settings')}
                className="hover:text-slate-800 transition-colors"
              >
                Privacy & Ethics
              </button>
              <button
                onClick={() => handleNavigate('upload')}
                className="hover:text-slate-800 transition-colors"
              >
                Upload Documents
              </button>
              <button
                onClick={() => handleNavigate('dashboard')}
                className="hover:text-slate-800 transition-colors"
              >
                Dashboard
              </button>
            </div>

            <div className="text-slate-400">
              Built with FastAPI, PyMuPDF, spaCy & React
            </div>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}

export default App;
