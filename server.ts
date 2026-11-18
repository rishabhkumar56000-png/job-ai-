import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const GEMINI_MODEL = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function handleGeminiError(res: Response, error: unknown, context: string) {
  console.error(`[JobMatch AI Server] ${context} error:`, error);
  const message = error instanceof Error ? error.message : 'Unexpected server error';
  const status =
    message.includes('PERMISSION_DENIED') || message.includes('403')
      ? 403
      : message.includes('RESOURCE_EXHAUSTED') || message.includes('429')
        ? 429
        : message.includes('API_KEY_INVALID') || message.includes('not configured')
          ? 500
          : 502;
  res.status(status).json({
    error: `${context} failed: ${message}`,
  });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024, // 8 MB max
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExt = ext === '.pdf' || ext === '.docx';
    const allowedMime =
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/octet-stream';
    if (!allowedExt || !allowedMime) {
      cb(new Error('Only PDF (.pdf) and Word (.docx) resume files are allowed.'));
      return;
    }
    cb(null, true);
  },
});

async function extractPdfText(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
  const header = buffer.subarray(0, 5).toString('ascii');
  if (!header.startsWith('%PDF-')) {
    throw new Error('Invalid PDF file signature. Please upload a valid PDF document.');
  }
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    verbosity: 0,
  });
  const pdf = await loadingTask.promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .filter((s) => s.length > 0);
    pages.push(strings.join(' '));
  }
  const combined = pages.join('\n\n').replace(/\s+\n/g, '\n').trim();
  return { text: combined, pageCount: pdf.numPages };
}

async function extractDocxText(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
  // DOCX files are ZIP archives starting with PK\x03\x04
  if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
    throw new Error('Invalid DOCX file signature. Please upload a valid Word (.docx) document.');
  }
  const result = await mammoth.extractRawText({ buffer });
  const text = (result.value || '').trim();
  return { text, pageCount: Math.max(1, Math.ceil(text.length / 2500)) };
}

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'jobmatch-ai' });
});

app.post('/api/extract-resume', (req: Request, res: Response) => {
  upload.single('resume')(req, res, async (uploadErr) => {
    if (uploadErr) {
      res.status(400).json({
        error: uploadErr instanceof Error ? uploadErr.message : 'File upload validation failed.',
      });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'Please select a PDF or DOCX resume file to upload.' });
      return;
    }

    try {
      const ext = path.extname(file.originalname).toLowerCase();
      const fileType = ext === '.pdf' ? 'pdf' : 'docx';
      const extracted =
        fileType === 'pdf'
          ? await extractPdfText(file.buffer)
          : await extractDocxText(file.buffer);

      if (!extracted.text || extracted.text.length < 30) {
        res.status(422).json({
          error:
            'No selectable text could be extracted from this file. If it is a scanned image PDF, please upload a text-based PDF or DOCX, or paste your resume text.',
        });
        return;
      }

      res.json({
        fileName: path.basename(file.originalname).slice(0, 200),
        fileType,
        pageCount: extracted.pageCount,
        text: extracted.text.slice(0, 34000),
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to parse resume file.',
      });
    }
  });
});

