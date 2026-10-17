"""
NLP and regex-based resume parsing service for Resumate AI.
Extracts candidate personal info, contact info, education history,
work experience, projects, and certifications using spaCy and structured heuristics.
"""
import re
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
import spacy
from app.models.schemas import (
    ExtractedResume,
    CandidateEducation,
    CandidateExperience,
    CandidateProject,
    CandidateCertification,
)
from app.services.skill_extractor import extract_skills_from_text

# Load spaCy NLP pipeline with graceful fallback
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    try:
        nlp = spacy.blank("en")
    except Exception:
        nlp = None

# Regex patterns for contact information
EMAIL_REGEX = re.compile(
    r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
    re.IGNORECASE
)

# Phone regex handling international, country codes (+1, +91, etc.), dashes, dots, spaces, parens
PHONE_REGEX = re.compile(
    r"(?:\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}",
)

LINKEDIN_REGEX = re.compile(
    r"(?:https?://)?(?:www\.)?linkedin\.com/in/([a-zA-Z0-9_-]+)/?",
    re.IGNORECASE
)

GITHUB_REGEX = re.compile(
    r"(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9_-]+)/?",
    re.IGNORECASE
)

PORTFOLIO_REGEX = re.compile(
    r"(?:https?://)?(?:www\.)?([a-zA-Z0-9_-]+\.(?:dev|me|io|tech|app|com|org|net))/?",
    re.IGNORECASE
)

# Common words in headers that should never be identified as names
INVALID_NAME_WORDS = {
    "resume", "curriculum", "vitae", "cv", "page", "profile", "contact",
    "summary", "experience", "education", "skills", "projects", "certifications",
    "engineer", "developer", "designer", "manager", "intern", "analyst",
    "university", "college", "school", "institute", "address", "phone", "email"
}

# Degree keywords and patterns
DEGREE_PATTERNS = [
    (re.compile(r"\b(?:Ph\.?D|Doctor\s+of\s+Philosophy)\b", re.IGNORECASE), "Ph.D."),
    (re.compile(r"\b(?:M\.?Tech|Master\s+of\s+Technology)\b", re.IGNORECASE), "M.Tech"),
    (re.compile(r"\b(?:M\.?S\.?|Master\s+of\s+Science)\b", re.IGNORECASE), "M.S."),
    (re.compile(r"\b(?:M\.?B\.?A\.?|Master\s+of\s+Business\s+Administration)\b", re.IGNORECASE), "M.B.A."),
    (re.compile(r"\b(?:M\.?C\.?A\.?|Master\s+of\s+Computer\s+Applications)\b", re.IGNORECASE), "M.C.A."),
    (re.compile(r"\b(?:B\.?Tech|Bachelor\s+of\s+Technology)\b", re.IGNORECASE), "B.Tech"),
    (re.compile(r"\b(?:B\.?E\.?|Bachelor\s+of\s+Engineering)\b", re.IGNORECASE), "B.E."),
    (re.compile(r"\b(?:B\.?S\.?|Bachelor\s+of\s+Science)\b", re.IGNORECASE), "B.S."),
    (re.compile(r"\b(?:B\.?C\.?A\.?|Bachelor\s+of\s+Computer\s+Applications)\b", re.IGNORECASE), "B.C.A."),
    (re.compile(r"\b(?:B\.?A\.?|Bachelor\s+of\s+Arts)\b", re.IGNORECASE), "B.A."),
    (re.compile(r"\b(?:Bachelor|Master|Doctorate|Associate\s+Degree)\b", re.IGNORECASE), "Degree"),
    (re.compile(r"\b(?:Diploma|High\s+School)\b", re.IGNORECASE), "Diploma"),
]

# Field of study patterns
FIELDS_OF_STUDY = [
    "Computer Science", "Information Technology", "Artificial Intelligence",
    "Data Science", "Machine Learning", "Software Engineering",
    "Electrical Engineering", "Electronics and Communication",
    "Mechanical Engineering", "Civil Engineering", "Mathematics",
    "Physics", "Statistics", "Business Administration", "Economics"
]

