"""
Candidate Explorer and persistence API endpoints.
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.models.schemas import CandidateListResponse, ExtractedResume
from app.services.storage import (
    list_candidates,
    get_candidate,
    delete_candidate,
    clear_all_candidates,
)

router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.get("", response_model=CandidateListResponse)
async def get_all_candidates(
    search: Optional[str] = Query(None, description="Search by name, email, filename, or skills"),
    skill: Optional[str] = Query(None, description="Filter by specific skill"),
    sort_by: str = Query("newest", description="Sort order: newest, highest_score, name"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Retrieves candidates with search, filtering by detected skill, sorting, and pagination.
    """
    total, items = list_candidates(
        search=search,
        skill=skill,
        sort_by=sort_by,
        limit=limit,
        offset=offset
    )
    return CandidateListResponse(total=total, items=items)


@router.get("/{candidate_id}", response_model=ExtractedResume)
async def get_candidate_details(candidate_id: str):
    """
    Retrieves full parsed resume details for a candidate.
    """
    candidate = get_candidate(candidate_id)
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID '{candidate_id}' was not found."
        )
    return candidate


@router.delete("/{candidate_id}")
async def remove_candidate(candidate_id: str):
    """
    Deletes candidate record and associated job match records from database.
    """
    success = delete_candidate(candidate_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID '{candidate_id}' could not be deleted or does not exist."
        )
    return {"success": True, "message": f"Candidate '{candidate_id}' deleted successfully."}


@router.delete("")
async def remove_all_candidates():
    """
    Clears all candidate records for privacy / data reset.
    """
    count = clear_all_candidates()
    return {"success": True, "message": f"All {count} candidate records removed."}
