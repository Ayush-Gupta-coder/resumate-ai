"""
Synthetic resume generator for Resumate AI testing and demonstration.
Generates genuine PDF and DOCX files without any external dependencies.
"""
import os
import pymupdf as fitz
import docx

SAMPLE_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "sample_data",
    "resumes"
)


def generate_alex_rivera_pdf(target_path: str):
    """Generates synthetic AI Engineer resume in PDF format."""
    doc = fitz.open()
    page = doc.new_page(width=612, height=792)  # Standard Letter size

    text = """Alex Rivera
San Francisco, CA | alex.rivera@email.com | +1 (555) 234-5678
https://linkedin.com/in/alex-rivera-ai | https://github.com/alexrivera-ai

PROFESSIONAL SUMMARY
Innovative Artificial Intelligence Engineer with 4+ years of experience developing machine learning models, natural language processing pipelines, and scalable microservices. Proven track record deploying PyTorch and transformer models to production cloud environments.

TECHNICAL SKILLS
- Programming Languages: Python, JavaScript, TypeScript, SQL, Bash
- AI / ML / NLP: PyTorch, TensorFlow, Scikit-Learn, Hugging Face, spaCy, Natural Language Processing, Large Language Models (LLMs), Computer Vision, Pandas, NumPy
- Web & Backend: FastAPI, Flask, RESTful APIs, Node.js, WebSockets
- Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD, GitHub Actions, Linux, PostgreSQL, Redis
- Methodologies: Agile, Git, Unit Testing, System Design

WORK EXPERIENCE
Senior AI Engineer | Apex Cognitive Systems | San Francisco, CA
Jan 2023 - Present
- Architected enterprise document processing system using PyTorch and FastAPI, reducing parsing latency by 45%.
- Fine-tuned transformer models for domain-specific Named Entity Recognition with 94.2% F1-score.
- Containerized microservices with Docker and deployed resilient clusters on AWS Kubernetes (EKS).
- Implemented automated CI/CD pipelines via GitHub Actions ensuring 100% test coverage with pytest.

Machine Learning Engineer | DataSphere Analytics | San Jose, CA
Jun 2020 - Dec 2022
- Developed predictive classification models using Scikit-Learn and Pandas on datasets exceeding 50 million rows.
- Built interactive REST APIs using FastAPI and PostgreSQL backend with Redis caching.
- Collaborated in cross-functional Agile sprint cycles to deliver quarterly AI roadmap deliverables.

EDUCATION
Bachelor of Technology in Computer Science & Engineering
University of California, Berkeley | 2016 - 2020 | GPA: 3.85 / 4.0

PROJECTS
- NeuralSearch Engine: Semantic vector search using Hugging Face transformers, FastAPI, and Docker.
- AutoParser AI: End-to-end resume information extraction pipeline using spaCy NLP and regex rules.

CERTIFICATIONS
- AWS Certified Solutions Architect
- Deep Learning Specialization
"""
    # Insert text into page
    rect = fitz.Rect(50, 50, 562, 742)
    page.insert_textbox(rect, text, fontsize=9.5, fontname="helv")
    doc.save(target_path)
    doc.close()


def generate_priya_sharma_docx(target_path: str):
    """Generates synthetic Full Stack Developer resume in DOCX format."""
    doc = docx.Document()

    # Title / Header
    header = doc.add_paragraph()
    r = header.add_run("Priya Sharma\n")
    r.bold = True
    header.add_run("Austin, TX | priya.sharma@techmail.io | +1 (555) 876-5432\n")
    header.add_run("https://linkedin.com/in/priyasharma-dev | https://github.com/priyasharma-code")

    # Summary
    doc.add_heading("Professional Summary", level=1)
    doc.add_paragraph(
        "Full-Stack Software Engineer with 3+ years of expertise designing modern React frontends, "
        "scalable Node.js backends, and high-performance cloud applications. Passionate about clean code, "
        "TypeScript, and delightful user experiences."
    )

    # Technical Skills
    doc.add_heading("Technical Skills", level=1)
    doc.add_paragraph(
        "Languages: TypeScript, JavaScript, Python, SQL, HTML5, CSS3\n"
        "Frontend: React, Next.js, Redux, Tailwind CSS, Bootstrap\n"
        "Backend: Node.js, Express.js, FastAPI, RESTful APIs, GraphQL\n"
        "Databases: PostgreSQL, MongoDB, Redis, SQLite\n"
        "DevOps & Tools: Docker, AWS, GitHub Actions, CI/CD, Git, Postman, Linux"
    )

    # Experience
    doc.add_heading("Work Experience", level=1)
    p1 = doc.add_paragraph()
    p1.add_run("Full Stack Developer | CloudScale Innovations | Austin, TX\n").bold = True
    p1.add_run("Aug 2022 - Present\n")
    doc.add_paragraph("- Built scalable React and TypeScript dashboard used by over 50,000 monthly active users.", style='List Bullet')
    doc.add_paragraph("- Engineered asynchronous REST APIs using Node.js and PostgreSQL with sub-100ms response times.", style='List Bullet')
    doc.add_paragraph("- Implemented Docker containerization and automated deployments via GitHub Actions on AWS.", style='List Bullet')

    p2 = doc.add_paragraph()
    p2.add_run("Frontend Developer Intern | NextWave Tech | Boston, MA\n").bold = True
    p2.add_run("Jun 2021 - May 2022\n")
    doc.add_paragraph("- Designed responsive web interfaces with React and Tailwind CSS.", style='List Bullet')
    doc.add_paragraph("- Conducted unit testing with Jest and improved cross-browser compatibility.", style='List Bullet')

    # Education
    doc.add_heading("Education", level=1)
    doc.add_paragraph(
        "Master of Science in Software Engineering\n"
        "University of Texas at Austin | 2020 - 2022 | GPA: 3.9 / 4.0\n\n"
        "Bachelor of Science in Information Technology\n"
        "Boston University | 2016 - 2020"
    )

    # Projects
    doc.add_heading("Key Projects", level=1)
    doc.add_paragraph(
        "CloudTask Manager: Real-time task collaboration application built with React, TypeScript, Node.js, and WebSockets.\n"
        "MetricsDash: Analytics dashboard visualizing cloud resource usage with Tailwind CSS and Recharts."
    )

    # Certifications
    doc.add_heading("Certifications", level=1)
    doc.add_paragraph("AWS Certified Developer - Associate\nMeta Front-End Developer Professional Certificate")

    doc.save(target_path)