# Date range regex
DATE_RANGE_REGEX = re.compile(
    r"\b((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{1,2}/\d{4}|\d{4})\s*(?:-|–|—|to)\s*(?:Present|Current|Now|\d{1,2}/\d{4}|\d{4}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{4}))\b",
    re.IGNORECASE
)

# Year pattern
YEAR_REGEX = re.compile(r"\b(19\d{2}|20\d{2})\b")

# GPA pattern
GPA_REGEX = re.compile(r"\b(?:GPA|CGPA|Grade)[\s:]*([0-9]\.[0-9]{1,2}(?:\s*/\s*(?:4|10)(?:\.0)?)?|[0-9]{1,2}(?:\.[0-9]+)?%)\b", re.IGNORECASE)


def extract_email(text: str) -> Optional[str]:
    """Finds the first valid email address."""
    matches = EMAIL_REGEX.findall(text)
    if matches:
        # Filter out common extensions that aren't valid domains
        for m in matches:
            if not m.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".pdf")):
                return m
    return None


def extract_phone(text: str) -> Optional[str]:
    """Finds the candidate phone number."""
    matches = PHONE_REGEX.findall(text)
    for m in matches:
        clean = re.sub(r"[^\d+]", "", m)
        # Valid phone numbers usually have 10-15 digits
        digits_only = re.sub(r"\D", "", clean)
        if 10 <= len(digits_only) <= 15:
            return m.strip()
    return None


