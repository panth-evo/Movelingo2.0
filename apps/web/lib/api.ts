import {
  ProfileInput, PlanResult, RelocationInfo, ProgressResponse,
  SpecSummary, ExamPaper, SubmitInput, SectionResult, Language, LessonData,
  ReviewItem, TeachBackSession
} from './types';

const getUserId = () => typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;

const fetchApi = async (path: string, options: RequestInit = {}) => {
  const isFixtures = process.env.NEXT_PUBLIC_USE_FIXTURES === '1';
  
  if (isFixtures) {
    return fetchFixture(path, options);
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  const userId = getUserId();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(userId ? { 'X-User-Id': userId } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const data = await response.json();
      if (data.error && data.error.message) {
        errorMsg = data.error.message;
      }
    } catch {}
    throw new Error(errorMsg);
  }
  
  if (response.status === 204) return null;
  return response.json();
};

const fetchFixture = async (path: string, options: RequestInit) => {
  const method = options.method || 'GET';
  
  // Fake delay to simulate network
  await new Promise(r => setTimeout(r, 400));
  
  try {
    if (path === '/api/users' && method === 'POST') return { user_id: 'user_123' };
    if (path.startsWith('/api/users/') && method === 'PUT') return { ok: true };
    if (path === '/api/plan/generate' && method === 'POST') return (await import('../fixtures/plan_de.json')).default;
    if (path === '/api/plan' && method === 'GET') return (await import('../fixtures/plan_de.json')).default;
    if (path.startsWith('/api/relocation/')) return (await import('../fixtures/relocation_de.json')).default;
    if (path.startsWith('/api/progress')) return (await import('../fixtures/progress_de.json')).default;
    if (path === '/api/placement/result' && method === 'POST') return (await import('../fixtures/progress_de.json')).default;
    if (path.startsWith('/api/exams/specs')) return (await import('../fixtures/specs_de.json')).default;
    if (path === '/api/exams/generate' && method === 'POST') return { paper_id: 'goethe_b1_mock_123', status: 'ready' };
    if (path.startsWith('/api/exams/papers/') && method === 'GET') return (await import('../fixtures/exam_paper_goethe_b1.json')).default;
    if (path.includes('/submit') && method === 'POST') return (await import('../fixtures/section_result_reading.json')).default;
    if (path.startsWith('/api/exams/results')) return [(await import('../fixtures/section_result_reading.json')).default];
    
    return {};
  } catch {
    console.error(`Fixture not found for ${path}`);
    throw new Error(`Fixture not found for ${path}`);
  }
};

export const api = {
  createUser: () => fetchApi('/api/users', { method: 'POST' }),
  updateProfile: (userId: string, data: ProfileInput) => fetchApi(`/api/users/${userId}/profile`, { method: 'PUT', body: JSON.stringify(data) }),
  generatePlan: (language: Language): Promise<PlanResult> => fetchApi('/api/plan/generate', { method: 'POST', body: JSON.stringify({ language }) }),
  getPlan: (): Promise<PlanResult> => fetchApi('/api/plan'),
  getRelocationInfo: (country: string): Promise<RelocationInfo> => fetchApi(`/api/relocation/${country}`),
  getProgress: (language: Language): Promise<ProgressResponse> => fetchApi(`/api/progress?language=${language}`),
  placeResult: (language: Language, placed_level: string): Promise<ProgressResponse> => fetchApi('/api/placement/result', { method: 'POST', body: JSON.stringify({ language, placed_level }) }),
  getSpecs: (language: Language): Promise<SpecSummary[]> => fetchApi(`/api/exams/specs?language=${language}`),
  generateExam: (data: { language: Language, spec_id: string, scope: string, skill?: string, part_no?: number, topic_seed?: string }) => fetchApi('/api/exams/generate', { method: 'POST', body: JSON.stringify(data) }),
  getPaper: (paperId: string): Promise<ExamPaper> => fetchApi(`/api/exams/papers/${paperId}`),
  submitExam: (paperId: string, data: SubmitInput): Promise<SectionResult> => fetchApi(`/api/exams/papers/${paperId}/submit`, { method: 'POST', body: JSON.stringify(data) }),
  getResults: (language: Language): Promise<SectionResult[]> => fetchApi(`/api/exams/results?language=${language}`),
  partnerTurn: (data: { paper_id: string, part_id: string, history: Array<{role: string, text: string}> }) => fetchApi('/api/speech/partner-turn', { method: 'POST', body: JSON.stringify(data) }),
  
  // Phase 2 Mocks
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  uploadCapture: (data: FormData): Promise<{ lesson_id: string }> => {
    return new Promise(resolve => setTimeout(() => resolve({ lesson_id: 'lesson_mock_123' }), 2000));
  },
  getLesson: (id: string): Promise<LessonData> => {
    return new Promise(resolve => setTimeout(() => resolve({
      lesson_id: id,
      topic: 'Rental Contract (Mietvertrag)',
      cefr_level: 'B1',
      original_text: 'Der Mieter zahlt eine Kaution in Höhe von 3 Monatskaltmieten vor der Übergabe der Wohnung.',
      summary: 'Understanding standard clauses and financial obligations in a German rental agreement.',
      vocabulary: [
        { word: 'die Kaution', translation: 'security deposit', context: 'zahlt eine Kaution' },
        { word: 'die Kaltmiete', translation: 'basic rent (excluding heating/utilities)', context: '3 Monatskaltmieten' },
        { word: 'die Übergabe', translation: 'handover / transfer', context: 'vor der Übergabe der Wohnung' }
      ],
      grammar: [
        { rule: 'in Höhe von + Dative', explanation: 'Used in formal contexts to specify an amount of money or measurement.', examples: ['Eine Kaution in Höhe von 1500 Euro.'] },
        { rule: 'vor + Dative', explanation: 'Preposition of time meaning "before". Requires the dative case.', examples: ['Vor der Übergabe (die -> der).'] }
      ]
    }), 500));
  },
  getReviewQueue: (): Promise<ReviewItem[]> => {
    return new Promise(resolve => setTimeout(() => resolve([
      { item_id: 'r1', type: 'flashcard', prompt: 'die Kaution', answer: 'security deposit', context: 'zahlt eine Kaution' },
      { item_id: 'r2', type: 'cloze', prompt: 'Der Mieter zahlt eine Kaution ___ Höhe von 3 Monatsmieten.', answer: 'in', context: 'in Höhe von + Dative' },
      { item_id: 'r3', type: 'dictation', prompt: 'Die Kaltmiete beträgt 800 Euro.', answer: 'Die Kaltmiete beträgt 800 Euro.', context: 'Type what you hear' }
    ]), 600));
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  submitReview: (itemId: string, grade: number): Promise<{ ok: boolean }> => {
    return new Promise(resolve => setTimeout(() => resolve({ ok: true }), 200));
  },
  startTeachBack: (conceptId: string): Promise<TeachBackSession> => {
    return new Promise(resolve => setTimeout(() => resolve({
      session_id: 'tb_123',
      concept: conceptId.replace(/_/g, ' '),
      instructions: `Explain to the AI how to use this concept. Give a real-world example related to relocating or renting.`
    }), 500));
  },
};
