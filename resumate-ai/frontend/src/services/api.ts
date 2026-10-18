/**
 * Resumate AI - Resilient API Client with Seamless Online Demo Fallback
 * Works both with live FastAPI backend and standalone on cloud hosts like Vercel.
 */
import {
  ParseResponse,
  BatchParseResponse,
  ExtractedResume,
  JobMatchResult,
  WeightConfiguration,
  CandidateListResponse,
  AnalyticsResponse,
  CandidateListItem,
  SkillDistribution,
  ScoreBin,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api';

// Realistic pre-parsed demo candidates for Vercel / standalone cloud preview
const INITIAL_DEMO_CANDIDATES: ExtractedResume[] = [
  {
    candidate_id: 'cand_alex_rivera',
    filename: 'alex_rivera_ai_engineer.pdf',
    raw_text: `Alex Rivera\nSan Francisco, CA | alex.rivera@email.com | +1 (555) 234-5678\nhttps://linkedin.com/in/alex-rivera-ai | https://github.com/alexrivera-ai\n\nPROFESSIONAL SUMMARY\nInnovative Artificial Intelligence Engineer with 4+ years of experience developing machine learning models, natural language processing pipelines, and scalable microservices. Proven track record deploying PyTorch and transformer models to production cloud environments.\n\nTECHNICAL SKILLS\nPython, JavaScript, TypeScript, SQL, Bash, PyTorch, TensorFlow, Scikit-Learn, Hugging Face, spaCy, Natural Language Processing, Large Language Models (LLMs), Computer Vision, Pandas, NumPy, FastAPI, Flask, RESTful APIs, Node.js, WebSockets, AWS, Docker, Kubernetes, CI/CD, GitHub Actions, Linux, PostgreSQL, Redis, Agile, Git, Unit Testing, System Design.\n\nWORK EXPERIENCE\nSenior AI Engineer | Apex Cognitive Systems | San Francisco, CA\nJan 2023 - Present\n- Architected enterprise document processing system using PyTorch and FastAPI, reducing parsing latency by 45%.\n- Fine-tuned transformer models for domain-specific Named Entity Recognition with 94.2% F1-score.\n- Containerized microservices with Docker and deployed resilient clusters on AWS Kubernetes (EKS).\n- Implemented automated CI/CD pipelines via GitHub Actions ensuring 100% test coverage with pytest.\n\nMachine Learning Engineer | DataSphere Analytics | San Jose, CA\nJun 2020 - Dec 2022\n- Developed predictive classification models using Scikit-Learn and Pandas on datasets exceeding 50 million rows.\n- Built interactive REST APIs using FastAPI and PostgreSQL backend with Redis caching.\n\nEDUCATION\nBachelor of Technology in Computer Science & Engineering\nUniversity of California, Berkeley | 2016 - 2020 | GPA: 3.85 / 4.0\n\nPROJECTS\n- NeuralSearch Engine: Semantic vector search using Hugging Face transformers, FastAPI, and Docker.\n- AutoParser AI: End-to-end resume information extraction pipeline using spaCy NLP and regex rules.\n\nCERTIFICATIONS\n- AWS Certified Solutions Architect\n- Deep Learning Specialization`,
    name: 'Alex Rivera',
    email: 'alex.rivera@email.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'https://linkedin.com/in/alex-rivera-ai',
    github: 'https://github.com/alexrivera-ai',
    portfolio: 'https://alexrivera.dev',
    summary: 'Innovative Artificial Intelligence Engineer with 4+ years of experience developing machine learning models, natural language processing pipelines, and scalable microservices.',
    technical_skills: [
      'Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Natural Language Processing',
      'Large Language Models (LLMs)', 'Hugging Face', 'spaCy', 'FastAPI', 'Docker',
      'Kubernetes', 'AWS', 'PostgreSQL', 'Redis', 'CI/CD', 'GitHub Actions', 'SQL', 'TypeScript'
    ],
    soft_skills: ['Problem Solving', 'Team Leadership', 'Communication', 'Agile'],
    education: [
      {
        degree: 'B.Tech',
        field_of_study: 'Computer Science & Engineering',
        institution: 'University of California, Berkeley',
        year: '2020',
        gpa: '3.85 / 4.0'
      }
    ],
    experience: [
      {
        title: 'Senior AI Engineer',
        company: 'Apex Cognitive Systems',
        dates: 'Jan 2023 - Present',
        bullet_points: [
          'Architected enterprise document processing system using PyTorch and FastAPI, reducing parsing latency by 45%.',
          'Fine-tuned transformer models for domain-specific Named Entity Recognition with 94.2% F1-score.',
          'Containerized microservices with Docker and deployed resilient clusters on AWS Kubernetes (EKS).'
        ]
      },
      {
        title: 'Machine Learning Engineer',
        company: 'DataSphere Analytics',
        dates: 'Jun 2020 - Dec 2022',
        bullet_points: [
          'Developed predictive classification models using Scikit-Learn and Pandas on datasets exceeding 50 million rows.',
          'Built interactive REST APIs using FastAPI and PostgreSQL backend with Redis caching.'
        ]
      }
    ],
    projects: [
      {
        title: 'NeuralSearch Engine',
        description: 'Semantic vector search using Hugging Face transformers, FastAPI, and Docker.',
        technologies: ['PyTorch', 'FastAPI', 'Docker', 'Hugging Face']
      },
      {
        title: 'AutoParser AI',
        description: 'End-to-end resume information extraction pipeline using spaCy NLP and regex rules.',
        technologies: ['Python', 'spaCy', 'Natural Language Processing']
      }
    ],
    certifications: [
      { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: '2022' },
      { name: 'Deep Learning Specialization', issuer: 'Coursera / DeepLearning.AI', year: '2021' }
    ],
    parse_status: 'success',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    latest_match_score: 85.7
  },
  {
    candidate_id: 'cand_priya_sharma',
    filename: 'priya_sharma_fullstack.docx',
    raw_text: `Priya Sharma\nAustin, TX | priya.sharma@techmail.io | +1 (555) 876-5432\nhttps://linkedin.com/in/priyasharma-dev | https://github.com/priyasharma-code\n\nProfessional Summary\nFull-Stack Software Engineer with 3+ years of expertise designing modern React frontends, scalable Node.js backends, and high-performance cloud applications.\n\nTechnical Skills\nTypeScript, JavaScript, Python, SQL, HTML5, CSS3, React, Next.js, Redux, Tailwind CSS, Node.js, Express.js, FastAPI, PostgreSQL, MongoDB, Redis, Docker, AWS, GitHub Actions, CI/CD, Git.\n\nWork Experience\nFull Stack Developer | CloudScale Innovations | Austin, TX\nAug 2022 - Present\n- Built scalable React and TypeScript dashboard used by over 50,000 monthly active users.\n- Engineered asynchronous REST APIs using Node.js and PostgreSQL with sub-100ms response times.\n- Implemented Docker containerization and automated deployments via GitHub Actions on AWS.\n\nEducation\nMaster of Science in Software Engineering\nUniversity of Texas at Austin | 2020 - 2022 | GPA: 3.9 / 4.0\n\nKey Projects\n- CloudTask Manager: Real-time task collaboration application built with React, TypeScript, and Node.js.\n\nCertifications\n- AWS Certified Developer - Associate`,
    name: 'Priya Sharma',
    email: 'priya.sharma@techmail.io',
    phone: '+1 (555) 876-5432',
    location: 'Austin, TX',
    linkedin: 'https://linkedin.com/in/priyasharma-dev',
    github: 'https://github.com/priyasharma-code',
    portfolio: 'https://priyasharma.io',
    summary: 'Full-Stack Software Engineer with 3+ years of expertise designing modern React frontends, scalable Node.js backends, and high-performance cloud applications.',
    technical_skills: [
      'React', 'TypeScript', 'JavaScript', 'Node.js', 'Express.js', 'Next.js',
      'Tailwind CSS', 'Redux', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS',
      'CI/CD', 'Git', 'RESTful APIs', 'HTML5', 'CSS3'
    ],
    soft_skills: ['Communication', 'Collaboration', 'Problem Solving', 'Adaptability'],
    education: [
      {
        degree: 'M.S.',
        field_of_study: 'Software Engineering',
        institution: 'University of Texas at Austin',
        year: '2022',
        gpa: '3.9 / 4.0'
      }
    ],
    experience: [
      {
        title: 'Full Stack Developer',
        company: 'CloudScale Innovations',
        dates: 'Aug 2022 - Present',
        bullet_points: [
          'Built scalable React and TypeScript dashboard used by over 50,000 monthly active users.',
          'Engineered asynchronous REST APIs using Node.js and PostgreSQL with sub-100ms response times.',
          'Implemented Docker containerization and automated deployments via GitHub Actions on AWS.'
        ]
      }
    ],
    projects: [
      {
        title: 'CloudTask Manager',
        description: 'Real-time task collaboration application built with React, TypeScript, and Node.js.',
        technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL']
      }
    ],
    certifications: [
      { name: 'AWS Certified Developer - Associate', issuer: 'Amazon Web Services', year: '2022' },
      { name: 'Meta Front-End Developer Professional Certificate', issuer: 'Meta', year: '2021' }
    ],
    parse_status: 'success',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    latest_match_score: 91.2
  },
  {
    candidate_id: 'cand_marcus_chen',
    filename: 'marcus_chen_data_scientist.pdf',
    raw_text: `Marcus Chen\nSeattle, WA | marcus.chen@datascience.org | +1 (555) 345-6789\nhttps://linkedin.com/in/marcus-chen-ds | https://github.com/marcuschen-data\n\nSUMMARY\nResults-oriented Data Scientist with strong background in statistical modeling, machine learning, and predictive analytics.\n\nCORE COMPETENCIES\nPython, R, SQL, Machine Learning, Data Analysis, Data Visualization, Scikit-Learn, Pandas, NumPy, Tableau, MySQL, PostgreSQL, Snowflake, AWS, Git.\n\nPROFESSIONAL EXPERIENCE\nData Scientist | Vantage Analytics Group | Seattle, WA\nJan 2022 - Present\n- Built customer churn prediction models using Scikit-Learn and Random Forests, improving retention by 18%.\n- Designed automated ETL pipelines in Python and SQL feeding directly into Tableau executive dashboards.\n\nEDUCATION\nBachelor of Science in Mathematics & Statistics\nUniversity of Washington | 2016 - 2020 | GPA: 3.75 / 4.0`,
    name: 'Marcus Chen',
    email: 'marcus.chen@datascience.org',
    phone: '+1 (555) 345-6789',
    location: 'Seattle, WA',
    linkedin: 'https://linkedin.com/in/marcus-chen-ds',
    github: 'https://github.com/marcuschen-data',
    summary: 'Results-oriented Data Scientist with strong background in statistical modeling, machine learning, and predictive analytics.',
    technical_skills: [
      'Python', 'Machine Learning', 'Data Analysis', 'Data Visualization',
      'Scikit-Learn', 'Pandas', 'NumPy', 'SQL', 'R', 'Tableau', 'PostgreSQL', 'Snowflake', 'AWS'
    ],
    soft_skills: ['Problem Solving', 'Attention to Detail', 'Analytical Thinking'],
    education: [
      {
        degree: 'B.S.',
        field_of_study: 'Mathematics & Statistics',
        institution: 'University of Washington',
        year: '2020',
        gpa: '3.75 / 4.0'
      }
    ],
    experience: [
      {
        title: 'Data Scientist',
        company: 'Vantage Analytics Group',
        dates: 'Jan 2022 - Present',
        bullet_points: [
          'Built customer churn prediction models using Scikit-Learn and Random Forests, improving retention by 18%.',
          'Designed automated ETL pipelines in Python and SQL feeding directly into Tableau executive dashboards.'
        ]
      }
    ],
    projects: [
      {
        title: 'ChurnPredictor',
        description: 'Machine learning pipeline predicting customer attrition with Scikit-Learn and Pandas.',
        technologies: ['Python', 'Scikit-Learn', 'Pandas']
      }
    ],
    certifications: [
      { name: 'TensorFlow Developer Certificate', issuer: 'Google', year: '2021' }
    ],
    parse_status: 'success',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    latest_match_score: 78.5
  }
];

// In-browser storage helper
function getStoredCandidates(): ExtractedResume[] {
  try {
    const raw = localStorage.getItem('resumate_candidates');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_DEMO_CANDIDATES;
}

function saveStoredCandidates(candidates: ExtractedResume[]) {
  try {
    localStorage.setItem('resumate_candidates', JSON.stringify(candidates));
  } catch {}
}

// 1. Health check with fallback
export async function checkHealth(): Promise<{ status: string; service: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(1500) });
    if (res.ok) return await res.json();
  } catch {}
  return { status: 'healthy', service: 'Resumate AI Engine (Demo Mode)' };
}

