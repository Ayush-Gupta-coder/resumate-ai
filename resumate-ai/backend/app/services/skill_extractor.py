"""
Skill Taxonomy and Extraction Service for Resumate AI.
Contains curated technical and soft skills, alias mappings, boundary-safe matching,
and intelligent learning suggestions.
"""
import re
from typing import List, Tuple, Dict, Set, Optional

# Canonical skills and their common variants / aliases
# Format: canonical_name: [list of regex-escaped aliases or exact phrases]
TECHNICAL_SKILL_MAP: Dict[str, List[str]] = {
    # Programming Languages
    "Python": [r"python(?:\s*3)?", r"py\b"],
    "JavaScript": [r"javascript", r"js\b", r"ecmascript"],
    "TypeScript": [r"typescript", r"ts\b"],
    "Java": [r"java(?!\s*script)"],
    "C++": [r"c\+\+", r"cpp\b"],
    "C#": [r"c#", r"c\s*sharp"],
    "C": [r"\bc\b(?!\+\+|#)"],  # Strict boundary
    "Go": [r"\bgolang\b", r"\bgo\s+language\b"],
    "Rust": [r"\brust(?:\s+lang)?\b"],
    "Ruby": [r"\bruby\b"],
    "PHP": [r"\bphp\b"],
    "Swift": [r"\bswift\b"],
    "Kotlin": [r"\bkotlin\b"],
    "R": [r"\br\s+programming\b", r"\br\s+language\b", r"\br-lang\b"],
    "Scala": [r"\bscala\b"],
    "Dart": [r"\bdart\b"],
    "SQL": [r"\bsql\b", r"structured\s+query\s+language"],
    "HTML5": [r"html5?", r"xhtml"],
    "CSS3": [r"css3?", r"sass", r"scss", r"less"],
    "Bash": [r"bash\b", r"shell\s*script(?:ing)?", r"zsh\b"],

    # AI, ML & Data Science
    "Machine Learning": [r"machine\s+learning", r"\bml\b"],
    "Deep Learning": [r"deep\s+learning", r"\bdl\b"],
    "Natural Language Processing": [r"natural\s+language\s+processing", r"\bnlp\b"],
    "Computer Vision": [r"computer\s+vision", r"\bcv\b"],
    "PyTorch": [r"pytorch"],
    "TensorFlow": [r"tensorflow", r"\btf\b"],
    "Keras": [r"keras"],
    "Scikit-Learn": [r"scikit[\s_-]*learn", r"sklearn"],
    "Pandas": [r"pandas"],
    "NumPy": [r"numpy"],
    "SciPy": [r"scipy"],
    "OpenCV": [r"opencv"],
    "Hugging Face": [r"hugging\s*face", r"transformers\s+library"],
    "Large Language Models (LLMs)": [r"large\s+language\s+models?", r"\bllms?\b", r"gpt-?[34o]?", r"claude\b", r"gemini\b"],
    "Retrieval-Augmented Generation (RAG)": [r"retrieval[\s-]augmented\s+generation", r"\brag\b"],
    "LangChain": [r"langchain"],
    "LlamaIndex": [r"llamaindex"],
    "spaCy": [r"spacy"],
    "NLTK": [r"nltk"],
    "Data Analysis": [r"data\s+analysis", r"exploratory\s+data\s+analysis", r"\beda\b"],
    "Data Visualization": [r"data\s+visualization", r"matplotlib", r"seaborn", r"tableau", r"power\s*bi"],
    "Feature Engineering": [r"feature\s+engineering", r"feature\s+selection"],

    # Web & Application Frameworks
    "React": [r"react(?:\.js|js)?\b"],
    "Next.js": [r"next(?:\.js|js)?\b"],
    "Vue.js": [r"vue(?:\.js|js)?\b"],
    "Angular": [r"angular(?:\.js|js)?\b"],
    "Svelte": [r"svelte"],
    "Node.js": [r"node(?:\.js|js)?\b"],
    "Express.js": [r"express(?:\.js|js)?\b"],
    "FastAPI": [r"fastapi"],
    "Flask": [r"flask"],
    "Django": [r"django"],
    "Spring Boot": [r"spring\s*boot", r"spring\s+framework"],
    "ASP.NET": [r"asp\.net(?:\s*core)?"],
    "Ruby on Rails": [r"ruby\s+on\s+rails", r"rails\b"],
    "Tailwind CSS": [r"tailwind(?:\s*css)?"],
    "Bootstrap": [r"bootstrap"],
    "Redux": [r"redux(?:\s*toolkit)?"],
    "GraphQL": [r"graphql"],
    "RESTful APIs": [r"rest(?:ful)?\s*apis?", r"rest\s*services?"],
    "WebSockets": [r"websockets?"],

    # Databases & Storage
    "PostgreSQL": [r"postgres(?:ql)?\b"],
    "MySQL": [r"mysql\b"],
    "SQLite": [r"sqlite\b"],
    "MongoDB": [r"mongodb\b", r"mongo\b"],
    "Redis": [r"redis\b"],
    "Elasticsearch": [r"elasticsearch\b"],
    "Firebase": [r"firebase\b"],
    "Supabase": [r"supabase\b"],
    "DynamoDB": [r"dynamodb\b"],
    "Cassandra": [r"cassandra\b"],
    "Snowflake": [r"snowflake\b"],
    "Neo4j": [r"neo4j\b"],

    # Cloud, DevOps & Infrastructure
    "AWS": [r"amazon\s+web\s+services", r"\baws\b", r"ec2\b", r"s3\b", r"lambda\b"],
    "Google Cloud Platform": [r"google\s+cloud(?:\s+platform)?", r"\bgcp\b"],
    "Microsoft Azure": [r"(?:microsoft\s+)?azure\b"],
    "Docker": [r"docker\b", r"containerization"],
    "Kubernetes": [r"kubernetes\b", r"\bk8s\b"],
    "CI/CD": [r"ci[\s/]*cd", r"continuous\s+integration", r"continuous\s+deployment"],
    "GitHub Actions": [r"github\s+actions"],
    "Jenkins": [r"jenkins\b"],
    "Terraform": [r"terraform\b"],
    "Ansible": [r"ansible\b"],
    "Linux": [r"linux\b", r"ubuntu\b", r"debian\b", r"centos\b", r"redhat\b"],
    "Nginx": [r"nginx\b"],
    "Microservices": [r"microservices?", r"microservice\s+architecture"],

    # Tools, Testing & Methodologies
    "Git": [r"\bgit\b(?!\s*hub|\s*lab)"],
    "GitHub": [r"github\b"],
    "GitLab": [r"gitlab\b"],
    "Jira": [r"jira\b"],
    "Agile": [r"agile\b", r"scrum\b"],
    "Postman": [r"postman\b"],
    "Unit Testing": [r"unit\s+test(?:ing)?", r"pytest\b", r"jest\b", r"mocha\b", r"junit\b"],
    "System Design": [r"system\s+design", r"software\s+architecture"],
}

