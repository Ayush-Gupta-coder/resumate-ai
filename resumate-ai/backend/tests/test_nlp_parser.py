"""
Unit tests for NLP and Regex extraction pipeline.
"""
from app.services.nlp_parser import (
    extract_email,
    extract_phone,
    extract_links,
    extract_candidate_name,
    extract_education,
    extract_experience,
    parse_resume_to_candidate,
)
from app.services.skill_extractor import extract_skills_from_text


def test_contact_extraction():
    text = "Contact Jane Doe at jane.doe@example.com or +1 (555) 123-4567. Profile: https://linkedin.com/in/janedoe"
    assert extract_email(text) == "jane.doe@example.com"
    phone = extract_phone(text)
    assert phone is not None
    assert "123" in phone

    li, gh, port = extract_links(text)
    assert li == "https://linkedin.com/in/janedoe"


def test_skill_extraction():
    text = "We require Python, React, PostgreSQL, Docker, and experience with Natural Language Processing."
    tech, soft = extract_skills_from_text(text)
    assert "Python" in tech
    assert "React" in tech
    assert "PostgreSQL" in tech
    assert "Docker" in tech
    assert "Natural Language Processing" in tech


def test_full_resume_parse():
    sample_text = """Sarah Connor
Los Angeles, CA | sarah@cyberdyne.org | +1 555-890-1234
https://github.com/sarahconnor

PROFESSIONAL SUMMARY
Cybersecurity Specialist with experience in Python and Linux.

TECHNICAL SKILLS
Python, Linux, Docker, Bash, Git

WORK EXPERIENCE
Security Analyst | Cyberdyne Systems
Jan 2021 - Present
- Monitored intrusion detection networks.
- Wrote automation scripts in Python.

EDUCATION
Bachelor of Science in Computer Science
UCLA | 2017 - 2021 | GPA: 3.9 / 4.0
"""
    sections = {
        "header": "Sarah Connor\nLos Angeles, CA | sarah@cyberdyne.org | +1 555-890-1234\nhttps://github.com/sarahconnor",
        "summary": "Cybersecurity Specialist with experience in Python and Linux.",
        "skills": "Python, Linux, Docker, Bash, Git",
        "experience": "Security Analyst | Cyberdyne Systems\nJan 2021 - Present\n- Monitored intrusion detection networks.\n- Wrote automation scripts in Python.",
        "education": "Bachelor of Science in Computer Science\nUCLA | 2017 - 2021 | GPA: 3.9 / 4.0"
    }

    res = parse_resume_to_candidate("sarah_resume.pdf", sample_text, {"format": "pdf"}, sections)
    assert res.name == "Sarah Connor"
    assert res.email == "sarah@cyberdyne.org"
    assert "Python" in res.technical_skills
    assert "Docker" in res.technical_skills
    assert len(res.education) >= 1
    assert res.education[0].degree == "B.S."
    assert len(res.experience) >= 1
    assert res.experience[0].title == "Security Analyst"
    assert res.parse_status == "success"
