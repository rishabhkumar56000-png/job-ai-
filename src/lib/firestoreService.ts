import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  CareerRoadmap,
  FIELD_LIMITS,
  InterviewSession,
  JobMatch,
  ResumeAnalysis,
  SkillGapItem,
  UserProfile,
} from '../types/career';

function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, FIELD_LIMITS.id);
  return cleaned.length > 0 ? cleaned : `id_${Date.now()}`;
}

export function createClientId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return sanitizeId(`${prefix}_${Date.now()}_${random}`);
}

function clampStr(value: string | undefined | null, maxLen: number, fallback = ''): string {
  const trimmed = (value ?? fallback).trim();
  if (trimmed.length === 0) return fallback;
  return trimmed.slice(0, maxLen);
}

function clampStrArray(arr: string[] | undefined, maxItems: number, maxItemLen = 120): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item) => String(item).trim().slice(0, maxItemLen))
    .filter((item) => item.length > 0)
    .slice(0, maxItems);
}

function toIsoDate(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (value && typeof value === 'object' && 'seconds' in value) {
    const secs = Number((value as { seconds: number }).seconds);
    if (!Number.isNaN(secs)) {
      return new Date(secs * 1000).toISOString();
    }
  }
  return new Date().toISOString();
}

export async function ensureUserProfile(params: {
  uid: string;
  email: string;
  displayName: string;
  targetRole?: string;
}): Promise<UserProfile> {
  const path = `users/${params.uid}`;
  const ref = doc(db, 'users', params.uid);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    const profilePayload = {
      uid: sanitizeId(params.uid),
      email: clampStr(params.email, 254, 'student@example.com'),
      displayName: clampStr(params.displayName, 120, 'Student'),
      targetRole: clampStr(params.targetRole, 100, 'AI/ML Engineer'),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, profilePayload);
    return profilePayload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateUserProfileTargetRole(uid: string, targetRole: string, displayName?: string) {
  const path = `users/${uid}`;
  try {
    const payload: Record<string, unknown> = {
      targetRole: clampStr(targetRole, 100, 'AI/ML Engineer'),
      updatedAt: serverTimestamp(),
    };
    if (displayName) {
      payload.displayName = clampStr(displayName, 120, 'Student');
    }
    await updateDoc(doc(db, 'users', uid), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveResumeAnalysis(
  uid: string,
  input: Omit<ResumeAnalysis, 'id' | 'userId' | 'createdAt' | 'createdAtIso'>
): Promise<ResumeAnalysis> {
  const id = createClientId('res');
  const path = `users/${uid}/resumes/${id}`;
  const payload = {
    id,
    userId: uid,
    fileName: clampStr(input.fileName, FIELD_LIMITS.fileName, 'resume.pdf'),
    fileType: input.fileType,
    extractedText: clampStr(input.extractedText, FIELD_LIMITS.extractedText, 'No text extracted'),
    summary: clampStr(input.summary, FIELD_LIMITS.summary, 'Resume analysis complete.'),
    education: (input.education || []).slice(0, 15).map((e) => ({
      institution: clampStr(e.institution, 160, 'University'),
      degree: clampStr(e.degree, 160, 'Degree'),
      period: clampStr(e.period, 80, ''),
      details: clampStr(e.details, 400, ''),
    })),
    experience: (input.experience || []).slice(0, 20).map((ex) => ({
      role: clampStr(ex.role, 140, 'Role'),
      organization: clampStr(ex.organization, 140, 'Organization'),
      period: clampStr(ex.period, 80, ''),
      highlights: clampStrArray(ex.highlights, 8, 300),
    })),
    projects: (input.projects || []).slice(0, 20).map((p) => ({
      title: clampStr(p.title, 160, 'Project'),
      technologies: clampStrArray(p.technologies, 12, 60),
      description: clampStr(p.description, 500, ''),
    })),
    strengths: clampStrArray(input.strengths, 15, 280),
    improvements: clampStrArray(input.improvements, 15, 280),
    suggestions: clampStrArray(input.suggestions, 15, 280),
    programmingSkills: clampStrArray(input.programmingSkills, 40, 60),
    technicalSkills: clampStrArray(input.technicalSkills, 40, 60),
    softSkills: clampStrArray(input.softSkills, 30, 60),
    isDemo: Boolean(input.isDemo),
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'users', uid, 'resumes', id), payload);
    return {
      ...payload,
      createdAtIso: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteResumeAnalysis(uid: string, resumeId: string) {
  const path = `users/${uid}/resumes/${resumeId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'resumes', resumeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveJobMatch(
  uid: string,
  input: Omit<JobMatch, 'id' | 'userId' | 'createdAt' | 'createdAtIso'>
): Promise<JobMatch> {
  const id = createClientId('match');
  const path = `users/${uid}/jobMatches/${id}`;
  const payload = {
    id,
    userId: uid,
    resumeId: sanitizeId(input.resumeId || 'manual_resume'),
    jobTitle: clampStr(input.jobTitle, FIELD_LIMITS.jobTitle, 'Target Role'),
    companyName: clampStr(input.companyName, FIELD_LIMITS.companyName, 'Target Organization'),
    jobDescription: clampStr(input.jobDescription, FIELD_LIMITS.jobDescription, 'Job description'),
    compatibilityScore: Math.max(0, Math.min(100, Math.round(input.compatibilityScore))),
    matchedSkills: clampStrArray(input.matchedSkills, 50, 80),
    missingSkills: clampStrArray(input.missingSkills, 50, 80),
    scoreExplanation: clampStr(input.scoreExplanation, FIELD_LIMITS.scoreExplanation, 'Score computed from skill overlap.'),
    scoreBreakdown: (input.scoreBreakdown || []).slice(0, 10).map((b) => ({
      category: clampStr(b.category, 80, 'Criteria'),
      earned: Number(b.earned) || 0,
      max: Number(b.max) || 25,
      rationale: clampStr(b.rationale, 350, ''),
    })),
    isDemo: Boolean(input.isDemo),
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'users', uid, 'jobMatches', id), payload);
    return { ...payload, createdAtIso: new Date().toISOString() };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteJobMatch(uid: string, matchId: string) {
  const path = `users/${uid}/jobMatches/${matchId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'jobMatches', matchId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSkillGapItems(
  uid: string,
  items: Omit<SkillGapItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]
): Promise<SkillGapItem[]> {
  const saved: SkillGapItem[] = [];
  for (const item of items.slice(0, 20)) {
    const id = sanitizeId(`skill_${item.skillName.toLowerCase()}`);
    const path = `users/${uid}/skillProgress/${id}`;
    const payload = {
      id,
      userId: uid,
      skillName: clampStr(item.skillName, FIELD_LIMITS.skillName, 'Skill'),
      category: item.category,
      priority: item.priority,
      learningTopics: clampStrArray(item.learningTopics, 12, 160),
      completed: Boolean(item.completed),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'users', uid, 'skillProgress', id), payload);
      saved.push(payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
  return saved;
}

export async function toggleSkillGapCompletion(uid: string, skillId: string, completed: boolean) {
  const path = `users/${uid}/skillProgress/${skillId}`;
  try {
    await updateDoc(doc(db, 'users', uid, 'skillProgress', skillId), {
      completed,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteSkillGapItem(uid: string, skillId: string) {
  const path = `users/${uid}/skillProgress/${skillId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'skillProgress', skillId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveCareerRoadmap(
  uid: string,
  input: Omit<CareerRoadmap, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<CareerRoadmap> {
  const id = sanitizeId(`roadmap_${input.targetRole.toLowerCase()}`);
  const path = `users/${uid}/roadmaps/${id}`;
  const payload = {
    id,
    userId: uid,
    targetRole: input.targetRole,
    overview: clampStr(input.overview, FIELD_LIMITS.overview, 'Personalized career roadmap.'),
    steps: (input.steps || []).slice(0, 20).map((s, idx) => ({
      stepId: sanitizeId(s.stepId || `step_${idx + 1}`),
      phase: clampStr(s.phase, 60, `Phase ${idx + 1}`),
      title: clampStr(s.title, 140, 'Milestone'),
      description: clampStr(s.description, 450, ''),
      skillsCovered: clampStrArray(s.skillsCovered, 10, 60),
      estimatedWeeks: Math.max(1, Math.min(24, Number(s.estimatedWeeks) || 2)),
    })),
    recommendedSkills: clampStrArray(input.recommendedSkills, 30, 80),
    projectSuggestions: (input.projectSuggestions || []).slice(0, 10).map((p) => ({
      title: clampStr(p.title, 140, 'Portfolio Project'),
      difficulty: clampStr(p.difficulty, 40, 'Intermediate'),
      description: clampStr(p.description, 450, ''),
      skillsApplied: clampStrArray(p.skillsApplied, 10, 60),
    })),
    completedStepIds: clampStrArray(input.completedStepIds, 20, 64),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'users', uid, 'roadmaps', id), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateRoadmapCompletedSteps(uid: string, roadmapId: string, completedStepIds: string[]) {
  const path = `users/${uid}/roadmaps/${roadmapId}`;
  try {
    await updateDoc(doc(db, 'users', uid, 'roadmaps', roadmapId), {
      completedStepIds: clampStrArray(completedStepIds, 20, 64),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveInterviewSession(
  uid: string,
  input: Omit<InterviewSession, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'createdAtIso'>
): Promise<InterviewSession> {
  const id = createClientId('int');
  const path = `users/${uid}/interviews/${id}`;
  const payload = {
    id,
    userId: uid,
    targetRole: clampStr(input.targetRole, 100, 'Software Developer'),
    category: input.category,
    question: clampStr(input.question, FIELD_LIMITS.question, 'Describe a technical challenge you solved.'),
    sampleAnswer: clampStr(input.sampleAnswer, FIELD_LIMITS.sampleAnswer, ''),
    userAnswer: clampStr(input.userAnswer, FIELD_LIMITS.userAnswer, ''),
    aiFeedback: clampStr(input.aiFeedback, FIELD_LIMITS.aiFeedback, ''),
    strengths: clampStrArray(input.strengths, 10, 260),
    improvements: clampStrArray(input.improvements, 10, 260),
    score: Math.max(0, Math.min(100, Math.round(input.score || 0))),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'users', uid, 'interviews', id), payload);
    return { ...payload, createdAtIso: new Date().toISOString() };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateInterviewEvaluation(
  uid: string,
  interviewId: string,
  evaluation: {
    userAnswer: string;
    aiFeedback: string;
    strengths: string[];
    improvements: string[];
    score: number;
  }
) {
  const path = `users/${uid}/interviews/${interviewId}`;
  try {
    await updateDoc(doc(db, 'users', uid, 'interviews', interviewId), {
      userAnswer: clampStr(evaluation.userAnswer, FIELD_LIMITS.userAnswer, ''),
      aiFeedback: clampStr(evaluation.aiFeedback, FIELD_LIMITS.aiFeedback, ''),
      strengths: clampStrArray(evaluation.strengths, 10, 260),
      improvements: clampStrArray(evaluation.improvements, 10, 260),
      score: Math.max(0, Math.min(100, Math.round(evaluation.score))),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteInterviewSession(uid: string, interviewId: string) {
  const path = `users/${uid}/interviews/${interviewId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'interviews', interviewId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function deleteAllUserSavedData(uid: string): Promise<void> {
  const subcollections = ['resumes', 'jobMatches', 'skillProgress', 'roadmaps', 'interviews'] as const;
  for (const sub of subcollections) {
    const path = `users/${uid}/${sub}`;
    try {
      const q = query(collection(db, 'users', uid, sub), where('userId', '==', uid));
      const snap = await getDocs(q);
      if (snap.empty) continue;
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}

export function subscribeUserCollection<T extends { createdAt?: unknown; createdAtIso?: string }>(
  uid: string,
  subcollection: 'resumes' | 'jobMatches' | 'skillProgress' | 'roadmaps' | 'interviews',
  onData: (items: T[]) => void
): () => void {
  const path = `users/${uid}/${subcollection}`;
  const q = query(
    collection(db, 'users', uid, subcollection),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => {
        const data = d.data() as T;
        return {
          ...data,
          createdAtIso: toIsoDate(data.createdAt),
        };
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