# Soft skills taxonomy
SOFT_SKILL_MAP: Dict[str, List[str]] = {
    "Problem Solving": [r"problem[\s-]solving", r"troubleshooting", r"analytical\s+thinking"],
    "Team Leadership": [r"team\s+leadership", r"leadership\b", r"team\s+management", r"tech\s+lead"],
    "Communication": [r"communication(?:\s+skills)?", r"interpersonal\s+skills?", r"presentation\s+skills?"],
    "Collaboration": [r"collaboration", r"teamwork", r"cross[\s-]functional\s+collaboration"],
    "Critical Thinking": [r"critical\s+thinking"],
    "Project Management": [r"project\s+management", r"pmp\b", r"delivery\s+management"],
    "Adaptability": [r"adaptability", r"fast\s+learner", r"quick\s+learner", r"flexibility"],
    "Time Management": [r"time\s+management", r"multitasking", r"prioritization"],
    "Mentorship": [r"mentorship", r"mentoring", r"coaching"],
    "Attention to Detail": [r"attention\s+to\s+detail", r"detail[\s-]oriented"],
}

# Pre-compile regex for performance
COMPILED_TECH_RULES = [
    (canonical, [re.compile(rf"(?<![a-zA-Z0-9_-]){alias}(?![a-zA-Z0-9_-])", re.IGNORECASE) for alias in aliases])
    for canonical, aliases in TECHNICAL_SKILL_MAP.items()
]

COMPILED_SOFT_RULES = [
    (canonical, [re.compile(rf"(?<![a-zA-Z0-9_-]){alias}(?![a-zA-Z0-9_-])", re.IGNORECASE) for alias in aliases])
    for canonical, aliases in SOFT_SKILL_MAP.items()
]