// 2. Parse Single Resume with fallback
export async function parseSingleResume(file: File, persist = true): Promise<ParseResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('persist', String(persist));

    const res = await fetch(`${API_BASE}/resumes/parse`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) return await res.json();
  } catch {}

  // Fallback in-browser parser for Vercel demo
  const parsedCandidate = await simulateBrowserExtraction(file);
  if (persist) {
    const existing = getStoredCandidates();
    saveStoredCandidates([parsedCandidate, ...existing]);
  }

  return {
    success: true,
    message: 'Resume parsed successfully (Demo Mode).',
    candidate: parsedCandidate,
    errors: [],
  };
}

// 3. Batch Parse Resumes with fallback
export async function batchParseResumes(files: File[], persist = true): Promise<BatchParseResponse> {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('persist', String(persist));

    const res = await fetch(`${API_BASE}/resumes/batch-parse`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) return await res.json();
  } catch {}

  // Fallback in-browser batch processing for Vercel
  const successful: ExtractedResume[] = [];
  const errors: { filename: string; error: string }[] = [];

  for (const file of files) {
    const lower = file.name.toLowerCase();
    if (lower.includes('corrupt') || file.size < 50) {
      errors.push({
        filename: file.name,
        error: `File '${file.name}' lacks a valid PDF/DOCX signature or is corrupted.`,
      });
      continue;
    }

    const cand = await simulateBrowserExtraction(file);
    successful.push(cand);
  }

  if (persist && successful.length > 0) {
    const existing = getStoredCandidates();
    saveStoredCandidates([...successful, ...existing]);
  }

  return {
    total_files: files.length,
    successful_count: successful.length,
    failed_count: errors.length,
    candidates: successful,
    errors: errors,
  };
}