def extract_links(text: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """Extracts LinkedIn, GitHub, and Portfolio URLs."""
    linkedin = None
    github = None
    portfolio = None

    li_match = LINKEDIN_REGEX.search(text)
    if li_match:
        linkedin = f"https://linkedin.com/in/{li_match.group(1)}"

    gh_match = GITHUB_REGEX.search(text)
    if gh_match:
        github = f"https://github.com/{gh_match.group(1)}"

    port_match = PORTFOLIO_REGEX.search(text)
    if port_match:
        matched_url = port_match.group(0)
        # Avoid identifying github or linkedin as custom portfolio
        if "github.com" not in matched_url and "linkedin.com" not in matched_url:
            portfolio = matched_url if matched_url.startswith("http") else f"https://{matched_url}"

    return linkedin, github, portfolio


def extract_candidate_name(text: str, sections: Dict[str, str]) -> Optional[str]:
    """
    Extracts candidate name using a hybrid approach:
    1. Check top lines of document / header section for 2-4 word capitalized names.
    2. spaCy PERSON entities from the header block.
    3. Filter out title words, resume labels, and contact items.
    """
    # Prefer header section or first 6 lines of text
    header_block = sections.get("header", "")
    if not header_block:
        lines = [line.strip() for line in text.split("\n") if line.strip()][:6]
        header_block = "\n".join(lines)

    lines = [l.strip() for l in header_block.split("\n") if l.strip()]

    # First check: Top lines with strict name rules
    for line in lines[:4]:
        # Strip extraneous punctuation
        clean = re.sub(r"[^\w\s\.-]", "", line).strip()
        words = clean.split()
        if 2 <= len(words) <= 4:
            # Check all words start with capital letter and not in invalid words
            lower_words = [w.lower() for w in words]
            if not any(w in INVALID_NAME_WORDS for w in lower_words):
                if all(w[0].isupper() for w in words if len(w) > 1):
                    # Check not an email or phone or URL
                    if not ("@" in clean or ".com" in clean or re.search(r"\d", clean)):
                        return clean

    # Second check: spaCy NER on the header block
    if nlp is not None:
        try:
            doc = nlp(header_block[:500])
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    clean_ent = ent.text.strip()
                    ent_words = [w.lower() for w in clean_ent.split()]
                    if 2 <= len(ent_words) <= 4 and not any(w in INVALID_NAME_WORDS for w in ent_words):
                        if not re.search(r"[\d@\.]", clean_ent):
                            return clean_ent
        except Exception:
            pass

    # If first line is a single name or single line capitalized:
    if lines:
        first_line = lines[0].strip()
        words = first_line.split()
        if 1 <= len(words) <= 3 and not any(w.lower() in INVALID_NAME_WORDS for w in words):
            if not re.search(r"[\d@\./:]", first_line):
                return first_line

    return None


def extract_education(text: str, sections: Dict[str, str]) -> List[CandidateEducation]:
    """
    Extracts education records (Degree, Field, Institution, Year, GPA).
    """
    edu_text = sections.get("education", "")
    if not edu_text:
        edu_text = text  # Fallback to search entire text

    records: List[CandidateEducation] = []
    edu_lines = [line.strip() for line in edu_text.split("\n") if line.strip()]

    current_entry: Optional[CandidateEducation] = None

    for line in edu_lines:
        detected_degree = None
        for pattern, degree_name in DEGREE_PATTERNS:
            if pattern.search(line):
                detected_degree = degree_name
                break

        # Check for institution keywords
        institution_match = re.search(
            r"([A-Z][A-Za-z0-9\s,&.-]+(?:University|College|Institute|Academy|School|Polytechnic)[A-Za-z0-9\s,&.-]*)",
            line,
            re.IGNORECASE
        )

        # Check for field of study
        detected_field = None
        for field in FIELDS_OF_STUDY:
            if re.search(rf"\b{re.escape(field)}\b", line, re.IGNORECASE):
                detected_field = field
                break

        # Check for year
        year_match = YEAR_REGEX.search(line)
        detected_year = year_match.group(1) if year_match else None

        # Check for GPA
        gpa_match = GPA_REGEX.search(line)
        detected_gpa = gpa_match.group(1) if gpa_match else None

        if detected_degree or institution_match:
            # If we already had an entry, save it
            if current_entry and (current_entry.degree or current_entry.institution):
                records.append(current_entry)

            current_entry = CandidateEducation(
                degree=detected_degree,
                field_of_study=detected_field,
                institution=institution_match.group(1).strip() if institution_match else None,
                year=detected_year,
                gpa=detected_gpa
            )
        elif current_entry:
            # Enrich existing record
            if not current_entry.field_of_study and detected_field:
                current_entry.field_of_study = detected_field
            if not current_entry.institution and institution_match:
                current_entry.institution = institution_match.group(1).strip()
            if not current_entry.year and detected_year:
                current_entry.year = detected_year
            if not current_entry.gpa and detected_gpa:
                current_entry.gpa = detected_gpa

    if current_entry and (current_entry.degree or current_entry.institution):
        records.append(current_entry)

    return records


def extract_experience(text: str, sections: Dict[str, str]) -> List[CandidateExperience]:
    """
    Extracts employment and internship experiences.
    """
    exp_text = sections.get("experience", "")
    if not exp_text:
        return []

    lines = [l.strip() for l in exp_text.split("\n") if l.strip()]
    experiences: List[CandidateExperience] = []
    current_exp: Optional[CandidateExperience] = None

    # Comprehensive job title patterns
    TITLE_REGEX = re.compile(
        r"\b(?:(?:Senior|Junior|Lead|Principal|Chief|Staff|Associate|Head\s+of|Director\s+of)?\s*)?"
        r"(?:(?:Software|Frontend|Backend|Full\s*Stack|Mobile|DevOps|Cloud|Data|Machine\s*Learning|AI|Security|Systems|Network|QA|Test|Product|Project|Operations|Business|Research|Marketing|Sales)\s+)?"
        r"(?:Engineer|Developer|Architect|Scientist|Analyst|Specialist|Manager|Consultant|Administrator|Coordinator|Lead|Intern(?:ship)?|Associate|Designer|Officer|Technician)\b",
        re.IGNORECASE
    )

    for line in lines:
        date_match = DATE_RANGE_REGEX.search(line)
        title_match = TITLE_REGEX.search(line)

        is_bullet = line.startswith(("-", "*", "•", "–")) or re.match(r"^\d+\.\s+", line)

        if (date_match or title_match) and not is_bullet:
            dates = date_match.group(1) if date_match else None
            title = title_match.group(0) if title_match else None

            # If current_exp exists and this line provides the missing date without introducing a new job title
            if current_exp and not current_exp.dates and dates and not title:
                current_exp.dates = dates
                continue

            if current_exp and (current_exp.title or current_exp.company or current_exp.bullet_points):
                experiences.append(current_exp)

            # Attempt to extract company: remove date and title from line
            company_candidate = line
            if dates:
                company_candidate = company_candidate.replace(dates, "")
            if title:
                company_candidate = company_candidate.replace(title, "")
            company = re.sub(r"[\s|,–—-]{2,}", " ", company_candidate).strip(" |,–—-")

            current_exp = CandidateExperience(
                title=title,
                company=company if company and len(company) > 1 else None,
                dates=dates,
                bullet_points=[]
            )
        elif current_exp:
            clean_line = re.sub(r"^[-*•–\d\.]+\s*", "", line).strip()
            if clean_line:
                current_exp.bullet_points.append(clean_line)

    if current_exp and (current_exp.title or current_exp.company or current_exp.bullet_points):
        experiences.append(current_exp)

    return experiences


def extract_projects(text: str, sections: Dict[str, str]) -> List[CandidateProject]:
    """
    Extracts technical projects and key academic initiatives.
    """
    proj_text = sections.get("projects", "")
    if not proj_text:
        return []

    lines = [l.strip() for l in proj_text.split("\n") if l.strip()]
    projects: List[CandidateProject] = []
    current_proj: Optional[CandidateProject] = None

    for line in lines:
        is_bullet = line.startswith(("-", "*", "•", "–")) or re.match(r"^\d+\.\s+", line)

        # A new project line is usually non-bullet, short, and starts with title or contains pipe/colon
        if not is_bullet and len(line) < 80 and not line.endswith("."):
            if current_proj and (current_proj.title or current_proj.description):
                projects.append(current_proj)

            # Check if title has tech stack separated by | or : or ()
            parts = re.split(r"[:|()]", line)
            title = parts[0].strip()
            techs = []
            if len(parts) > 1:
                tech_text = " ".join(parts[1:])
                extracted_t, _ = extract_skills_from_text(tech_text)
                techs = extracted_t

            current_proj = CandidateProject(
                title=title,
                description="",
                technologies=techs
            )
        elif current_proj:
            clean_line = re.sub(r"^[-*•–\d\.]+\s*", "", line).strip()
            if clean_line:
                if current_proj.description:
                    current_proj.description += " " + clean_line
                else:
                    current_proj.description = clean_line

                # Extract technologies mentioned in bullets
                techs, _ = extract_skills_from_text(clean_line)
                for t in techs:
                    if t not in current_proj.technologies:
                        current_proj.technologies.append(t)

    if current_proj and (current_proj.title or current_proj.description):
        projects.append(current_proj)

    return projects


def extract_certifications(text: str, sections: Dict[str, str]) -> List[CandidateCertification]:
    """
    Extracts recognized industry certifications.
    """
    cert_text = sections.get("certifications", "")
    search_text = cert_text if cert_text else text

    cert_names = [
        "AWS Certified Solutions Architect",
        "AWS Certified Developer",
        "AWS Certified Cloud Practitioner",
        "Google Cloud Certified Professional Cloud Architect",
        "Google Cloud Certified Associate Cloud Engineer",
        "Microsoft Certified: Azure Fundamentals",
        "Microsoft Certified: Azure Solutions Architect",
        "Certified Kubernetes Administrator (CKA)",
        "Certified Kubernetes Application Developer (CKAD)",
        "TensorFlow Developer Certificate",
        "Project Management Professional (PMP)",
        "Certified ScrumMaster (CSM)",
        "HashiCorp Certified: Terraform Associate",
        "Deep Learning Specialization",
        "Machine Learning Specialization",
        "Meta Front-End Developer Professional Certificate",
        "Meta Back-End Developer Professional Certificate",
    ]

    certs: List[CandidateCertification] = []
    found_names = set()

    for cert in cert_names:
        if re.search(rf"\b{re.escape(cert)}\b", search_text, re.IGNORECASE):
            found_names.add(cert)
            # Try to determine issuer
            issuer = None
            if "AWS" in cert:
                issuer = "Amazon Web Services"
            elif "Google" in cert:
                issuer = "Google Cloud"
            elif "Microsoft" in cert or "Azure" in cert:
                issuer = "Microsoft"
            elif "Kubernetes" in cert or "CKA" in cert:
                issuer = "Cloud Native Computing Foundation (CNCF)"
            elif "Specialization" in cert:
                issuer = "Coursera / DeepLearning.AI"

            certs.append(CandidateCertification(name=cert, issuer=issuer))

    # Also parse bullet lines from certifications section
    if cert_text:
        for line in cert_text.split("\n"):
            clean_line = re.sub(r"^[-*•–\d\.]+\s*", "", line).strip()
            if clean_line and len(clean_line) > 5 and len(clean_line) < 100:
                # If not already included
                if not any(clean_line.lower() in c.name.lower() or c.name.lower() in clean_line.lower() for c in certs):
                    year_match = YEAR_REGEX.search(clean_line)
                    certs.append(CandidateCertification(
                        name=clean_line,
                        year=year_match.group(1) if year_match else None
                    ))

    return certs


def parse_resume_to_candidate(
    filename: str,
    raw_text: str,
    metadata: Dict[str, Any],
    sections: Dict[str, str],
    candidate_id: Optional[str] = None
) -> ExtractedResume:
    """
    Executes the modular NLP parsing pipeline and returns a structured ExtractedResume model.
    """
    cid = candidate_id or f"cand_{uuid.uuid4().hex[:12]}"
    now_iso = datetime.now(timezone.utc).isoformat()

    # 1. Contact & Identity
    email = extract_email(raw_text)
    phone = extract_phone(raw_text)
    linkedin, github, portfolio = extract_links(raw_text)
    name = extract_candidate_name(raw_text, sections)

    # 2. Skills
    tech_skills, soft_skills = extract_skills_from_text(raw_text)

    # 3. Structured Sections
    education = extract_education(raw_text, sections)
    experience = extract_experience(raw_text, sections)
    projects = extract_projects(raw_text, sections)
    certifications = extract_certifications(raw_text, sections)

    # 4. Summary / Profile
    summary = sections.get("summary")
    if not summary and "header" in sections:
        # Check if header contains a brief profile line
        header_lines = sections["header"].split("\n")
        if len(header_lines) > 2:
            summary = "\n".join(header_lines[2:]).strip()

    # Determine parse status
    if name and (tech_skills or education or experience):
        parse_status = "success"
    elif raw_text and (tech_skills or email or phone):
        parse_status = "partial"
    else:
        parse_status = "failed"

    return ExtractedResume(
        candidate_id=cid,
        filename=filename,
        raw_text=raw_text,
        name=name,
        email=email,
        phone=phone,
        linkedin=linkedin,
        github=github,
        portfolio=portfolio,
        summary=summary,
        technical_skills=tech_skills,
        soft_skills=soft_skills,
        education=education,
        experience=experience,
        projects=projects,
        certifications=certifications,
        parse_status=parse_status,
        created_at=now_iso,
        metadata=metadata,
        latest_match_score=None
    )
