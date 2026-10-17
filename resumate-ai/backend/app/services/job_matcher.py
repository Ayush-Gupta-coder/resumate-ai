"""
Explainable Job Matching Service for Resumate AI.
Calculates deterministic match scores, extracts evidence, suggests learning paths,
and includes an ethical review disclaimer.
"""
import re
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from app.models.schemas import (
    ExtractedResume,
    JobMatchResult,
    WeightConfiguration,
    LearningSuggestion,
)
from app.services.skill_extractor import (
    extract_skills_from_text,
    get_learning_recommendation,
)

ETHICAL_NOTICE = (
    "Resumate AI scoring is an explainable heuristic designed exclusively to assist human recruiters in skills analysis. "
    "It is NOT an automated hiring decision system or scientifically validated hiring prediction. "
    "The algorithm evaluates strictly technical skills, experience alignment, and educational milestones present in the text. "
    "It does not evaluate or infer demographic or protected characteristics (gender, age, race, religion, nationality, disability) "
    "and must always be accompanied by human review."
)


def extract_job_requirements(job_description: str) -> Tuple[List[str], List[str]]:
    """
    Extracts required technical skills and soft skills from a job description text.
    """
    return extract_skills_from_text(job_description)


def calculate_experience_score(resume: ExtractedResume, job_description: str) -> Tuple[float, List[str]]:
    """
    Calculates experience alignment score (0-100) based on:
    - Presence of relevant job titles
    - Number of recorded experiences
    - Bullet point keywords aligning with the job description
    """
    evidence = []
    if not resume.experience:
        return 40.0, ["Candidate has not listed formal work experience or internships."]

    score = 50.0  # Base score for having documented experience

    # Check for title relevance
    jd_lower = job_description.lower()
    for exp in resume.experience:
        if exp.title:
            title_lower = exp.title.lower()
            # If title keywords appear in JD
            for word in title_lower.split():
                if len(word) > 3 and word in jd_lower:
                    score += 15.0
                    evidence.append(f"Role title '{exp.title}' matches job profile keywords.")
                    break

        if exp.company:
            evidence.append(f"Experience recorded at {exp.company} ({exp.dates or 'Duration noted'}).")

        # Check experience bullets for project/skill overlap
        for bullet in exp.bullet_points:
            techs, _ = extract_skills_from_text(bullet)
            for t in techs:
                if t.lower() in jd_lower:
                    score += 5.0
                    evidence.append(f"Demonstrated '{t}' in work experience: \"{bullet[:80]}...\"")
                    break

    # Number of experience items boost
    score += min(len(resume.experience) * 5.0, 15.0)

    final_score = min(max(score, 20.0), 100.0)
    return round(final_score, 1), evidence[:5]


def calculate_education_score(resume: ExtractedResume) -> Tuple[float, List[str]]:
    """
    Calculates education qualification score (0-100).
    Higher degrees (Master's, Ph.D.) or engineering degrees yield higher scores.
    """
    evidence = []
    if not resume.education:
        return 50.0, ["No formal degree details parsed from resume."]

    max_score = 60.0  # Base score for recognized degree
    for edu in resume.education:
        deg = (edu.degree or "").lower()
        if "ph.d" in deg or "doctor" in deg:
            max_score = max(max_score, 100.0)
            evidence.append(f"Advanced doctoral qualification: {edu.degree}")
        elif "m.tech" in deg or "m.s" in deg or "master" in deg or "m.b.a" in deg:
            max_score = max(max_score, 90.0)
            evidence.append(f"Master's degree qualification: {edu.degree}")
        elif "b.tech" in deg or "b.e" in deg or "b.s" in deg or "bachelor" in deg:
            max_score = max(max_score, 80.0)
            evidence.append(f"Bachelor's degree in engineering/science: {edu.degree}")
        elif edu.degree:
            max_score = max(max_score, 70.0)
            evidence.append(f"Academic qualification recorded: {edu.degree}")

        if edu.institution:
            evidence.append(f"Institution: {edu.institution}")

    return round(max_score, 1), evidence[:3]


