"""
Resume upload and parsing API endpoints.
"""
from typing import List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.models.schemas import ParseResponse, BatchParseResponse, ExtractedResume
from app.services.document_extractor import (
    extract_document,
    DocumentExtractionError,
)
from app.services.nlp_parser import parse_resume_to_candidate
from app.services.storage import save_candidate

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/parse", response_model=ParseResponse)
async def parse_resume(
    file: UploadFile = File(...),
    persist: bool = Form(True)
):
    """
    Parses a single resume file (PDF or DOCX).
    Extracts structured candidate details, skills, education, and experience.
    """
    try:
        content = await file.read()
        raw_text, metadata, sections = extract_document(file.filename or "resume.pdf", content)
        candidate = parse_resume_to_candidate(
            filename=file.filename or "resume.pdf",
            raw_text=raw_text,
            metadata=metadata,
            sections=sections
        )

        if persist:
            save_candidate(candidate)

        return ParseResponse(
            success=True,
            message="Resume parsed successfully.",
            candidate=candidate,
            errors=[]
        )
    except DocumentExtractionError as de_err:
        return ParseResponse(
            success=False,
            message="Failed to process document.",
            candidate=None,
            errors=[str(de_err)]
        )
    except Exception as exc:
        return ParseResponse(
            success=False,
            message="Unexpected error during resume parsing.",
            candidate=None,
            errors=[f"Parsing error: {str(exc)}"]
        )


@router.post("/batch-parse", response_model=BatchParseResponse)
async def batch_parse_resumes(
    files: List[UploadFile] = File(...),
    persist: bool = Form(True)
):
    """
    Parses multiple resumes concurrently and aggregates results and errors.
    """
    if not files:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No files uploaded.")

    successful_candidates: List[ExtractedResume] = []
    errors: List[dict] = []

    for file in files:
        try:
            content = await file.read()
            raw_text, metadata, sections = extract_document(file.filename or "unknown", content)
            candidate = parse_resume_to_candidate(
                filename=file.filename or "unknown",
                raw_text=raw_text,
                metadata=metadata,
                sections=sections
            )
            if persist:
                save_candidate(candidate)
            successful_candidates.append(candidate)
        except DocumentExtractionError as de_err:
            errors.append({"filename": file.filename or "unknown", "error": str(de_err)})
        except Exception as exc:
            errors.append({"filename": file.filename or "unknown", "error": f"Internal error: {str(exc)}"})

    return BatchParseResponse(
        total_files=len(files),
        successful_count=len(successful_candidates),
        failed_count=len(errors),
        candidates=successful_candidates,
        errors=errors
    )
