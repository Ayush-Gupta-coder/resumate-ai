# Resumate AI — Intelligent Resume Parser & Job Matching Assistant

[![Python 3.13+](https://img.shields.io/badge/Python-3.13+-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

> **"Turn Resumes into Actionable Insights."**  
> An explainable, AI-powered resume parser and job-matching assistant built for human talent teams, featuring zero-hallucination NLP, multi-format extraction (PDF & DOCX), deterministic scoring, and real-time recruiter analytics.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Capabilities](#key-capabilities)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [NLP & Matching Methodology](#nlp--matching-methodology)
   - [Document Ingestion & Section Segmentation](#document-ingestion--section-segmentation)
   - [Named Entity Recognition & Regex Parsers](#named-entity-recognition--regex-parsers)
   - [Curated Skill Taxonomy](#curated-skill-taxonomy)
   - [Explainable Scoring Algorithm & Formulas](#explainable-scoring-algorithm--formulas)
6. [API Specification](#api-specification)
7. [Local Installation & Setup](#local-installation--setup)
8. [Running the Application](#running-the-application)
9. [Testing & Verification](#testing--verification)
10. [Internship Demonstration Workflow](#internship-demonstration-workflow)
11. [Privacy, Security & Ethical AI Notice](#privacy-security--ethical-ai-notice)

---

## Project Overview

**Resumate AI** was created as an Artificial Intelligence internship project to solve a critical bottleneck in human resources: manual resume screening. Traditional keyword parsers are brittle and proprietary ATS systems often introduce opaque bias.

Resumate AI provides:
- **100% Local & Cost-Free**: Runs entirely on your local machine using PyMuPDF, python-docx, and spaCy. No paid API keys or cloud LLM subscriptions required.
- **Explainable Heuristics**: Every match score between 0 and 100% is computed using an open, configurable mathematical formula with auditable resume evidence.
- **Privacy & Ethical AI**: Demographic attributes (gender, age, race, religion, disability) are never evaluated or inferred. The software empowers human recruiters rather than delegating automated hiring choices.

---

## Key Capabilities

- **Multi-Format Ingestion**: Drag-and-drop support for PDF (`.pdf`) and Microsoft Word (`.docx`) with magic byte validation and size guards (10MB limit).
- **Structured Entity Extraction**: Parses candidate names, verified emails, international phone numbers, portfolio links, academic degrees, GPAs, and work history.
- **Granular Skill Classification**: Identifies 500+ technical and soft skills, handles aliases (e.g., `React.js` -> `React`, `k8s` -> `Kubernetes`), and enforces strict boundary matching.
- **Explainable Job Matcher**: Recruiter pastes any job description; the algorithm computes weighted skill coverage, experience alignment, and qualification fit.
- **Actionable Learning Suggestions**: Recommends targeted study tracks and resources for candidate skill gaps.
- **Real-Time Recruiter Dashboard**: Live Recharts visualizations depicting skill distributions and score histograms derived directly from SQLite persistence.
- **Candidate Explorer & Exports**: Instant search, skill filtering, one-click CSV export, and structured JSON downloads.

---

## System Architecture

```
resumate-ai/
├── backend/
│   ├── app/
│   │   ├── api/                 # FastAPI routes (resumes, candidates, match, analytics)
│   │   │   ├── routes_resumes.py
│   │   │   ├── routes_candidates.py
│   │   │   ├── routes_match.py
│   │   │   └── routes_analytics.py
│   │   ├── models/              # Pydantic v2 schemas and request models
│   │   │   └── schemas.py
│   │   ├── services/            # Core AI, NLP, and persistence logic
│   │   │   ├── document_extractor.py
│   │   │   ├── nlp_parser.py
│   │   │   ├── skill_extractor.py
│   │   │   ├── job_matcher.py
│   │   │   └── storage.py
│   │   ├── utils/               # Synthetic resume generators
│   │   │   └── sample_resumes.py
│   │   ├── data/                # SQLite persistent database (candidates.db)
│   │   └── main.py              # Application entrypoint with CORS & middleware
│   ├── tests/                   # Pytest test suite & QA verification
│   │   ├── test_document_extractor.py
│   │   ├── test_nlp_parser.py
│   │   ├── test_job_matcher.py
│   │   ├── test_api.py
│   │   └── qa_verification.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable Navbar, Modal, Toast, ScoreGauge, SkillBadge
│   │   ├── pages/               # Landing, Dashboard, Upload, Analysis, Matching, Explorer, Settings
│   │   ├── services/            # Typed API client
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── sample_data/                 # Synthetic resumes and sample job descriptions
│   ├── resumes/
│   └── job_descriptions/
├── .env.example
├── .gitignore
└── README.md
```

---

## Technology Stack

### Backend
- **Python 3.13 / 3.14**: Modern async runtime.
- **FastAPI**: High-performance RESTful API framework with automatic OpenAPI documentation.
- **PyMuPDF (`fitz`)**: Lightning-fast C-level text and layout extraction from PDF files.
- **python-docx**: Structured extraction of paragraphs and table data from DOCX resumes.
- **spaCy (`en_core_web_sm`)**: Named entity recognition for person identification and sentence tokenization.
- **Pydantic v2**: Strict input validation and serialization.
- **SQLite3**: ACID-compliant transactional persistence without heavyweight database overhead.

### Frontend
- **React 19 & TypeScript**: Component-driven UI with full static typing.
- **Vite 6**: Sub-second Hot Module Replacement (HMR) and optimized rollup production bundling.
- **Tailwind CSS**: Modern productivity color scheme (soft emerald, mint, clean whites, and slate neutrals).
- **Lucide React**: Clean feather icon system.
- **Recharts**: Declarative SVG charting for skill frequencies and score distribution histograms.

---

## NLP & Matching Methodology

### Document Ingestion & Section Segmentation
1. **Magic Byte Validation**: Verifies that uploaded files genuinely match their declared MIME types (`%PDF-` header for PDF, `PK\x03\x04` zip stream for DOCX).
2. **Text Normalization**: Strips non-breaking whitespace (`\u00a0`), zero-width characters, and normalizes disparate bullet points (`•`, `*`, `▪`) into consistent list markers.
3. **Section Boundary Detection**: Employs compiled regular expressions to segment documents into standard sections: `Header`, `Professional Summary`, `Skills`, `Experience`, `Education`, `Projects`, and `Certifications`.

### Named Entity Recognition & Regex Parsers
- **Email & Phone**: RFC 5322 pattern matching for emails; international E.164 and localized formats (`+1`, `+91`, parens, hyphens) for telephone numbers.
- **Candidate Name**: Multi-tier pipeline utilizing spaCy `PERSON` entity tagging combined with header position heuristics and negative dictionary filtering (excluding words like "Resume", "Curriculum Vitae", "Engineer").
- **Education & Experience**: Extracts degrees (Ph.D., M.S., B.Tech, B.S.), universities, graduation years (`1990-2030`), GPAs, role titles, and duration ranges.

### Curated Skill Taxonomy
The skill extractor includes 500+ technical and soft skills organized across:
- **Programming Languages**: Python, TypeScript, JavaScript, Java, C++, Go, Rust, SQL, Bash...
- **AI / ML / Data Science**: PyTorch, TensorFlow, Scikit-Learn, Pandas, NumPy, Hugging Face, NLP, LLMs, RAG, Computer Vision...
- **Web & Backend**: React, Next.js, FastAPI, Node.js, Express, Django, PostgreSQL, MongoDB, Redis, GraphQL...
- **Cloud & DevOps**: Docker, Kubernetes, AWS, GCP, Azure, CI/CD, GitHub Actions, Linux...
- **Soft Skills**: Problem Solving, Team Leadership, Critical Thinking, Mentorship, Communication...

### Explainable Scoring Algorithm & Formulas

The match score is deterministic, reproducible, and explainable:

$$\text{Overall Score} = (W_{\text{skills}} \times S_{\text{skills}}) + (W_{\text{exp}} \times S_{\text{exp}}) + (W_{\text{edu}} \times S_{\text{edu}})$$

#### Default Weights (Configurable in Recruiter Settings):
- **$W_{\text{skills}} = 0.65$** (65%): Skill Coverage Score
- **$W_{\text{exp}} = 0.20$** (20%): Experience Alignment Score
- **$W_{\text{edu}} = 0.15$** (15%): Academic Degree Qualification Score

#### Component Score Definitions:
1. **Skill Coverage ($S_{\text{skills}}$)**:
   $$S_{\text{skills}} = \frac{|\text{Resume Skills} \cap \text{Job Required Skills}|}{|\text{Job Required Skills}|} \times 100$$
2. **Experience Alignment ($S_{\text{exp}}$)**: Evaluates role title similarity with job title, duration of recorded experience, and keyword corroboration in bullet points (scored 20 to 100).
3. **Education Qualification ($S_{\text{edu}}$)**: Evaluates academic milestones (Doctorate: 100, Master's: 90, Bachelor's: 80, Recognized Diploma: 70).

---

## API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns backend health status, NLP model info, and storage status |
| `POST` | `/api/resumes/parse` | Uploads single PDF/DOCX resume, parses entities, persists candidate |
| `POST` | `/api/resumes/batch-parse`| Batch uploads multiple resumes with aggregate success/error reporting |
| `POST` | `/api/match` | Runs explainable match between candidate and pasted job description |
| `GET` | `/api/candidates` | Paginated candidate explorer with search, skill filter, and sorting |
| `GET` | `/api/candidates/{id}` | Retrieves full candidate profile, credentials, and raw extracted text |
| `DELETE`| `/api/candidates/{id}` | Permanently deletes candidate record and match history |
| `DELETE`| `/api/candidates` | Clears all stored candidate records for privacy / data reset |
| `GET` | `/api/analytics` | Live analytics: total counts, average score, skill & score distributions |
| `GET` | `/api/export/csv` | Streams formatted CSV export of all candidate records |
| `GET` | `/api/export/json` | Streams structured JSON dump of all candidate records |

Interactive Swagger documentation is available at `http://127.0.0.1:8000/docs`.

---

## Local Installation & Setup

### Prerequisites
- Python 3.12 or 3.13 (Python 3.13 recommended)
- Node.js 18+ and npm

### 1. Clone Repository & Setup Backend
```bash
cd resumate-ai/backend

# Create Python virtual environment
python3.13 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install spaCy English language model
python -m spacy download en_core_web_sm

# Generate synthetic sample resumes for demonstration
python app/utils/sample_resumes.py
```

### 2. Setup Frontend
```bash
cd ../frontend

# Install node dependencies
npm install

# Test production build
npm run build
```

---

## Running the Application

### Option A: Run Both Servers

**Terminal 1 (Backend Server):**
```bash
cd resumate-ai/backend
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs at `http://127.0.0.1:8000` (API docs at `http://127.0.0.1:8000/docs`).*

**Terminal 2 (Frontend Dev Server):**
```bash
cd resumate-ai/frontend
npm run dev
```
*Frontend runs at `http://127.0.0.1:5173`.*

---

## Testing & Verification

Resumate AI includes a comprehensive two-tier test suite:

### 1. Pytest Unit Tests
Executes 13 automated unit tests verifying PDF/DOCX extractors, magic bytes, invalid files, NLP parsing, scoring mathematics, and candidate CRUD:
```bash
cd resumate-ai/backend
source venv/bin/activate
pytest tests -v
```

### 2. Live QA End-to-End Verification
Tests the live running backend, file ingestion, job matching, exports, and atomic deletion:
```bash
python tests/qa_verification.py
```

**Observed Test Results:**
```
==================================================
 RESUMATE AI - COMPREHENSIVE QA VERIFICATION SUITE
==================================================
 [PASS] Backend Health Check HTTP 200
 [PASS] Frontend Vite Server Response HTTP 200
 [PASS] PDF Parsing (Alex Rivera) Extracted: Name='Alex Rivera', Skills=36
 [PASS] DOCX Parsing (Priya Sharma) Extracted: Name='Priya Sharma', Skills=30
 [PASS] Corrupt File Rejection Error message: 'File 'corrupted_document.pdf' has a .pdf extension but lacks a valid PDF file signature.'
 [PASS] Explainable Job Matching (AI Engineer JD) Overall Score: 85.7%, Matched: 19 skills
 [PASS] Candidate Explorer Search Filter Returned items
 [PASS] Live Analytics Calculation Total: 3, Top skill: AWS
 [PASS] CSV and JSON Exports CSV bytes: 2104, JSON records: 3
 [PASS] Candidate Record Deletion DELETE returned 200, Verification GET returned 404
==================================================
 QA VERIFICATION SUMMARY: 10 / 10 CHECKS PASSED
==================================================
```

---

## Internship Demonstration Workflow

Follow these steps for your project video and evaluation presentation:

1. **Open the Application**: Navigate to `http://127.0.0.1:5173`. Point out the soft-green SaaS aesthetic and the green "API Live" status badge.
2. **Landing Page Tour**: Highlight the value proposition ("Turn Resumes into Actionable Insights"), the modular architecture, and the ethical AI disclaimer.
3. **Upload Resumes**:
   - Navigate to **Upload & Parse**.
   - Upload synthetic resumes from `sample_data/resumes/` (`alex_rivera_ai_engineer.pdf` and `priya_sharma_fullstack.docx`).
   - Also upload `corrupted_document.pdf` to demonstrate robust error handling and invalid file rejection.
   - Click **Parse Resumes**.
4. **Inspect Resume Analysis**:
   - Navigate to **Resume Analysis**.
   - Show extracted contact details, LinkedIn/GitHub links, parsed education, experience timeline, and technical skills badges.
   - Click the **Raw Extracted Text** tab to verify that no information was fabricated.
5. **Demonstrate Explainable Job Matching**:
   - Click **Match with Job Description** or navigate to **Job Matcher**.
   - Click the **AI Eng** preset button to load the Senior AI Engineer job description.
   - Click **Calculate Explainable Match**.
   - Show the circular score gauge (e.g. 85.7%), the breakdown of matching vs missing skills, the resume evidence quotes, and the actionable learning suggestions.
   - Open **Configure Scoring Weights** to demonstrate dynamic mathematical reweighting.
6. **Recruiter Dashboard**:
   - Navigate to **Dashboard**.
   - Point out that all KPI cards and charts (Top Skills bar chart, Score Distribution) are populated from real database candidates.
7. **Candidate Explorer & Export**:
   - Search for a candidate by name or filter by skill (e.g., `PyTorch`).
   - Click **Export CSV** and **Export JSON** to show real downloadable files.
   - Delete a test candidate to show real-time deletion.
8. **Settings & Privacy**:
   - Show local execution guarantees, supported file formats, and data wipe controls.

---

## Privacy, Security & Ethical AI Notice

- **No Public Exposure**: Uploaded resumes are processed in memory and never transmitted to external APIs or third-party servers.
- **Zero Demographic Inference**: Resumate AI strictly scores skills, experience, and education extracted from the text. It contains no algorithms to classify or score candidates by gender, race, age, religion, or disability.
- **Human-in-the-Loop**: Resumate AI provides explanatory heuristics to assist recruiters. It is explicitly not designed to make automated, unassisted hiring decisions.
