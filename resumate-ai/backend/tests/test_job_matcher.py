"""
Unit tests for explainable job matching algorithm.
"""
from app.models.schemas import ExtractedResume, WeightConfiguration
from app.services.job_matcher import compute_job_match


def test_job_match_scoring():
    resume = ExtractedResume(
        candidate_id="test_cand_1",
        filename="test.pdf",
        raw_text="Sample text",
        name="Alex Rivera",
        technical_skills=["Python", "FastAPI", "Docker", "PyTorch"],
        soft_skills=["Problem Solving"],
        created_at="2026-10-16T12:00:00Z"
    )

    jd = """
    Looking for a Senior AI Engineer.
    Requirements:
    - Proficient in Python, PyTorch, and Docker.
    - Experience with Kubernetes and AWS.
    - Strong Problem Solving abilities.
    """

    res = compute_job_match(resume, jd)
    assert res.overall_score > 0
    assert "Python" in res.matching_skills
    assert "PyTorch" in res.matching_skills
    assert "Kubernetes" in res.missing_skills or "AWS" in res.missing_skills
    assert len(res.suggestions) > 0
    assert "ethical_notice" in res.model_dump()
    assert "formula" in res.score_breakdown


def test_custom_weights_effect():
    resume = ExtractedResume(
        candidate_id="test_cand_2",
        filename="test.pdf",
        raw_text="Sample",
        technical_skills=["Python", "SQL"],
        created_at="2026-10-16T12:00:00Z"
    )

    jd = "Requirements: Python, SQL"

    # Heavily weight skills (1.0)
    weights_skill_heavy = WeightConfiguration(skills=1.0, experience=0.0, education=0.0)
    res_skill = compute_job_match(resume, jd, weights=weights_skill_heavy)

    # 100% skill match should equal 100 overall score when skills weight is 1.0
    assert res_skill.skill_score == 100.0
    assert res_skill.overall_score == 100.0
