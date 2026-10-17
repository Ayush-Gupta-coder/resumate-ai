/**
 * API Client for Resumate AI
 */
import {
  ParseResponse,
  BatchParseResponse,
  ExtractedResume,
  JobMatchResult,
  WeightConfiguration,
  CandidateListResponse,
  AnalyticsResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api';

export async function checkHealth(): Promise<{ status: string; service: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'offline', service: 'Resumate AI Backend' };
  }
}

export async function parseSingleResume(file: File, persist = true): Promise<ParseResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('persist', String(persist));

  const res = await fetch(`${API_BASE}/resumes/parse`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Server returned error (${res.status})`);
  }

  return await res.json();
}

export async function batchParseResumes(files: File[], persist = true): Promise<BatchParseResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  formData.append('persist', String(persist));

  const res = await fetch(`${API_BASE}/resumes/batch-parse`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Batch upload failed (${res.status})`);
  }

  return await res.json();
}

export async function matchResumeWithJob(payload: {
  candidate_id?: string;
  resume_data?: ExtractedResume;
  job_description: string;
  job_title?: string;
  weights?: WeightConfiguration;
}): Promise<JobMatchResult> {
  const res = await fetch(`${API_BASE}/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Matching calculation failed (${res.status})`);
  }

  return await res.json();
}

export async function getCandidates(params: {
  search?: string;
  skill?: string;
  sort_by?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<CandidateListResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.skill) query.set('skill', params.skill);
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.limit) query.set('limit', String(params.limit));
  if (params.offset) query.set('offset', String(params.offset));

  const res = await fetch(`${API_BASE}/candidates?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load candidates');
  return await res.json();
}

export async function getCandidateDetails(candidateId: string): Promise<ExtractedResume> {
  const res = await fetch(`${API_BASE}/candidates/${candidateId}`);
  if (!res.ok) throw new Error('Candidate not found');
  return await res.json();
}

export async function deleteCandidateRecord(candidateId: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/candidates/${candidateId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete candidate record');
  return await res.json();
}

export async function clearAllCandidates(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/candidates`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to reset candidate records');
  return await res.json();
}

export async function getAnalytics(): Promise<AnalyticsResponse> {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error('Failed to retrieve analytics metrics');
  return await res.json();
}

export function getExportCsvUrl(): string {
  return `${API_BASE}/export/csv`;
}

export function getExportJsonUrl(): string {
  return `${API_BASE}/export/json`;
}