def generate_marcus_chen_pdf(target_path: str):
    """Generates synthetic Data Scientist resume in PDF format."""
    doc = fitz.open()
    page = doc.new_page(width=612, height=792)

    text = """Marcus Chen
Seattle, WA | marcus.chen@datascience.org | +1 (555) 345-6789
https://linkedin.com/in/marcus-chen-ds | https://github.com/marcuschen-data

SUMMARY
Results-oriented Data Scientist with strong background in statistical modeling, machine learning, and predictive analytics. Skilled in translating complex data into actionable business strategies.

CORE COMPETENCIES
- Skills: Python, R, SQL, Machine Learning, Data Analysis, Data Visualization, Scikit-Learn, Pandas, NumPy, Tableau
- Databases & Cloud: MySQL, PostgreSQL, Snowflake, AWS, Git, Agile, Problem Solving

PROFESSIONAL EXPERIENCE
Data Scientist | Vantage Analytics Group | Seattle, WA
Jan 2022 - Present
- Built customer churn prediction models using Scikit-Learn and Random Forests, improving retention by 18%.
- Designed automated ETL pipelines in Python and SQL feeding directly into Tableau executive dashboards.
- Applied exploratory data analysis across multiple gigabytes of behavioral datasets in Snowflake.

Junior Data Analyst | Apex Insights | Seattle, WA
Jun 2020 - Dec 2021
- Performed statistical regression analyses and A/B testing evaluation for e-commerce products.
- Created automated MySQL reporting scripts and streamlined weekly metric updates.

EDUCATION
Bachelor of Science in Mathematics & Statistics
University of Washington | 2016 - 2020 | GPA: 3.75 / 4.0

PROJECTS
- ChurnPredictor: Machine learning pipeline predicting customer attrition with Scikit-Learn and Pandas.
- MarketBasket: Association rule mining system analyzing consumer purchase transactions.

CERTIFICATIONS
- TensorFlow Developer Certificate
"""
    rect = fitz.Rect(50, 50, 562, 742)
    page.insert_textbox(rect, text, fontsize=9.5, fontname="helv")
    doc.save(target_path)
    doc.close()


def generate_all_sample_resumes():
    """Generates all synthetic resumes into sample_data/resumes."""
    os.makedirs(SAMPLE_DIR, exist_ok=True)

    p1 = os.path.join(SAMPLE_DIR, "alex_rivera_ai_engineer.pdf")
    generate_alex_rivera_pdf(p1)

    p2 = os.path.join(SAMPLE_DIR, "priya_sharma_fullstack.docx")
    generate_priya_sharma_docx(p2)

    p3 = os.path.join(SAMPLE_DIR, "marcus_chen_data_scientist.pdf")
    generate_marcus_chen_pdf(p3)

    # Also generate a corrupt file for testing error states
    p4 = os.path.join(SAMPLE_DIR, "corrupted_document.pdf")
    with open(p4, "wb") as f:
        f.write(b"NOT_A_VALID_PDF_STREAM_12345")

    print(f"Generated sample resumes in: {SAMPLE_DIR}")


if __name__ == "__main__":
    generate_all_sample_resumes()
