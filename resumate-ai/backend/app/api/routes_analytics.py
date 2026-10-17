"""
Analytics and Export API endpoints.
"""
from fastapi import APIRouter
from fastapi.responses import Response, JSONResponse
from app.models.schemas import AnalyticsResponse
from app.services.storage import (
    get_analytics,
    export_candidates_csv,
    export_candidates_json,
)

router = APIRouter(tags=["Analytics & Exports"])


@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics_metrics():
    """
    Computes real-time analytics from stored candidate records.
    Calculates total resumes, parsing rate, avg match score, skill frequencies,
    score distributions, and education breakdowns.
    """
    return get_analytics()


@router.get("/export/csv")
async def download_candidates_csv():
    """
    Exports all candidate records to a CSV file.
    """
    csv_data = export_candidates_csv()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=resumate_candidates_export.csv"
        }
    )


@router.get("/export/json")
async def download_candidates_json():
    """
    Exports full structured candidate data in JSON format.
    """
    json_data = export_candidates_json()
    return JSONResponse(
        content=json_data,
        headers={
            "Content-Disposition": "attachment; filename=resumate_candidates_export.json"
        }
    )
