"""
Integration tests for FastAPI endpoints.
"""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Resumate AI Backend"


def test_parse_and_candidates_crud():
    # 1. Parse sample PDF resume
    with open("sample_data/resumes/alex_rivera_ai_engineer.pdf", "rb") as f:
        response = client.post(
            "/api/resumes/parse",
            files={"file": ("alex_rivera_ai_engineer.pdf", f, "application/pdf")},
            data={"persist": True}
        )
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    candidate = res_data["candidate"]
    assert candidate is not None
    cid = candidate["candidate_id"]
    assert candidate["name"] == "Alex Rivera"
    assert "PyTorch" in candidate["technical_skills"]

    # 2. Retrieve Candidate by ID
    get_res = client.get(f"/api/candidates/{cid}")
    assert get_res.status_code == 200
    assert get_res.json()["candidate_id"] == cid

    # 3. List candidates
    list_res = client.get("/api/candidates?search=Alex")
    assert list_res.status_code == 200
    items = list_res.json()["items"]
    assert len(items) >= 1

    # 4. Run Job Match
    match_res = client.post(
        "/api/match",
        json={
            "candidate_id": cid,
            "job_description": "We are looking for an AI Engineer with PyTorch, Python, and Docker expertise.",
            "job_title": "AI Engineer"
        }
    )
    assert match_res.status_code == 200
    match_data = match_res.json()
    assert match_data["overall_score"] > 50.0
    assert "Python" in match_data["matching_skills"]

    # 5. Check Analytics
    analytics_res = client.get("/api/analytics")
    assert analytics_res.status_code == 200
    analytics = analytics_res.json()
    assert analytics["total_resumes"] >= 1
    assert analytics["parsed_successfully"] >= 1

    # 6. Check CSV and JSON exports
    csv_res = client.get("/api/export/csv")
    assert csv_res.status_code == 200
    assert "Candidate ID" in csv_res.text

    json_res = client.get("/api/export/json")
    assert json_res.status_code == 200
    assert isinstance(json_res.json(), list)

    # 7. Delete candidate
    del_res = client.delete(f"/api/candidates/{cid}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # 8. Verify candidate was deleted
    del_check = client.get(f"/api/candidates/{cid}")
    assert del_check.status_code == 404
