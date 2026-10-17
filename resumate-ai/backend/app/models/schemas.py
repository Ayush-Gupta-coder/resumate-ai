"""
Pydantic schemas for Resumate AI API requests and responses.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class CandidateEducation(BaseModel):
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    institution: Optional[str] = None
    year: Optional[str] = None
    gpa: Optional[str] = None


class CandidateExperience(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    dates: Optional[str] = None
    description: Optional[str] = None
    bullet_points: List[str] = Field(default_factory=list)


class CandidateProject(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    link: Optional[str] = None


class CandidateCertification(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    year: Optional[str] = None


class ExtractedResume(BaseModel):
    candidate_id: str
    filename: str
    raw_text: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    summary: Optional[str] = None
    technical_skills: List[str] = Field(default_factory=list)
    soft_skills: List[str] = Field(default_factory=list)
    education: List[CandidateEducation] = Field(default_factory=list)
    experience: List[CandidateExperience] = Field(default_factory=list)
    projects: List[CandidateProject] = Field(default_factory=list)
    certifications: List[CandidateCertification] = Field(default_factory=list)
    parse_status: str = "success"  # "success", "partial", "failed"
    created_at: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    latest_match_score: Optional[float] = None


class ParseResponse(BaseModel):
    success: bool
    message: str
    candidate: Optional[ExtractedResume] = None
    errors: List[str] = Field(default_factory=list)


class BatchParseResponse(BaseModel):
    total_files: int
    successful_count: int
    failed_count: int
    candidates: List[ExtractedResume] = Field(default_factory=list)
    errors: List[Dict[str, str]] = Field(default_factory=list)


class WeightConfiguration(BaseModel):
    skills: float = Field(default=0.65, ge=0.0, le=1.0)
    experience: float = Field(default=0.20, ge=0.0, le=1.0)
    education: float = Field(default=0.15, ge=0.0, le=1.0)


class JobMatchRequest(BaseModel):
    candidate_id: Optional[str] = None
    resume_data: Optional[ExtractedResume] = None
    job_title: Optional[str] = None
    job_description: str = Field(..., min_length=10)
    weights: Optional[WeightConfiguration] = None


class LearningSuggestion(BaseModel):
    skill: str
    category: str
    description: str
    recommended_resource: Optional[str] = None


class JobMatchResult(BaseModel):
    candidate_id: Optional[str] = None
    candidate_name: Optional[str] = None
    job_title: Optional[str] = "Job Position"
    overall_score: float = Field(..., ge=0.0, le=100.0)
    skill_score: float = Field(..., ge=0.0, le=100.0)
    experience_score: float = Field(..., ge=0.0, le=100.0)
    education_score: float = Field(..., ge=0.0, le=100.0)
    matching_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    candidate_skills: List[str] = Field(default_factory=list)
    required_job_skills: List[str] = Field(default_factory=list)
    additional_relevant_skills: List[str] = Field(default_factory=list)
    evidence: List[Dict[str, str]] = Field(default_factory=list)
    score_breakdown: Dict[str, Any] = Field(default_factory=dict)
    suggestions: List[LearningSuggestion] = Field(default_factory=list)
    ethical_notice: str
    created_at: str


class CandidateListItem(BaseModel):
    candidate_id: str
    filename: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    technical_skills: List[str] = Field(default_factory=list)
    education_summary: Optional[str] = None
    experience_summary: Optional[str] = None
    latest_match_score: Optional[float] = None
    parse_status: str
    created_at: str


class CandidateListResponse(BaseModel):
    total: int
    items: List[CandidateListItem]


class SkillDistribution(BaseModel):
    skill: str
    count: int
    percentage: float


class ScoreBin(BaseModel):
    range: str
    count: int


class AnalyticsResponse(BaseModel):
    total_resumes: int
    parsed_successfully: int
    average_match_score: float
    top_skills: List[SkillDistribution]
    match_score_distribution: List[ScoreBin]
    education_levels: List[Dict[str, Any]]
    recent_candidates: List[CandidateListItem]