# Educational suggestions for missing skills
SKILL_SUGGESTIONS_DB: Dict[str, Dict[str, str]] = {
    "Docker": {
        "category": "DevOps & Containers",
        "description": "Learn containerization fundamentals: write Dockerfiles, manage multi-container apps with Docker Compose, and build lightweight production images.",
        "recommended_resource": "Docker Official Getting Started Guide & hands-on container labs.",
    },
    "Kubernetes": {
        "category": "Cloud Infrastructure",
        "description": "Study container orchestration: pods, deployments, services, ingress controllers, and config maps.",
        "recommended_resource": "Kubernetes.io Tutorials & Minikube local practice.",
    },
    "AWS": {
        "category": "Cloud Computing",
        "description": "Gain core cloud competencies: EC2 compute, S3 storage, IAM security roles, RDS databases, and serverless Lambda functions.",
        "recommended_resource": "AWS Cloud Practitioner / Solutions Architect free tier documentation.",
    },
    "FastAPI": {
        "category": "Backend Development",
        "description": "Practice building async RESTful APIs, OpenAPI docs, dependency injection, and Pydantic validation in Python.",
        "recommended_resource": "FastAPI Official Documentation & Tutorial series.",
    },
    "PyTorch": {
        "category": "Deep Learning",
        "description": "Master tensor operations, autograd, building custom nn.Modules, optimizers, and neural network training loops.",
        "recommended_resource": "Deep Learning with PyTorch: A 60 Minute Blitz.",
    },
    "Natural Language Processing": {
        "category": "AI / NLP",
        "description": "Explore tokenization, embeddings, text classification, named entity recognition, and modern transformer architectures.",
        "recommended_resource": "Hugging Face NLP Course & spaCy 101.",
    },
    "Large Language Models (LLMs)": {
        "category": "Generative AI",
        "description": "Learn prompt engineering, retrieval-augmented generation (RAG), fine-tuning, and LLM orchestration frameworks.",
        "recommended_resource": "LangChain / LlamaIndex documentation and tutorials.",
    },
    "CI/CD": {
        "category": "DevOps",
        "description": "Automate testing and deployment pipelines using GitHub Actions workflows, linting, and automated builds.",
        "recommended_resource": "GitHub Actions Documentation and workflow templates.",
    },
    "TypeScript": {
        "category": "Frontend / Full-stack",
        "description": "Adopt static typing, interfaces, generics, utility types, and strict mode to improve code reliability.",
        "recommended_resource": "TypeScript Handbook (typescriptlang.org).",
    },
    "PostgreSQL": {
        "category": "Databases",
        "description": "Deepen relational database skills: indexing, transactions, ACID guarantees, query plans (EXPLAIN ANALYZE), and schema design.",
        "recommended_resource": "PostgreSQL Official Documentation & SQL tutorial.",
    },
    "Redis": {
        "category": "Caching & Queues",
        "description": "Implement in-memory caching, pub/sub messaging, rate limiting, and session stores.",
        "recommended_resource": "Redis University free courses.",
    },
    "GraphQL": {
        "category": "API Architecture",
        "description": "Learn schema design, queries, mutations, resolvers, and avoiding the N+1 problem.",
        "recommended_resource": "How to GraphQL tutorials.",
    },
    "React": {
        "category": "Frontend Development",
        "description": "Master component life-cycle, hooks (useState, useEffect, useMemo), state management, and modern component composition.",
        "recommended_resource": "React.dev official interactive documentation.",
    },
    "Next.js": {
        "category": "Full-stack Frameworks",
        "description": "Learn Server Components, App Router, SSR, SSG, and API route handlers.",
        "recommended_resource": "Next.js Learn Course.",
    },
    "Microservices": {
        "category": "System Architecture",
        "description": "Study distributed systems patterns: service discovery, API gateways, circuit breakers, event-driven messaging, and data consistency.",
        "recommended_resource": "Martin Fowler's Microservices Guide.",
    },
}


def extract_skills_from_text(text: str) -> Tuple[List[str], List[str]]:
    """
    Scans text for technical and soft skills using the curated taxonomy.
    Returns: (list_of_technical_skills, list_of_soft_skills)
    Deduplicates and maintains deterministic alphabetical order.
    """
    if not text:
        return [], []

    detected_tech: Set[str] = set()
    detected_soft: Set[str] = set()

    for canonical, patterns in COMPILED_TECH_RULES:
        for pat in patterns:
            if pat.search(text):
                detected_tech.add(canonical)
                break

    for canonical, patterns in COMPILED_SOFT_RULES:
        for pat in patterns:
            if pat.search(text):
                detected_soft.add(canonical)
                break

    return sorted(list(detected_tech)), sorted(list(detected_soft))


def get_learning_recommendation(skill_name: str) -> Dict[str, str]:
    """
    Provides an actionable learning recommendation for a missing skill.
    """
    if skill_name in SKILL_SUGGESTIONS_DB:
        data = SKILL_SUGGESTIONS_DB[skill_name]
        return {
            "skill": skill_name,
            "category": data["category"],
            "description": data["description"],
            "recommended_resource": data["recommended_resource"],
        }
    return {
        "skill": skill_name,
        "category": "Professional Development",
        "description": f"Deepen understanding of {skill_name} principles, industry best practices, and build a portfolio project demonstrating practical usage.",
        "recommended_resource": f"Official documentation and guided tutorials for {skill_name}.",
    }
