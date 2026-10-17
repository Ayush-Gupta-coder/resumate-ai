"""
Job description matching API endpoints.
"""
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import JobMatchRequest, JobMatchResult
from app.services.job_matcher import compute_job_match
from app.services.storage import get_candidate, save_job_match

router = APIRouter(prefix="/match", tags=["Job Matching"])


@router.post("", response_model=JobMatchResult)
async def match_resume_with_job(request: JobMatchRequest):
    """
    Compares candidate resume with a job description.
    Accepts either an existing candidate_id or an inline ExtractedResume object.
    Calculates explainable weighted scores, identifies matching and missing skills,
    and returns learning suggestions.
    """
    resume = None
    if request.resume_data:
        resume = request.resume_data
    elif request.candidate_id:
        resume = get_candidate(request.candidate_id)
        if not resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Candidate with ID '{request.candidate_id}' not found."
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'candidate_id' or 'resume_data' must be supplied."
        )

    if not request.job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description cannot be empty."
        )

    result = compute_job_match(
        resume=resume,
        job_description=request.job_description,
        job_title=request.job_title or "Target Position",
        weights=request.weights
    )

    # Persist the match in database
    try:
        save_job_match(result)
    except Exception:
        pass

    return result