// Helper to simulate text and skill extraction from filename/sample content
async function simulateBrowserExtraction(file: File): Promise<ExtractedResume> {
  const nameBase = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  const titleCased = nameBase
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  const isAI = file.name.toLowerCase().includes('ai') || file.name.toLowerCase().includes('alex');
  const isFullstack = file.name.toLowerCase().includes('fullstack') || file.name.toLowerCase().includes('priya');

  const skills = isAI
    ? ['Python', 'PyTorch', 'FastAPI', 'Natural Language Processing', 'Docker', 'AWS', 'TensorFlow', 'PostgreSQL']
    : isFullstack
    ? ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'AWS', 'Git']
    : ['Python', 'SQL', 'Data Analysis', 'Scikit-Learn', 'Pandas', 'Machine Learning', 'Tableau'];

  return {
    candidate_id: `cand_${Math.random().toString(36).substring(2, 10)}`,
    filename: file.name,
    raw_text: `${titleCased}\nContact: ${titleCased.toLowerCase().replace(/\s+/g, '.')}@email.com\nSkills: ${skills.join(', ')}\nExperience: Software Engineer\nEducation: Bachelor of Technology in Computer Science`,
    name: titleCased || 'Candidate Name',
    email: `${titleCased.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    phone: '+1 (555) 456-7890',
    linkedin: `https://linkedin.com/in/${titleCased.toLowerCase().replace(/\s+/g, '-')}`,
    github: `https://github.com/${titleCased.toLowerCase().replace(/\s+/g, '')}`,
    summary: `Dedicated technical specialist with proven experience in ${skills.slice(0, 3).join(', ')}.`,
    technical_skills: skills,
    soft_skills: ['Problem Solving', 'Communication', 'Collaboration'],
    education: [
      {
        degree: 'B.Tech',
        field_of_study: 'Computer Science',
        institution: 'University Institute of Technology',
        year: '2022',
        gpa: '3.8 / 4.0',
      },
    ],
    experience: [
      {
        title: isAI ? 'AI Software Engineer' : 'Full Stack Developer',
        company: 'CloudTech Systems',
        dates: '2022 - Present',
        bullet_points: [
          `Engineered reliable applications with ${skills[0]} and ${skills[1]}.`,
          'Automated deployment pipelines and improved system reliability.',
        ],
      },
    ],
    projects: [
      {
        title: `${skills[0]} Analytics Portal`,
        description: `Full-stack pipeline utilizing ${skills.slice(0, 3).join(', ')}.`,
        technologies: skills.slice(0, 3),
      },
    ],
    certifications: [
      { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: '2023' },
    ],
    parse_status: 'success',
    created_at: new Date().toISOString(),
    latest_match_score: null,
  };
}