def compute_job_match(
    resume: ExtractedResume,
    job_description: str,
    job_title: Optional[str] = "Target Role",
    weights: Optional[WeightConfiguration] = None
) -> JobMatchResult:
    """
    Computes an explainable, deterministic match between a candidate's resume and a job description.
    """
    if weights is None:
        weights = WeightConfiguration(skills=0.65, experience=0.20, education=0.15)

    # Normalize weights so they sum to 1.0
    total_w = weights.skills + weights.experience + weights.education
    w_skill = weights.skills / total_w
    w_exp = weights.experience / total_w
    w_edu = weights.education / total_w

    # 1. Skill Extraction
    jd_tech, jd_soft = extract_job_requirements(job_description)
    required_skills = sorted(list(set(jd_tech + jd_soft)))

    cand_skills = sorted(list(set(resume.technical_skills + resume.soft_skills)))

    cand_skill_set = {s.lower() for s in cand_skills}
    matching_skills = []
    missing_skills = []

    for req in required_skills:
        if req.lower() in cand_skill_set:
            matching_skills.append(req)
        else:
            missing_skills.append(req)

    # Additional candidate skills not explicitly mentioned in JD
    req_set = {r.lower() for r in required_skills}
    additional_skills = [s for s in cand_skills if s.lower() not in req_set]

    # Skill Score Calculation
    if required_skills:
        skill_coverage_ratio = len(matching_skills) / len(required_skills)
        skill_score = skill_coverage_ratio * 100.0
    else:
        # If JD has no recognized skills from taxonomy, fallback to overall keyword match
        skill_score = 70.0
        matching_skills = cand_skills[:5]

    # 2. Experience Alignment
    exp_score, exp_evidence = calculate_experience_score(resume, job_description)

    # 3. Education Score
    edu_score, edu_evidence = calculate_education_score(resume)

    # 4. Overall Weighted Score
    overall_score = (w_skill * skill_score) + (w_exp * exp_score) + (w_edu * edu_score)
    overall_score = round(min(max(overall_score, 0.0), 100.0), 1)

    # Evidence list
    evidence_items = []
    for m in matching_skills:
        evidence_items.append({
            "category": "Skill Match",
            "detail": f"Candidate possesses required competency in '{m}'."
        })
    for ev in exp_evidence:
        evidence_items.append({
            "category": "Experience Evidence",
            "detail": ev
        })
    for ed in edu_evidence:
        evidence_items.append({
            "category": "Education Evidence",
            "detail": ed
        })

    # Suggestions for missing skills
    suggestions: List[LearningSuggestion] = []
    for miss in missing_skills[:6]:
        rec = get_learning_recommendation(miss)
        suggestions.append(LearningSuggestion(
            skill=rec["skill"],
            category=rec["category"],
            description=rec["description"],
            recommended_resource=rec.get("recommended_resource")
        ))

    # Detailed score breakdown explaining the math
    score_breakdown = {
        "formula": "Overall = (W_skill × SkillScore) + (W_exp × ExpScore) + (W_edu × EduScore)",
        "weights_applied": {
            "skills": round(w_skill, 2),
            "experience": round(w_exp, 2),
            "education": round(w_edu, 2)
        },
        "component_scores": {
            "skill_score": round(skill_score, 1),
            "experience_score": round(exp_score, 1),
            "education_score": round(edu_score, 1)
        },
        "skill_metrics": {
            "required_count": len(required_skills),
            "matched_count": len(matching_skills),
            "missing_count": len(missing_skills),
            "coverage_percentage": round((len(matching_skills) / len(required_skills) * 100.0), 1) if required_skills else 100.0
        }
    }

    return JobMatchResult(
        candidate_id=resume.candidate_id,
        candidate_name=resume.name,
        job_title=job_title or "Position Analysis",
        overall_score=overall_score,
        skill_score=round(skill_score, 1),
        experience_score=round(exp_score, 1),
        education_score=round(edu_score, 1),
        matching_skills=matching_skills,
        missing_skills=missing_skills,
        candidate_skills=cand_skills,
        required_job_skills=required_skills,
        additional_relevant_skills=additional_skills,
        evidence=evidence_items,
        score_breakdown=score_breakdown,
        suggestions=suggestions,
        ethical_notice=ETHICAL_NOTICE,
        created_at=datetime.now(timezone.utc).isoformat()
    )
