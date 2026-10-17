"""
Automated QA Verification Script for Resumate AI.
Tests the live backend and proxy end-to-end with real synthetic documents.
"""
import sys
import os
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"
PROXY_URL = "http://127.0.0.1:5173/api"
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
SAMPLE_DIR = os.path.join(PROJECT_ROOT, "sample_data", "resumes")
JD_DIR = os.path.join(PROJECT_ROOT, "sample_data", "job_descriptions")


def run_qa_checks():
    print("==================================================")
    print(" RESUMATE AI - COMPREHENSIVE QA VERIFICATION SUITE")
    print("==================================================")
    passed = 0
    total = 0

    def check(test_name: str, condition: bool, details: str = ""):
        nonlocal passed, total
        total += 1
        if condition:
            passed += 1
            print(f" [PASS] {test_name} {details}")
        else:
            print(f" [FAIL] {test_name} {details}")

    # 1. Health check via backend
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=5)
        check("Backend Health Check", r.status_code == 200 and r.json().get("status") == "healthy", f"HTTP {r.status_code}")
    except Exception as e:
        check("Backend Health Check", False, str(e))

    # 2. Frontend Web Server Check
    try:
        r = requests.get("http://127.0.0.1:5173/", timeout=5)
        check("Frontend Vite Server Response", r.status_code == 200 and "html" in r.text.lower(), f"HTTP {r.status_code}")
    except Exception as e:
        check("Frontend Vite Server Response", False, str(e))

    # 3. PDF Parsing (Alex Rivera)
    alex_pdf = os.path.join(SAMPLE_DIR, "alex_rivera_ai_engineer.pdf")
    alex_cid = None
    try:
        with open(alex_pdf, "rb") as f:
            r = requests.post(f"{BASE_URL}/resumes/parse", files={"file": ("alex_rivera_ai_engineer.pdf", f, "application/pdf")})
        data = r.json()
        cand = data.get("candidate", {})
        alex_cid = cand.get("candidate_id")
        check(
            "PDF Parsing (Alex Rivera)",
            r.status_code == 200 and cand.get("name") == "Alex Rivera" and "PyTorch" in cand.get("technical_skills", []),
            f"Extracted: Name='{cand.get('name')}', Skills={len(cand.get('technical_skills', []))}"
        )
    except Exception as e:
        check("PDF Parsing (Alex Rivera)", False, str(e))

    # 4. DOCX Parsing (Priya Sharma)
    priya_docx = os.path.join(SAMPLE_DIR, "priya_sharma_fullstack.docx")
    priya_cid = None
    try:
        with open(priya_docx, "rb") as f:
            r = requests.post(f"{BASE_URL}/resumes/parse", files={"file": ("priya_sharma_fullstack.docx", f, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")})
        data = r.json()
        cand = data.get("candidate", {})
        priya_cid = cand.get("candidate_id")
        check(
            "DOCX Parsing (Priya Sharma)",
            r.status_code == 200 and "Priya" in (cand.get("name") or "") and "React" in cand.get("technical_skills", []),
            f"Extracted: Name='{cand.get('name')}', Skills={len(cand.get('technical_skills', []))}"
        )
    except Exception as e:
        check("DOCX Parsing (Priya Sharma)", False, str(e))

    # 5. Invalid/Corrupted File Handling
    corrupt_file = os.path.join(SAMPLE_DIR, "corrupted_document.pdf")
    try:
        with open(corrupt_file, "rb") as f:
            r = requests.post(f"{BASE_URL}/resumes/parse", files={"file": ("corrupted_document.pdf", f, "application/pdf")})
        data = r.json()
        check(
            "Corrupt File Rejection",
            data.get("success") is False and len(data.get("errors", [])) > 0,
            f"Error message: '{data.get('errors', [''])[0]}'"
        )
    except Exception as e:
        check("Corrupt File Rejection", False, str(e))

    # 6. Job Matching with AI Engineer JD
    try:
        with open(os.path.join(JD_DIR, "senior_ai_engineer.txt"), "r") as f:
            jd_text = f.read()

        r = requests.post(f"{BASE_URL}/match", json={
            "candidate_id": alex_cid,
            "job_title": "Senior AI Engineer",
            "job_description": jd_text
        })
        match_data = r.json()
        check(
            "Explainable Job Matching (AI Engineer JD)",
            r.status_code == 200 and match_data.get("overall_score", 0) > 60.0 and len(match_data.get("matching_skills", [])) >= 3,
            f"Overall Score: {match_data.get('overall_score')}%, Matched: {match_data.get('matching_skills', [])}"
        )
    except Exception as e:
        check("Explainable Job Matching (AI Engineer JD)", False, str(e))

    # 7. Candidate Explorer Query & Search
    try:
        r = requests.get(f"{BASE_URL}/candidates?search=Alex")
        data = r.json()
        check(
            "Candidate Explorer Search Filter",
            r.status_code == 200 and data.get("total", 0) >= 1,
            f"Returned {data.get('total')} items"
        )
    except Exception as e:
        check("Candidate Explorer Search Filter", False, str(e))

    # 8. Real Analytics Aggregation
    try:
        r = requests.get(f"{BASE_URL}/analytics")
        analytics = r.json()
        check(
            "Live Analytics Calculation",
            r.status_code == 200 and analytics.get("total_resumes", 0) >= 2 and len(analytics.get("top_skills", [])) > 0,
            f"Total: {analytics.get('total_resumes')}, Top skill: {analytics.get('top_skills', [{}])[0].get('skill')}"
        )
    except Exception as e:
        check("Live Analytics Calculation", False, str(e))

    # 9. CSV and JSON Exports
    try:
        r_csv = requests.get(f"{BASE_URL}/export/csv")
        r_json = requests.get(f"{BASE_URL}/export/json")
        check(
            "CSV and JSON Exports",
            r_csv.status_code == 200 and "Candidate ID" in r_csv.text and r_json.status_code == 200 and isinstance(r_json.json(), list),
            f"CSV bytes: {len(r_csv.content)}, JSON records: {len(r_json.json())}"
        )
    except Exception as e:
        check("CSV and JSON Exports", False, str(e))

    # 10. Deletion and Cascade
    if priya_cid:
        try:
            r = requests.delete(f"{BASE_URL}/candidates/{priya_cid}")
            r_check = requests.get(f"{BASE_URL}/candidates/{priya_cid}")
            check(
                "Candidate Record Deletion",
                r.status_code == 200 and r_check.status_code == 404,
                f"DELETE returned {r.status_code}, Verification GET returned {r_check.status_code}"
            )
        except Exception as e:
            check("Candidate Record Deletion", False, str(e))

    print("==================================================")
    print(f" QA VERIFICATION SUMMARY: {passed} / {total} CHECKS PASSED")
    print("==================================================")
    return passed == total


if __name__ == "__main__":
    success = run_qa_checks()
    sys.exit(0 if success else 1)
