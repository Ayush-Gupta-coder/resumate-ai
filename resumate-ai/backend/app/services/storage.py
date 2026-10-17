"""
SQLite persistence and analytics service for Resumate AI.
Provides thread-safe transactional storage, search, filtering, deletion,
and aggregated metrics from actual stored candidate data.
"""
import os
import json
import sqlite3
import csv
import io
from typing import List, Optional, Tuple, Dict, Any
from app.models.schemas import (
    ExtractedResume,
    CandidateListItem,
    JobMatchResult,
    AnalyticsResponse,
    SkillDistribution,
    ScoreBin,
)

DB_PATH = os.environ.get(
    "RESUMATE_DB_PATH",
    os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "candidates.db")
)


def get_db_connection() -> sqlite3.Connection:
    """Returns a SQLite connection with dict-like row access."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes database tables if they do not exist."""
    conn = get_db_connection()
    try:
        with conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS candidates (
                    candidate_id TEXT PRIMARY KEY,
                    filename TEXT NOT NULL,
                    name TEXT,
                    email TEXT,
                    phone TEXT,
                    parse_status TEXT NOT NULL,
                    parsed_json TEXT NOT NULL,
                    latest_match_score REAL,
                    created_at TEXT NOT NULL
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS job_matches (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    candidate_id TEXT NOT NULL,
                    job_title TEXT,
                    overall_score REAL NOT NULL,
                    match_json TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(candidate_id) REFERENCES candidates(candidate_id) ON DELETE CASCADE
                )
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_candidates_created ON candidates(created_at DESC)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(parse_status)")
    finally:
        conn.close()


# Ensure DB exists on import
init_db()


def save_candidate(candidate: ExtractedResume) -> ExtractedResume:
    """Persists or updates candidate record in SQLite."""
    conn = get_db_connection()
    try:
        with conn:
            conn.execute("""
                INSERT INTO candidates (
                    candidate_id, filename, name, email, phone,
                    parse_status, parsed_json, latest_match_score, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(candidate_id) DO UPDATE SET
                    filename = excluded.filename,
                    name = excluded.name,
                    email = excluded.email,
                    phone = excluded.phone,
                    parse_status = excluded.parse_status,
                    parsed_json = excluded.parsed_json,
                    latest_match_score = COALESCE(excluded.latest_match_score, candidates.latest_match_score)
            """, (
                candidate.candidate_id,
                candidate.filename,
                candidate.name,
                candidate.email,
                candidate.phone,
                candidate.parse_status,
                json.dumps(candidate.model_dump()),
                candidate.latest_match_score,
                candidate.created_at
            ))
        return candidate
    finally:
        conn.close()


def get_candidate(candidate_id: str) -> Optional[ExtractedResume]:
    """Retrieves single candidate by candidate_id."""
    conn = get_db_connection()
    try:
        row = conn.execute(
            "SELECT parsed_json, latest_match_score FROM candidates WHERE candidate_id = ?",
            (candidate_id,)
        ).fetchone()
        if not row:
            return None
        data = json.loads(row["parsed_json"])
        data["latest_match_score"] = row["latest_match_score"]
        return ExtractedResume(**data)
    finally:
        conn.close()


def delete_candidate(candidate_id: str) -> bool:
    """Deletes candidate and their job matches."""
    conn = get_db_connection()
    try:
        with conn:
            conn.execute("DELETE FROM job_matches WHERE candidate_id = ?", (candidate_id,))
            cursor = conn.execute("DELETE FROM candidates WHERE candidate_id = ?", (candidate_id,))
            return cursor.rowcount > 0
    finally:
        conn.close()


def clear_all_candidates() -> int:
    """Clears all stored candidate records for privacy / resetting."""
    conn = get_db_connection()
    try:
        with conn:
            conn.execute("DELETE FROM job_matches")
            cursor = conn.execute("DELETE FROM candidates")
            return cursor.rowcount
    finally:
        conn.close()


def save_job_match(match: JobMatchResult):
    """Saves a job match and updates candidate's latest_match_score."""
    conn = get_db_connection()
    try:
        with conn:
            conn.execute("""
                INSERT INTO job_matches (candidate_id, job_title, overall_score, match_json, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, (
                match.candidate_id or "unknown",
                match.job_title,
                match.overall_score,
                json.dumps(match.model_dump()),
                match.created_at
            ))
            if match.candidate_id:
                # Update candidate latest_match_score
                row = conn.execute("SELECT parsed_json FROM candidates WHERE candidate_id = ?", (match.candidate_id,)).fetchone()
                if row:
                    cand_data = json.loads(row["parsed_json"])
                    cand_data["latest_match_score"] = match.overall_score
                    conn.execute("""
                        UPDATE candidates
                        SET latest_match_score = ?, parsed_json = ?
                        WHERE candidate_id = ?
                    """, (match.overall_score, json.dumps(cand_data), match.candidate_id))
    finally:
        conn.close()


def list_candidates(
    search: Optional[str] = None,
    skill: Optional[str] = None,
    sort_by: str = "newest",
    limit: int = 50,
    offset: int = 0
) -> Tuple[int, List[CandidateListItem]]:
    """Lists candidates with search, filtering, and sorting."""
    conn = get_db_connection()
    try:
        query = "SELECT candidate_id, filename, name, email, phone, parse_status, parsed_json, latest_match_score, created_at FROM candidates"
        conditions = []
        params: List[Any] = []

        if search:
            search_like = f"%{search.strip().lower()}%"
            conditions.append("(LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(filename) LIKE ? OR LOWER(parsed_json) LIKE ?)")
            params.extend([search_like, search_like, search_like, search_like])

        if skill:
            skill_like = f"%\"{skill.strip()}\"%"
            conditions.append("LOWER(parsed_json) LIKE LOWER(?)")
            params.append(skill_like)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        # Count total matching rows
        count_query = query.replace("SELECT candidate_id, filename, name, email, phone, parse_status, parsed_json, latest_match_score, created_at", "SELECT COUNT(*)")
        total = conn.execute(count_query, params).fetchone()[0]

        # Sorting
        if sort_by == "highest_score":
            query += " ORDER BY latest_match_score DESC NULLS LAST"
        elif sort_by == "name":
            query += " ORDER BY name ASC"
        else:  # default "newest"
            query += " ORDER BY created_at DESC"

        query += " LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        rows = conn.execute(query, params).fetchall()
        items: List[CandidateListItem] = []

        for r in rows:
            parsed = json.loads(r["parsed_json"])
            tech_skills = parsed.get("technical_skills", [])

            # Summaries
            edu_summary = None
            if parsed.get("education"):
                first_edu = parsed["education"][0]
                deg = first_edu.get("degree") or "Degree"
                inst = first_edu.get("institution")
                edu_summary = f"{deg} - {inst}" if inst else deg

            exp_summary = None
            if parsed.get("experience"):
                first_exp = parsed["experience"][0]
                title = first_exp.get("title") or "Role"
                comp = first_exp.get("company")
                exp_summary = f"{title} at {comp}" if comp else title

            items.append(CandidateListItem(
                candidate_id=r["candidate_id"],
                filename=r["filename"],
                name=r["name"],
                email=r["email"],
                phone=r["phone"],
                technical_skills=tech_skills[:8],  # limit skills in summary table
                education_summary=edu_summary,
                experience_summary=exp_summary,
                latest_match_score=r["latest_match_score"],
                parse_status=r["parse_status"],
                created_at=r["created_at"]
            ))

        return total, items
    finally:
        conn.close()


def get_analytics() -> AnalyticsResponse:
    """Calculates live analytics metrics from actual processed data."""
    conn = get_db_connection()
    try:
        rows = conn.execute("SELECT candidate_id, filename, name, email, phone, parse_status, parsed_json, latest_match_score, created_at FROM candidates ORDER BY created_at DESC").fetchall()
        total_resumes = len(rows)

        if total_resumes == 0:
            return AnalyticsResponse(
                total_resumes=0,
                parsed_successfully=0,
                average_match_score=0.0,
                top_skills=[],
                match_score_distribution=[
                    ScoreBin(range="0-20%", count=0),
                    ScoreBin(range="21-40%", count=0),
                    ScoreBin(range="41-60%", count=0),
                    ScoreBin(range="61-80%", count=0),
                    ScoreBin(range="81-100%", count=0),
                ],
                education_levels=[],
                recent_candidates=[]
            )

        parsed_successful = sum(1 for r in rows if r["parse_status"] == "success")

        # Scores
        scores = [r["latest_match_score"] for r in rows if r["latest_match_score"] is not None]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

        # Skill frequency
        skill_counts: Dict[str, int] = {}
        edu_counts: Dict[str, int] = {}

        for r in rows:
            parsed = json.loads(r["parsed_json"])
            for skill in parsed.get("technical_skills", []):
                skill_counts[skill] = skill_counts.get(skill, 0) + 1

            for edu in parsed.get("education", []):
                deg = edu.get("degree") or "Other"
                edu_counts[deg] = edu_counts.get(deg, 0) + 1

        # Top skills
        sorted_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        top_skills = [
            SkillDistribution(
                skill=s,
                count=c,
                percentage=round((c / total_resumes) * 100.0, 1)
            )
            for s, c in sorted_skills
        ]

        # Score distribution
        score_bins = {
            "0-20%": 0,
            "21-40%": 0,
            "41-60%": 0,
            "61-80%": 0,
            "81-100%": 0
        }
        for s in scores:
            if s <= 20:
                score_bins["0-20%"] += 1
            elif s <= 40:
                score_bins["21-40%"] += 1
            elif s <= 60:
                score_bins["41-60%"] += 1
            elif s <= 80:
                score_bins["61-80%"] += 1
            else:
                score_bins["81-100%"] += 1

        match_score_dist = [ScoreBin(range=k, count=v) for k, v in score_bins.items()]

        education_levels = [{"level": k, "count": v} for k, v in sorted(edu_counts.items(), key=lambda x: x[1], reverse=True)[:6]]

        # Recent candidates (top 5)
        recent_candidates: List[CandidateListItem] = []
        for r in rows[:5]:
            parsed = json.loads(r["parsed_json"])
            recent_candidates.append(CandidateListItem(
                candidate_id=r["candidate_id"],
                filename=r["filename"],
                name=r["name"],
                email=r["email"],
                phone=r["phone"],
                technical_skills=parsed.get("technical_skills", [])[:6],
                education_summary=parsed.get("education", [{}])[0].get("degree") if parsed.get("education") else None,
                experience_summary=parsed.get("experience", [{}])[0].get("title") if parsed.get("experience") else None,
                latest_match_score=r["latest_match_score"],
                parse_status=r["parse_status"],
                created_at=r["created_at"]
            ))

        return AnalyticsResponse(
            total_resumes=total_resumes,
            parsed_successfully=parsed_successful,
            average_match_score=avg_score,
            top_skills=top_skills,
            match_score_distribution=match_score_dist,
            education_levels=education_levels,
            recent_candidates=recent_candidates
        )
    finally:
        conn.close()


def export_candidates_csv() -> str:
    """Generates CSV representation of stored candidates."""
    conn = get_db_connection()
    try:
        rows = conn.execute("SELECT * FROM candidates ORDER BY created_at DESC").fetchall()
        output = io.StringIO()
        writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

        writer.writerow([
            "Candidate ID", "Filename", "Name", "Email", "Phone",
            "Technical Skills", "Soft Skills", "Education", "Experience Summary",
            "Latest Match Score", "Parse Status", "Created At"
        ])

        for r in rows:
            parsed = json.loads(r["parsed_json"])
            tech_skills = "; ".join(parsed.get("technical_skills", []))
            soft_skills = "; ".join(parsed.get("soft_skills", []))

            edu_items = []
            for e in parsed.get("education", []):
                deg = e.get("degree") or ""
                inst = e.get("institution") or ""
                edu_items.append(f"{deg} ({inst})" if inst else deg)
            edu_str = "; ".join([x for x in edu_items if x])

            exp_items = []
            for ex in parsed.get("experience", []):
                t = ex.get("title") or ""
                c = ex.get("company") or ""
                exp_items.append(f"{t} at {c}" if c else t)
            exp_str = "; ".join([x for x in exp_items if x])

            writer.writerow([
                r["candidate_id"],
                r["filename"],
                r["name"] or "",
                r["email"] or "",
                r["phone"] or "",
                tech_skills,
                soft_skills,
                edu_str,
                exp_str,
                f"{r['latest_match_score']:.1f}%" if r["latest_match_score"] is not None else "N/A",
                r["parse_status"],
                r["created_at"]
            ])

        return output.getvalue()
    finally:
        conn.close()


def export_candidates_json() -> List[Dict[str, Any]]:
    """Exports full structured candidate data as JSON."""
    conn = get_db_connection()
    try:
        rows = conn.execute("SELECT parsed_json, latest_match_score FROM candidates ORDER BY created_at DESC").fetchall()
        results = []
        for r in rows:
            item = json.loads(r["parsed_json"])
            item["latest_match_score"] = r["latest_match_score"]
            results.append(item)
        return results
    finally:
        conn.close()
