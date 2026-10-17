"""
Unit tests for document extraction service.
"""
import pytest
from app.services.document_extractor import (
    validate_file_content,
    extract_text_from_pdf,
    extract_text_from_docx,
    segment_sections,
    DocumentExtractionError,
)


def test_validate_empty_file():
    with pytest.raises(DocumentExtractionError) as excinfo:
        validate_file_content("test.pdf", b"")
    assert "empty" in str(excinfo.value)


def test_validate_unsupported_extension():
    with pytest.raises(DocumentExtractionError) as excinfo:
        validate_file_content("image.png", b"test_content")
    assert "Unsupported file format" in str(excinfo.value)


def test_validate_invalid_pdf_signature():
    with pytest.raises(DocumentExtractionError) as excinfo:
        validate_file_content("test.pdf", b"INVALID_BYTES_NOT_PDF")
    assert "lacks a valid PDF file signature" in str(excinfo.value)


def test_pdf_extraction_sample():
    with open("sample_data/resumes/alex_rivera_ai_engineer.pdf", "rb") as f:
        content = f.read()
    text, meta = extract_text_from_pdf(content)
    assert "Alex Rivera" in text
    assert "PyTorch" in text
    assert meta["format"] == "pdf"
    assert meta["page_count"] >= 1
    assert meta["word_count"] > 50


def test_docx_extraction_sample():
    with open("sample_data/resumes/priya_sharma_fullstack.docx", "rb") as f:
        content = f.read()
    text, meta = extract_text_from_docx(content)
    assert "Priya Sharma" in text
    assert "React" in text
    assert meta["format"] == "docx"
    assert meta["word_count"] > 50


def test_section_segmentation():
    sample_text = """John Doe
john@email.com

PROFESSIONAL SUMMARY
Experienced software engineer.

TECHNICAL SKILLS
Python, JavaScript, SQL

WORK EXPERIENCE
Software Engineer at TechCorp
2021 - Present
- Built features

EDUCATION
B.S. in Computer Science, University of California, 2020
"""
    sections = segment_sections(sample_text)
    assert "header" in sections
    assert "John Doe" in sections["header"]
    assert "summary" in sections
    assert "skills" in sections
    assert "experience" in sections
    assert "education" in sections
