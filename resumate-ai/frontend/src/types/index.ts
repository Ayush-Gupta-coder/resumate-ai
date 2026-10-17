export interface CandidateEducation {
  degree?: string | null;
  field_of_study?: string | null;
  institution?: string | null;
  year?: string | null;
  gpa?: string | null;
}

export interface CandidateExperience {
  title?: string | null;
  company?: string | null;
  location?: string | null;
  dates?: string | null;
  description?: string | null;
  bullet_points: string[];
}

export interface CandidateProject {
  title?: string | null;
  description?: string | null;
  technologies: string[];
  link?: string | null;
}

export interface CandidateCertification {
  name?: string | null;
  issuer?: string | null;
  year?: string | null;
}

export interface ExtractedResume {
  candidate_id: string;
  filename: string;
  raw_text: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedin?: string | null;
  github?: string | null;
  portfolio?: string | null;
  summary?: string | null;
  technical_skills: string[];
  soft_skills: string[];
  education: CandidateEducation[];
  experience: CandidateExperience[];
  projects: CandidateProject[];
  certifications: CandidateCertification[];
  parse_status: 'success' | 'partial' | 'failed';
  created_at: string;
  metadata?: Record<string, any>;
  latest_match_score?: number | null;
}

export interface ParseResponse {
  success: boolean;
  message: string;
  candidate?: ExtractedResume | null;
  errors: string[];
}

export interface BatchParseResponse {
  total_files: number;
  successful_count: number;
  failed_count: number;
  candidates: ExtractedResume[];
  errors: { filename: string; error: string }[];
}

export interface WeightConfiguration {
  skills: number;
  experience: number;
  education: number;
}

export interface LearningSuggestion {
  skill: string;
  category: string;
  description: string;
  recommended_resource?: string | null;
}

export interface JobMatchResult {
  candidate_id?: string | null;
  candidate_name?: string | null;
  job_title?: string;
  overall_score: number;
  skill_score: number;
  experience_score: number;
  education_score: number;
  matching_skills: string[];
  missing_skills: string[];
  candidate_skills: string[];
  required_job_skills: string[];
  additional_relevant_skills: string[];
  evidence: { category: string; detail: string }[];
  score_breakdown: {
    formula: string;
    weights_applied: { skills: number; experience: number; education: number };
    component_scores: { skill_score: number; experience_score: number; education_score: number };
    skill_metrics: {
      required_count: number;
      matched_count: number;
      missing_count: number;
      coverage_percentage: number;
    };
  };
  suggestions: LearningSuggestion[];
  ethical_notice: string;
  created_at: string;
}

export interface CandidateListItem {
  candidate_id: string;
  filename: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  technical_skills: string[];
  education_summary?: string | null;
  experience_summary?: string | null;
  latest_match_score?: number | null;
  parse_status: string;
  created_at: string;
}

export interface CandidateListResponse {
  total: number;
  items: CandidateListItem[];
}

export interface SkillDistribution {
  skill: string;
  count: number;
  percentage: number;
}

export interface ScoreBin {
  range: string;
  count: number;
}

export interface AnalyticsResponse {
  total_resumes: number;
  parsed_successfully: number;
  average_match_score: number;
  top_skills: SkillDistribution[];
  match_score_distribution: ScoreBin[];
  education_levels: { level: string; count: number }[];
  recent_candidates: CandidateListItem[];
}
