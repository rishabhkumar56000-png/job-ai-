import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Code2,
  FileText,
  FolderGit2,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import { ResumeAnalysis, TRACKED_CORE_SKILLS } from '../types/career';
import { DEMO_RESUME } from '../data/demoData';
import { SkillCategoryChart } from './Charts';

interface ResumeAnalyzerViewProps {
  activeResume: ResumeAnalysis | null;
  resumes: ResumeAnalysis[];
  onSelectResume: (resume: ResumeAnalysis) => void;
  onSaveAnalyzedResume: (
    analysis: Omit<ResumeAnalysis, 'id' | 'userId' | 'createdAt' | 'createdAtIso'>
  ) => Promise<void>;
  onDeleteResume: (resumeId: string) => Promise<void>;
  onLoadDemo: () => void;
  onGoToJobMatch: () => void;
}

export function ResumeAnalyzerView({
  activeResume,
  resumes,
  onSelectResume,
  onSaveAnalyzedResume,
  onDeleteResume,
  onLoadDemo,
  onGoToJobMatch,
}: ResumeAnalyzerViewProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [pendingFileName, setPendingFileName] = useState('');
  const [pendingFileType, setPendingFileType] = useState<'pdf' | 'docx' | 'text'>('pdf');
  const [extractedDraft, setExtractedDraft] = useState('');
  const [showReviewPanel, setShowReviewPanel] = useState(false);

  const validateClientFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      return 'Unsupported file format. Please upload a PDF (.pdf) or Word (.docx) document.';
    }
    if (file.size > 8 * 1024 * 1024) {
      return 'File exceeds the 8 MB limit. Please upload a smaller resume file.';
    }
    return null;
  };

  const handleFileExtraction = async (file: File) => {
    setErrorMsg(null);
    const validationErr = validateClientFile(file);
    if (validationErr) {
      setErrorMsg(validationErr);
      return;
    }

    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/extract-resume', {
        method: 'POST',
        body: formData,
      });
      const data = (await res.json()) as {
        error?: string;
        fileName?: string;
        fileType?: 'pdf' | 'docx';
        text?: string;
      };

      if (!res.ok || !data.text) {
        throw new Error(data.error || 'Could not extract text from the uploaded file.');
      }

      setPendingFileName(data.fileName || file.name);
      setPendingFileType(data.fileType || (file.name.endsWith('.docx') ? 'docx' : 'pdf'));
      setExtractedDraft(data.text);
      setShowReviewPanel(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to extract resume file.');
    } finally {
      setExtracting(false);
    }
  };

  const handleAnalyzeDraft = async () => {
    setErrorMsg(null);
    if (extractedDraft.trim().length < 40) {
      setErrorMsg('Please provide at least 40 characters of resume text before running AI analysis.');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: extractedDraft }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Resume analysis failed.');
      }

      await onSaveAnalyzedResume({
        fileName: pendingFileName || 'Pasted_Resume.txt',
        fileType: pendingFileType,
        extractedText: extractedDraft.trim(),
        summary: data.summary || '',
        education: Array.isArray(data.education) ? data.education : [],
        experience: Array.isArray(data.experience) ? data.experience : [],
        projects: Array.isArray(data.projects) ? data.projects : [],
        strengths: Array.isArray(data.strengths) ? data.strengths : [],
        improvements: Array.isArray(data.improvements) ? data.improvements : [],
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
        programmingSkills: Array.isArray(data.programmingSkills) ? data.programmingSkills : [],
        technicalSkills: Array.isArray(data.technicalSkills) ? data.technicalSkills : [],
        softSkills: Array.isArray(data.softSkills) ? data.softSkills : [],
        isDemo: false,
      });
      setShowReviewPanel(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to analyze resume.');
    } finally {
      setAnalyzing(false);
    }
  };

  const allDetectedLower = new Set(
    [
      ...(activeResume?.programmingSkills || []),
      ...(activeResume?.technicalSkills || []),
      ...(activeResume?.softSkills || []),
    ].map((s) => s.toLowerCase())
  );

  const isCoreSkillDetected = (skill: string): boolean => {
    const target = skill.toLowerCase();
    for (const s of allDetectedLower) {
      if (s === target || s.includes(target) || (target === 'html and css' && (s.includes('html') || s.includes('css')))) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Resume Analyzer &amp; Skill Detector
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Upload a PDF or DOCX resume to extract sections, detect categorized skills, and review grounded AI feedback.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onLoadDemo}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            Load Demo Sample
          </button>
          {activeResume && (
            <button
              type="button"
              onClick={onGoToJobMatch}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer whitespace-nowrap"
            >
              Match Against Job
            </button>
          )}
        </div>
      </div>

      {/* Upload / Paste Workspace Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                inputMode === 'upload'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upload PDF / DOCX
            </button>
            <button
              type="button"
              onClick={() => {
                setInputMode('paste');
                setPendingFileType('text');
                if (!pendingFileName) setPendingFileName('Pasted_Resume.txt');
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                inputMode === 'paste'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paste Resume Text
            </button>
          </div>

          <span className="text-xs text-slate-500">
            Max 8 MB · PDF (.pdf) &amp; Word (.docx) · Zero qualification fabrication
          </span>
        </div>

        {errorMsg && (
          <div className="mb-5 p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {inputMode === 'upload' && !showReviewPanel && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) void handleFileExtraction(file);
            }}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-slate-300 bg-slate-50/50 hover:border-slate-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFileExtraction(file);
                e.target.value = '';
              }}
            />
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 text-blue-600">
              {extracting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              {extracting ? 'Extracting resume text...' : 'Drop your PDF or DOCX resume here'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Text is extracted on the server so you can review and verify every line before AI analysis.
            </p>
            <button
              type="button"
              disabled={extracting}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Select Resume File
            </button>
          </div>
        )}

        {(inputMode === 'paste' || showReviewPanel) && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-slate-900">
                  Review Extracted Information
                </span>
                {pendingFileName && (
                  <span className="text-xs text-slate-500">· {pendingFileName}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {extractedDraft.length.toLocaleString()} chars
                </span>
                {showReviewPanel && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewPanel(false);
                      setExtractedDraft('');
                    }}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Upload Another File
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={extractedDraft}
              onChange={(e) => setExtractedDraft(e.target.value)}
              rows={9}
              placeholder="Paste your resume text here (education, coursework, projects, experience, and skills)..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50/70 p-4 text-sm text-slate-800 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                Verify or edit the extracted text above before running Gemini AI analysis.
              </p>
              <button
                type="button"
                disabled={analyzing || extractedDraft.trim().length < 40}
                onClick={() => void handleAnalyzeDraft()}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze Resume &amp; Detect Skills
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Saved Resume Switcher */}
      {resumes.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Saved Resume Analyses</h2>
            <span className="text-xs text-slate-500 tabular-nums">{resumes.length} saved</span>
          </div>
          <div className="divide-y divide-slate-100">
            {resumes.map((r) => {
              const isSelected = activeResume?.id === r.id;
              return (
                <div
                  key={r.id}
                  className={`py-2.5 px-3 rounded-lg flex items-center justify-between gap-4 transition-colors ${
                    isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectResume(r)}
                    className="flex items-center gap-3 text-left min-w-0 flex-1 cursor-pointer"
                  >
                    <FileText
                      className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {r.fileName}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{r.isDemo ? 'Demo Sample' : r.fileType.toUpperCase()}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {r.programmingSkills.length + r.technicalSkills.length + r.softSkills.length} skills
                        </span>
                      </div>
                    </div>
                  </button>
                  {!r.isDemo && (
                    <button
                      type="button"
                      onClick={() => void onDeleteResume(r.id)}
                      aria-label={`Delete ${r.fileName}`}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Analysis & Skill Detector Output */}
      {!activeResume ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <FileText className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No resume analyzed yet</h3>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto mb-5">
            Upload a PDF or DOCX resume above, paste text directly, or load the demo student resume to inspect every feature.
          </p>
          <button
            type="button"
            onClick={() => {
              onLoadDemo();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            Load Demo Resume ({DEMO_RESUME.fileName})
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Columns: Summary, Sections & Feedback */}
          <div className="lg:col-span-7 space-y-6">
            {/* AI Summary */}
            <div className="bg-[#0F172A] text-white border border-slate-800 rounded-xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="text-xs font-medium text-blue-300">
                  {activeResume.isDemo ? 'Demo Sample Analysis' : 'AI Resume Summary'}
                </div>
                <div className="text-xs text-slate-400 truncate max-w-xs">{activeResume.fileName}</div>
              </div>
              <p className="text-sm sm:text-base text-slate-100 leading-relaxed">{activeResume.summary}</p>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Key Strengths
                </h3>
                <ul className="space-y-2.5 text-sm text-slate-700">
                  {activeResume.strengths.map((item, i) => (
                    <li key={i} className="leading-relaxed">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2.5 text-sm text-slate-700">
                  {activeResume.improvements.map((item, i) => (
                    <li key={i} className="leading-relaxed">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable Suggestions */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Suggested Resume Improvements
              </h3>
              <ol className="space-y-2.5 text-sm text-slate-700">
                {activeResume.suggestions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="font-mono text-xs font-semibold text-blue-600 mt-1 tabular-nums">
                      0{idx + 1}.
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Extracted Education, Experience & Projects */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Education
                </h3>
                {activeResume.education.length === 0 ? (
                  <p className="text-xs text-slate-500">No education entries detected in resume text.</p>
                ) : (
                  <div className="space-y-3">
                    {activeResume.education.map((edu, idx) => (
                      <div key={idx} className="border-b border-slate-100 last:border-none pb-3 last:pb-0">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-900">{edu.degree}</span>
                          <span className="text-xs text-slate-500">{edu.period}</span>
                        </div>
                        <div className="text-xs font-medium text-slate-700 mt-0.5">{edu.institution}</div>
                        {edu.details && <p className="text-xs text-slate-600 mt-1">{edu.details}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Experience
                </h3>
                {activeResume.experience.length === 0 ? (
                  <p className="text-xs text-slate-500">No work or research experience entries detected.</p>
                ) : (
                  <div className="space-y-4">
                    {activeResume.experience.map((exp, idx) => (
                      <div key={idx} className="border-b border-slate-100 last:border-none pb-3 last:pb-0">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-900">{exp.role}</span>
                          <span className="text-xs text-slate-500">{exp.period}</span>
                        </div>
                        <div className="text-xs font-medium text-slate-700 mt-0.5">{exp.organization}</div>
                        <ul className="mt-2 space-y-1 text-xs text-slate-600">
                          {exp.highlights.map((h, i) => (
                            <li key={i}>• {h}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-blue-600" />
                  Projects
                </h3>
                {activeResume.projects.length === 0 ? (
                  <p className="text-xs text-slate-500">No project entries detected.</p>
                ) : (
                  <div className="space-y-4">
                    {activeResume.projects.map((proj, idx) => (
                      <div key={idx} className="border-b border-slate-100 last:border-none pb-3 last:pb-0">
                        <div className="text-sm font-semibold text-slate-900">{proj.title}</div>
                        {proj.technologies.length > 0 && (
                          <div className="text-xs text-blue-700 font-medium mt-0.5">
                            {proj.technologies.join(' · ')}
                          </div>
                        )}
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Raw Extracted Text Review Accordion */}
              <details className="border-t border-slate-200 pt-4">
                <summary className="text-xs font-semibold text-slate-700 cursor-pointer hover:text-slate-900">
                  Inspect Raw Extracted Resume Text
                </summary>
                <pre className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {activeResume.extractedText}
                </pre>
              </details>
            </div>
          </div>

          {/* Right 5 Columns: Skill Detector & Category Analytics */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-600" />
                  Skill Detector
                </h3>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {activeResume.programmingSkills.length +
                    activeResume.technicalSkills.length +
                    activeResume.softSkills.length}{' '}
                  total
                </span>
              </div>

              <SkillCategoryChart
                programmingCount={activeResume.programmingSkills.length}
                technicalCount={activeResume.technicalSkills.length}
                softCount={activeResume.softSkills.length}
              />

              {/* 10 Benchmark Core Skills Verification Grid */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <h4 className="text-xs font-semibold text-slate-700 mb-3">
                  Core Career Skill Verification
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {TRACKED_CORE_SKILLS.map((skill) => {
                    const detected = isCoreSkillDetected(skill);
                    return (
                      <div
                        key={skill}
                        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs ${
                          detected
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <span className="font-medium truncate">{skill}</span>
                        {detected ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Categorized Lists */}
              <div className="mt-6 pt-5 border-t border-slate-200 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 mb-2">Programming Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeResume.programmingSkills.length > 0 ? (
                      activeResume.programmingSkills.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-md border border-blue-200 bg-blue-50/60 text-xs font-medium text-blue-900"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">None detected</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-900 mb-2">Technical &amp; AI Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeResume.technicalSkills.length > 0 ? (
                      activeResume.technicalSkills.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-md border border-indigo-200 bg-indigo-50/60 text-xs font-medium text-indigo-900"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">None detected</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-900 mb-2">Soft Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeResume.softSkills.length > 0 ? (
                      activeResume.softSkills.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">None detected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