// 4. Job Match with explainable fallback
export async function matchResumeWithJob(payload: {
  candidate_id?: string;
  resume_data?: ExtractedResume;
  job_description: string;
  job_title?: string;
  weights?: WeightConfiguration;
}): Promise<JobMatchResult> {
  try {
    const res = await fetch(`${API_BASE}/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) return await res.json();
  } catch {}

  // In-browser Explainable Matcher for Vercel
  const candidates = getStoredCandidates();
  const cand = payload.resume_data || candidates.find((c) => c.candidate_id === payload.candidate_id) || candidates[0];

  const jdText = payload.job_description.toLowerCase();
  const candidateSkills = [...cand.technical_skills, ...cand.soft_skills];

  // Common skills to look for in JD
  const COMMON_SKILLS = [
    'Python', 'React', 'TypeScript', 'JavaScript', 'PyTorch', 'TensorFlow', 'FastAPI',
    'Docker', 'Kubernetes', 'AWS', 'Node.js', 'PostgreSQL', 'SQL', 'Natural Language Processing',
    'Large Language Models (LLMs)', 'Scikit-Learn', 'Pandas', 'NumPy', 'Tailwind CSS',
    'CI/CD', 'Git', 'GitHub Actions', 'Redis', 'Machine Learning', 'Problem Solving'
  ];

  const requiredJdSkills = COMMON_SKILLS.filter((s) => jdText.includes(s.toLowerCase()));
  if (requiredJdSkills.length === 0) {
    requiredJdSkills.push('Python', 'Docker', 'FastAPI', 'Problem Solving');
  }

  const matchingSkills = requiredJdSkills.filter((req) =>
    candidateSkills.some((cs) => cs.toLowerCase() === req.toLowerCase())
  );

  const missingSkills = requiredJdSkills.filter((req) =>
    !candidateSkills.some((cs) => cs.toLowerCase() === req.toLowerCase())
  );

  const additionalSkills = candidateSkills.filter(
    (cs) => !requiredJdSkills.some((req) => req.toLowerCase() === cs.toLowerCase())
  );

  const weights = payload.weights || { skills: 0.65, experience: 0.20, education: 0.15 };
  const totalW = weights.skills + weights.experience + weights.education;
  const wSkill = weights.skills / totalW;
  const wExp = weights.experience / totalW;
  const wEdu = weights.education / totalW;

  const skillScore = requiredJdSkills.length > 0 ? (matchingSkills.length / requiredJdSkills.length) * 100 : 75;
  const expScore = cand.experience.length > 0 ? 85.0 : 50.0;
  const eduScore = cand.education.length > 0 ? 80.0 : 60.0;

  const overallScore = Math.round((wSkill * skillScore + wExp * expScore + wEdu * eduScore) * 10) / 10;

  // Update candidate latest match score in storage
  const updatedCandidates = candidates.map((c) =>
    c.candidate_id === cand.candidate_id ? { ...c, latest_match_score: overallScore } : c
  );
  saveStoredCandidates(updatedCandidates);

  return {
    candidate_id: cand.candidate_id,
    candidate_name: cand.name,
    job_title: payload.job_title || 'Position Analysis',
    overall_score: overallScore,
    skill_score: Math.round(skillScore * 10) / 10,
    experience_score: expScore,
    education_score: eduScore,
    matching_skills: matchingSkills,
    missing_skills: missingSkills,
    candidate_skills: candidateSkills,
    required_job_skills: requiredJdSkills,
    additional_relevant_skills: additionalSkills,
    evidence: [
      ...matchingSkills.map((m) => ({
        category: 'Skill Match',
        detail: `Candidate has documented competency in '${m}'.`,
      })),
      {
        category: 'Experience Evidence',
        detail: `Candidate documented ${cand.experience.length} relevant professional role(s).`,
      },
    ],
    score_breakdown: {
      formula: 'Overall = (W_skill × SkillCoverage) + (W_exp × ExpScore) + (W_edu × EduScore)',
      weights_applied: {
        skills: Math.round(wSkill * 100) / 100,
        experience: Math.round(wExp * 100) / 100,
        education: Math.round(wEdu * 100) / 100,
      },
      component_scores: {
        skill_score: Math.round(skillScore * 10) / 10,
        experience_score: expScore,
        education_score: eduScore,
      },
      skill_metrics: {
        required_count: requiredJdSkills.length,
        matched_count: matchingSkills.length,
        missing_count: missingSkills.length,
        coverage_percentage: Math.round((matchingSkills.length / requiredJdSkills.length) * 1000) / 10,
      },
    },
    suggestions: missingSkills.slice(0, 4).map((m) => ({
      skill: m,
      category: 'Professional Competency',
      description: `Build hands-on practice in ${m} architecture, best practices, and production integration.`,
      recommended_resource: `Official documentation and interactive tutorials for ${m}.`,
    })),
    ethical_notice:
      'Resumate AI scoring is an explainable heuristic designed exclusively to assist human recruiters in skills analysis. It is NOT an automated hiring decision system and never evaluates protected demographic traits.',
    created_at: new Date().toISOString(),
  };
}

// 5. Get Candidates list with search and filter fallback
export async function getCandidates(
  params: {
    search?: string;
    skill?: string;
    sort_by?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<CandidateListResponse> {
  try {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.skill) query.set('skill', params.skill);
    if (params.sort_by) query.set('sort_by', params.sort_by);
    if (params.limit) query.set('limit', String(params.limit));
    if (params.offset) query.set('offset', String(params.offset));

    const res = await fetch(`${API_BASE}/candidates?${query.toString()}`, {
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) return await res.json();
  } catch {}

  // Fallback in-browser filter
  let candidates = getStoredCandidates();

  if (params.search) {
    const q = params.search.toLowerCase();
    candidates = candidates.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        c.filename.toLowerCase().includes(q) ||
        c.technical_skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  if (params.skill) {
    candidates = candidates.filter((c) =>
      c.technical_skills.some((s) => s.toLowerCase() === params.skill!.toLowerCase())
    );
  }

  if (params.sort_by === 'highest_score') {
    candidates.sort((a, b) => (b.latest_match_score || 0) - (a.latest_match_score || 0));
  } else if (params.sort_by === 'name') {
    candidates.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  const items: CandidateListItem[] = candidates.map((c) => ({
    candidate_id: c.candidate_id,
    filename: c.filename,
    name: c.name,
    email: c.email,
    phone: c.phone,
    technical_skills: c.technical_skills.slice(0, 8),
    education_summary: c.education[0]?.degree ? `${c.education[0].degree} - ${c.education[0].institution || ''}` : 'Degree',
    experience_summary: c.experience[0]?.title ? `${c.experience[0].title} at ${c.experience[0].company || ''}` : 'Experience',
    latest_match_score: c.latest_match_score,
    parse_status: c.parse_status,
    created_at: c.created_at,
  }));

  return { total: items.length, items };
}

// 6. Get Candidate Details with fallback
export async function getCandidateDetails(candidateId: string): Promise<ExtractedResume> {
  try {
    const res = await fetch(`${API_BASE}/candidates/${candidateId}`, {
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) return await res.json();
  } catch {}

  const candidates = getStoredCandidates();
  const found = candidates.find((c) => c.candidate_id === candidateId);
  if (found) return found;
  return candidates[0];
}

// 7. Delete Candidate Record with fallback
export async function deleteCandidateRecord(candidateId: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/candidates/${candidateId}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) return await res.json();
  } catch {}

  const candidates = getStoredCandidates();
  const filtered = candidates.filter((c) => c.candidate_id !== candidateId);
  saveStoredCandidates(filtered);
  return { success: true, message: `Candidate '${candidateId}' removed.` };
}

// 8. Clear All with fallback
export async function clearAllCandidates(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/candidates`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) return await res.json();
  } catch {}

  localStorage.removeItem('resumate_candidates');
  return { success: true, message: 'All candidate records cleared.' };
}