app.post('/api/analyze-resume', async (req: Request, res: Response) => {
  try {
    const { resumeText } = req.body as { resumeText?: string };
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 40) {
      res.status(400).json({ error: 'Resume text must be at least 40 characters for analysis.' });
      return;
    }

    const ai = getGeminiClient();
    const trimmedResume = resumeText.trim().slice(0, 32000);

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Analyze the following student/candidate resume text and return structured JSON.

CRITICAL GROUNDING RULES:
- Extract ONLY information explicitly stated in the resume text.
- NEVER fabricate degrees, employers, projects, metrics, or skills that are not present in the text.
- Specifically check for and normalize these skills IF AND ONLY IF evidenced in the resume:
  "Python", "Java", "C++", "HTML and CSS", "JavaScript", "SQL", "Machine Learning", "Artificial Intelligence", "Data Science", "Communication"
  alongside any other genuine skills found in the resume.
- Categorize detected skills cleanly into:
  - programmingSkills (e.g., Python, Java, C++, JavaScript, HTML and CSS, SQL, TypeScript, etc.)
  - technicalSkills (e.g., Machine Learning, Artificial Intelligence, Data Science, Git, Docker, React, etc.)
  - softSkills (e.g., Communication, Teamwork, Leadership, Presentation, Problem Solving, etc.)

Resume Text:
"""
${trimmedResume}
"""`,
      config: {
        systemInstruction:
          'You are an accurate, grounded career analyst. Never invent qualifications or skills not present in the source resume.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'Concise 3-4 sentence professional resume summary.' },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  institution: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  period: { type: Type.STRING },
                  details: { type: Type.STRING },
                },
                required: ['institution', 'degree', 'period', 'details'],
              },
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  organization: { type: Type.STRING },
                  period: { type: Type.STRING },
                  highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['role', 'organization', 'period', 'highlights'],
              },
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                  description: { type: Type.STRING },
                },
                required: ['title', 'technologies', 'description'],
              },
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            programmingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            technicalSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            softSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'summary',
            'education',
            'experience',
            'projects',
            'strengths',
            'improvements',
            'suggestions',
            'programmingSkills',
            'technicalSkills',
            'softSkills',
          ],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    res.json(parsed);
  } catch (error) {
    handleGeminiError(res, error, 'Resume analysis');
  }
});

app.post('/api/match-job', async (req: Request, res: Response) => {
  try {
    const {
      resumeSkills,
      resumeSummary,
      jobTitle,
      companyName,
      jobDescription,
    } = req.body as {
      resumeSkills?: string[];
      resumeSummary?: string;
      jobTitle?: string;
      companyName?: string;
      jobDescription?: string;
    };

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 25) {
      res.status(400).json({ error: 'Please provide a job description of at least 25 characters.' });
      return;
    }

    const skillsList = Array.isArray(resumeSkills) ? resumeSkills.slice(0, 80) : [];
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Compare the candidate's verified resume skills and summary against the job description below.

Candidate Verified Skills: ${skillsList.join(', ') || 'None specified'}
Candidate Summary: ${(resumeSummary || '').slice(0, 1500)}

Job Title: ${(jobTitle || 'Target Role').slice(0, 150)}
Company: ${(companyName || 'Target Employer').slice(0, 150)}
Job Description:
"""
${jobDescription.trim().slice(0, 16000)}
"""

INSTRUCTIONS:
1. List matchedSkills ONLY if evidenced in the candidate's verified skills or summary.
2. List missingSkills required or preferred in the job description that are NOT evidenced in the candidate's resume.
3. Calculate an explainable compatibilityScore (0-100) as the exact sum of 4 scoreBreakdown categories totaling 100 max points:
   - Core Programming & Technical Skills (max 40)
   - Domain & Applied Frameworks (max 25)
   - Relevant Experience & Projects (max 20)
   - Communication & Soft Skills (max 15)
4. Provide a transparent scoreExplanation detailing how points were earned and deducted. Explicitly state that this score is an advisory skill-alignment estimate and never guarantees employment.`,
      config: {
        systemInstruction:
          'You are a transparent career matching evaluator. Never invent candidate qualifications and never promise or guarantee employment.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            compatibilityScore: { type: Type.INTEGER },
            matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            scoreExplanation: { type: Type.STRING },
            scoreBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  earned: { type: Type.INTEGER },
                  max: { type: Type.INTEGER },
                  rationale: { type: Type.STRING },
                },
                required: ['category', 'earned', 'max', 'rationale'],
              },
            },
          },
          required: [
            'compatibilityScore',
            'matchedSkills',
            'missingSkills',
            'scoreExplanation',
            'scoreBreakdown',
          ],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    // Ensure arithmetic consistency on scoreBreakdown sum
    if (Array.isArray(parsed.scoreBreakdown) && parsed.scoreBreakdown.length > 0) {
      const sumEarned = parsed.scoreBreakdown.reduce(
        (acc: number, item: { earned?: number }) => acc + (Number(item.earned) || 0),
        0
      );
      parsed.compatibilityScore = Math.max(0, Math.min(100, Math.round(sumEarned)));
    }
    res.json(parsed);
  } catch (error) {
    handleGeminiError(res, error, 'Job compatibility analysis');
  }
});

app.post('/api/skill-gaps', async (req: Request, res: Response) => {
  try {
    const { missingSkills, targetRole } = req.body as {
      missingSkills?: string[];
      targetRole?: string;
    };

    if (!Array.isArray(missingSkills) || missingSkills.length === 0) {
      res.status(400).json({ error: 'At least one missing or target skill is required.' });
      return;
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `For a student targeting the role "${(targetRole || 'Software Developer').slice(0, 100)}", create an actionable skill improvement plan for these skill gaps:
${missingSkills.slice(0, 12).join(', ')}

For each skill, provide:
- skillName
- category: one of "programming", "technical", or "soft"
- priority: one of "High", "Medium", or "Foundation"
- learningTopics: 3 concrete, study-ready topics or exercises`,
      config: {
        systemInstruction: 'You are an academic and technical curriculum designer for university students.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              skillName: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['programming', 'technical', 'soft'] },
              priority: { type: Type.STRING, enum: ['High', 'Medium', 'Foundation'] },
              learningTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['skillName', 'category', 'priority', 'learningTopics'],
          },
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '[]').trim());
    res.json({ items: parsed });
  } catch (error) {
    handleGeminiError(res, error, 'Skill gap generation');
  }
});

