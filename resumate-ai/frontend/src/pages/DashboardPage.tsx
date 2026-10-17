import React, { useEffect, useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Percent,
  TrendingUp,
  UploadCloud,
  Briefcase,
  RefreshCw,
  Users,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { getAnalytics } from '../services/api';
import { AnalyticsResponse } from '../types';
import { SkillBadge } from '../components/SkillBadge';

interface DashboardPageProps {
  onNavigate: (tab: string, candidateId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAnalytics();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const barColors = ['#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac'];

  if (loading) {
    return (
      <div className="space-y-8 py-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg" />
          <div className="h-8 w-28 bg-slate-200 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl p-5 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          <div className="h-72 bg-white border border-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Unable to load analytics</h3>
        <p className="text-sm text-slate-600">{error}</p>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  const hasData = data && data.total_resumes > 0;

  return (
    <div className="space-y-8 py-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Recruiter Analytics Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time candidate metrics computed directly from parsed resume records.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchMetrics}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium shadow-2xs flex items-center gap-1.5 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => onNavigate('upload')}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-medium shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Resumes</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Processed */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Resumes</p>
            <p className="text-3xl font-extrabold text-slate-900">{data?.total_resumes || 0}</p>
            <p className="text-[11px] text-slate-500">Processed in database</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Successfully Parsed */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Parsed Successfully</p>
            <p className="text-3xl font-extrabold text-slate-900">{data?.parsed_successfully || 0}</p>
            <p className="text-[11px] text-emerald-600 font-medium">
              {data && data.total_resumes > 0
                ? `${Math.round((data.parsed_successfully / data.total_resumes) * 100)}% parse success rate`
                : 'No resumes processed'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Avg Job Match Score */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Match Score</p>
            <p className="text-3xl font-extrabold text-slate-900">
              {data?.average_match_score ? `${data.average_match_score}%` : 'N/A'}
            </p>
            <p className="text-[11px] text-slate-500">Across evaluated candidates</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        {/* Top Skill Count */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Skill</p>
            <p className="text-xl font-bold text-slate-900 truncate max-w-[140px]">
              {data?.top_skills?.[0]?.skill || 'None'}
            </p>
            <p className="text-[11px] text-slate-500">
              {data?.top_skills?.[0] ? `${data.top_skills[0].count} candidate occurrences` : 'No skills recorded'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts or Empty State */}
      {!hasData ? (
        <div className="p-12 rounded-2xl bg-white border border-slate-200 shadow-xs text-center max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Candidate Data Yet</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Upload candidate PDF or DOCX resumes to populate real-time skill distribution charts, matching scores, and candidate timelines.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => onNavigate('upload')}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm shadow-sm flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Sample Resumes</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Skills Chart */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Detected Skill Frequency</h3>
                  <p className="text-xs text-slate-500">Most common technical competencies across resumes</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-100">
                  Live DB Data
                </span>
              </div>
              <div className="h-64 w-full">
                {data.top_skills.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.top_skills} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                      <XAxis
                        dataKey="skill"
                        tick={{ fontSize: 11, fill: '#475569' }}
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="count" fill="#15803d" radius={[4, 4, 0, 0]}>
                        {data.top_skills.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No detected skills
                  </div>
                )}
              </div>
            </div>

            {/* Match Score Distribution Chart */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Match Score Distribution</h3>
                  <p className="text-xs text-slate-500">Candidate count across job-fit score brackets</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                  Evaluated Scores
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.match_score_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#475569' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#475569' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Candidates Table */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Candidate Activity</h3>
                <p className="text-xs text-slate-500">Recently parsed resumes and their evaluated status</p>
              </div>
              <button
                onClick={() => onNavigate('candidates')}
                className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>View All Candidates</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Candidate</th>
                    <th className="px-4 py-3">Top Detected Skills</th>
                    <th className="px-4 py-3">Match Score</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recent_candidates.map((cand) => (
                    <tr key={cand.candidate_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{cand.name || 'Unknown Candidate'}</div>
                        <div className="text-xs text-slate-500">{cand.email || cand.filename}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {cand.technical_skills.slice(0, 3).map((s) => (
                            <SkillBadge key={s} name={s} size="sm" />
                          ))}
                          {cand.technical_skills.length > 3 && (
                            <span className="text-xs text-slate-400 self-center">
                              +{cand.technical_skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {cand.latest_match_score !== null ? (
                          <span className="inline-flex items-center font-bold text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {cand.latest_match_score}%
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Not Matched</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            cand.parse_status === 'success'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {cand.parse_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onNavigate('analysis', cand.candidate_id)}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded hover:bg-emerald-50"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