// 9. Analytics with fallback
export async function getAnalytics(): Promise<AnalyticsResponse> {
  try {
    const res = await fetch(`${API_BASE}/analytics`, {
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) return await res.json();
  } catch {}

  // Fallback in-browser analytics computed dynamically from stored candidates
  const candidates = getStoredCandidates();
  const total = candidates.length;
  const parsedSuccess = candidates.filter((c) => c.parse_status === 'success').length;

  const scores = candidates.map((c) => c.latest_match_score).filter((s): s is number => s !== null && s !== undefined);
  const avgScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 85.1;

  // Skill frequencies
  const skillCountMap: Record<string, number> = {};
  candidates.forEach((c) => {
    c.technical_skills.forEach((sk) => {
      skillCountMap[sk] = (skillCountMap[sk] || 0) + 1;
    });
  });

  const topSkills: SkillDistribution[] = Object.entries(skillCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({
      skill,
      count,
      percentage: Math.round((count / Math.max(total, 1)) * 100),
    }));

  const scoreBins: ScoreBin[] = [
    { range: '0-20%', count: scores.filter((s) => s <= 20).length },
    { range: '21-40%', count: scores.filter((s) => s > 20 && s <= 40).length },
    { range: '41-60%', count: scores.filter((s) => s > 40 && s <= 60).length },
    { range: '61-80%', count: scores.filter((s) => s > 60 && s <= 80).length },
    { range: '81-100%', count: scores.filter((s) => s > 80).length },
  ];

  const recentItems: CandidateListItem[] = candidates.slice(0, 5).map((c) => ({
    candidate_id: c.candidate_id,
    filename: c.filename,
    name: c.name,
    email: c.email,
    phone: c.phone,
    technical_skills: c.technical_skills.slice(0, 5),
    education_summary: c.education[0]?.degree || 'Degree',
    experience_summary: c.experience[0]?.title || 'Experience',
    latest_match_score: c.latest_match_score,
    parse_status: c.parse_status,
    created_at: c.created_at,
  }));

  return {
    total_resumes: total,
    parsed_successfully: parsedSuccess,
    average_match_score: avgScore,
    top_skills: topSkills.length > 0 ? topSkills : [
      { skill: 'Python', count: 3, percentage: 100 },
      { skill: 'Docker', count: 2, percentage: 67 },
      { skill: 'FastAPI', count: 2, percentage: 67 },
      { skill: 'React', count: 1, percentage: 33 },
      { skill: 'PostgreSQL', count: 3, percentage: 100 },
    ],
    match_score_distribution: scoreBins,
    education_levels: [
      { level: 'B.Tech / B.S.', count: 2 },
      { level: 'M.S.', count: 1 },
    ],
    recent_candidates: recentItems,
  };
}

export function getExportCsvUrl(): string {
  return `${API_BASE}/export/csv`;
}

export function getExportJsonUrl(): string {
  return `${API_BASE}/export/json`;
}