app.post('/api/roadmap', async (req: Request, res: Response) => {
  try {
    const { targetRole, currentSkills } = req.body as {
      targetRole?: string;
      currentSkills?: string[];
    };

    const allowedRoles = [
      'AI/ML Engineer',
      'Data Analyst',
      'Software Developer',
      'Web Developer',
      'Cybersecurity Analyst',
      'Data Scientist',
    ];
    if (!targetRole || !allowedRoles.includes(targetRole)) {
      res.status(400).json({ error: 'Please select one of the supported target career roles.' });
      return;
    }

    const skills = Array.isArray(currentSkills) ? currentSkills.slice(0, 50) : [];
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Create a personalized career development roadmap for a student pursuing "${targetRole}".
Current verified skills on resume: ${skills.join(', ') || 'Beginner / Exploring'}

Build a practical 4-to-5 phase roadmap with:
- overview (concise 2-3 sentence summary tailored to their current skills)
- steps (4-5 ordered milestones with stepId like "step_1", phase like "Weeks 1-3", title, description, skillsCovered, estimatedWeeks)
- recommendedSkills (8-12 core skills for this role)
- projectSuggestions (2-3 portfolio capstone projects with title, difficulty, description, skillsApplied)`,
      config: {
        systemInstruction:
          'You are a pragmatic technical career mentor. Design realistic, actionable learning roadmaps for students without making employment guarantees.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepId: { type: Type.STRING },
                  phase: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  skillsCovered: { type: Type.ARRAY, items: { type: Type.STRING } },
                  estimatedWeeks: { type: Type.INTEGER },
                },
                required: ['stepId', 'phase', 'title', 'description', 'skillsCovered', 'estimatedWeeks'],
              },
            },
            recommendedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            projectSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  description: { type: Type.STRING },
                  skillsApplied: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['title', 'difficulty', 'description', 'skillsApplied'],
              },
            },
          },
          required: ['overview', 'steps', 'recommendedSkills', 'projectSuggestions'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    res.json({ targetRole, ...parsed });
  } catch (error) {
    handleGeminiError(res, error, 'Career roadmap generation');
  }
});

app.post('/api/interview/generate', async (req: Request, res: Response) => {
  try {
    const { targetRole, category, resumeSkills } = req.body as {
      targetRole?: string;
      category?: 'technical' | 'hr';
      resumeSkills?: string[];
    };

    const role = (targetRole || 'Software Developer').slice(0, 100);
    const qType = category === 'hr' ? 'hr' : 'technical';
    const skills = Array.isArray(resumeSkills) ? resumeSkills.slice(0, 30) : [];

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Generate 3 realistic ${qType === 'hr' ? 'HR / Behavioral' : 'Technical'} interview questions for an entry-level/internship "${role}" candidate.
Candidate skills: ${skills.join(', ') || 'General computer science fundamentals'}

For each question, include a crisp, high-quality sampleAnswer (3-5 sentences using STAR or concrete technical reasoning).`,
      config: {
        systemInstruction: 'You are an experienced technical hiring interviewer coaching college students.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              sampleAnswer: { type: Type.STRING },
            },
            required: ['question', 'sampleAnswer'],
          },
        },
      },
    });

    const questions = JSON.parse((response.text ?? '[]').trim());
    res.json({ questions });
  } catch (error) {
    handleGeminiError(res, error, 'Interview question generation');
  }
});

app.post('/api/interview/evaluate', async (req: Request, res: Response) => {
  try {
    const { targetRole, category, question, sampleAnswer, userAnswer } = req.body as {
      targetRole?: string;
      category?: 'technical' | 'hr';
      question?: string;
      sampleAnswer?: string;
      userAnswer?: string;
    };

    if (!question || !userAnswer || userAnswer.trim().length < 15) {
      res.status(400).json({ error: 'Please write an answer of at least 15 characters before submitting for AI feedback.' });
      return;
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Evaluate a student's practice interview response.
Target Role: ${(targetRole || 'Software Developer').slice(0, 100)}
Question Type: ${category === 'hr' ? 'HR / Behavioral' : 'Technical'}
Question: ${question.slice(0, 1400)}
Reference Benchmark: ${(sampleAnswer || '').slice(0, 2000)}
Student Answer:
"""
${userAnswer.trim().slice(0, 5500)}
"""

Provide constructive, encouraging, and specific coaching feedback:
- score (integer 0-100 based on clarity, technical accuracy / STAR structure, and relevance)
- aiFeedback (concise 2-4 sentence summary)
- strengths (2-3 concrete points done well)
- improvements (2-3 actionable things to sharpen)`,
      config: {
        systemInstruction: 'You are an honest, supportive interview coach evaluating student practice answers.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            aiFeedback: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['score', 'aiFeedback', 'strengths', 'improvements'],
        },
      },
    });

    const evaluation = JSON.parse((response.text ?? '{}').trim());
    evaluation.score = Math.max(0, Math.min(100, Math.round(Number(evaluation.score) || 0)));
    res.json(evaluation);
  } catch (error) {
    handleGeminiError(res, error, 'Interview answer evaluation');
  }
});

// JSON error fallback for API routes
app.use('/api', (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled API error:', err);
  res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JobMatch AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
