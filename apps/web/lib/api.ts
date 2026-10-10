import {
  ProfileInput, PlanResult, RelocationInfo, ProgressResponse,
  SpecSummary, ExamPaper, SubmitInput, SectionResult, Language, LessonData,
  ReviewItem, TeachBackSession, SkillNode, TimelineEvent, EligibilityScore,
  CountryData, ChecklistItem, SimulatorScenario, AdminStats
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
  getSkillMap: (): Promise<SkillNode[]> => {
    return new Promise(resolve => setTimeout(() => resolve([
      { id: 'n1', title: 'Greetings & Introductions', description: 'Essential phrases for meeting locals and basic small talk.', status: 'mastered', mastery_percentage: 100, dependencies: [] },
      { id: 'n2', title: 'Housing & Renting', description: 'Understanding contracts, flat viewings, and utilities.', status: 'learning', mastery_percentage: 60, dependencies: ['n1'] },
      { id: 'n3', title: 'Bureaucracy & Visas', description: 'Navigating the Ausländerbehörde and official forms.', status: 'needs_practice', mastery_percentage: 30, dependencies: ['n1'] },
      { id: 'n4', title: 'Healthcare & Medicine', description: 'Doctor appointments, symptoms, and insurance terms.', status: 'locked', mastery_percentage: 0, dependencies: ['n2', 'n3'] },
      { id: 'n5', title: 'Workplace Communication', description: 'Professional emails, meetings, and interviews.', status: 'locked', mastery_percentage: 0, dependencies: ['n3'] }
    ]), 600));
  },
  
  // Phase 3 Mocks
  getTimeline: (): Promise<TimelineEvent[]> => {
    return new Promise(resolve => setTimeout(() => resolve([
      { id: 't1', title: 'Start A1 Course', date: '2024-01-15', type: 'language', status: 'completed' },
      { id: 't2', title: 'Book Goethe B1 Exam', date: '2024-05-01', type: 'admin', status: 'current' },
      { id: 't3', title: 'Pass B1 Exam', date: '2024-06-15', type: 'language', status: 'upcoming' },
      { id: 't4', title: 'Submit Visa Application', date: '2024-07-01', type: 'relocation', status: 'upcoming' },
      { id: 't5', title: 'Move to Germany', date: '2024-09-01', type: 'relocation', status: 'upcoming' }
    ]), 400));
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  checkEligibility: (answers: Record<string, string>): Promise<EligibilityScore> => {
    return new Promise(resolve => setTimeout(() => resolve({
      route_name: 'EU Blue Card (Germany)',
      score_percentage: answers.degree === 'yes' ? 85 : 30,
      eligible: answers.degree === 'yes' && answers.salary === 'high',
      missing_requirements: answers.degree === 'no' ? ['Recognized University Degree'] : (answers.salary !== 'high' ? ['Minimum Salary Threshold'] : [])
    }), 800));
  },
  getCountryComparison: (): Promise<CountryData[]> => {
    return new Promise(resolve => setTimeout(() => resolve([
      { id: 'c1', country: 'Germany', flag: '🇩🇪', avg_rent_1bed: 950, avg_salary_tech: 65000, visa_processing_weeks: 12, language_requirement: 'B1 (often preferred)', healthcare_quality: 'Excellent', cost_of_living_index: 73 },
      { id: 'c2', country: 'Austria', flag: '🇦🇹', avg_rent_1bed: 850, avg_salary_tech: 58000, visa_processing_weeks: 8, language_requirement: 'A2-B1', healthcare_quality: 'Excellent', cost_of_living_index: 75 },
      { id: 'c3', country: 'Switzerland', flag: '🇨🇭', avg_rent_1bed: 1800, avg_salary_tech: 110000, visa_processing_weeks: 16, language_requirement: 'B2', healthcare_quality: 'World Class', cost_of_living_index: 122 }
    ]), 400));
  },
  getArrivalChecklist: (): Promise<ChecklistItem[]> => {
    return new Promise(resolve => setTimeout(() => resolve([
      { id: 'ch1', category: '24h', title: 'Buy a local SIM card', description: 'Needed for all registrations. Go to Aldi or Vodafone.', completed: true },
      { id: 'ch2', category: '24h', title: 'Find temporary housing', description: 'Check into your Airbnb or hotel.', completed: true },
      { id: 'ch3', category: 'week', title: 'Anmeldung (City Registration)', description: 'Register your address at the local Bürgeramt.', completed: false },
      { id: 'ch4', category: 'week', title: 'Open a Bank Account', description: 'N26 or Sparkasse. Required to receive your salary.', completed: false },
      { id: 'ch5', category: 'month', title: 'Get Health Insurance', description: 'TK or AOK. Give the number to your employer.', completed: false },
      { id: 'ch6', category: 'month', title: 'Apply for Residence Permit', description: 'Book an appointment at the Ausländerbehörde.', completed: false },
    ]), 400));
  },
  getSimulators: (): Promise<SimulatorScenario[]> => {
    return new Promise(resolve => setTimeout(() => resolve([
      { id: 'sim1', title: 'The Bürgeramt Registration', description: 'Roleplay your address registration. The clerk speaks fast.', difficulty: 'medium' },
      { id: 'sim2', title: 'Opening a Bank Account', description: 'Answer questions about your income and passport.', difficulty: 'easy' },
      { id: 'sim3', title: 'Apartment Viewing', description: 'Ask the landlord about the deposit (Kaution) and utilities (Nebenkosten).', difficulty: 'hard' },
    ]), 400));
  },
  startSimulator: (id: string): Promise<{ session_id: string, initial_message: string }> => {
    return new Promise(resolve => setTimeout(() => resolve({
      session_id: `sim_session_${id}`,
      initial_message: id === 'sim1' 
        ? "Guten Tag! Haben Sie alle Ihre Dokumente für die Anmeldung dabei?"
        : "Hallo, wie kann ich Ihnen heute helfen?"
    }), 500));
  },
  
  // Phase 4 Mocks
  getAdminStats: (): Promise<AdminStats> => {
    return new Promise(resolve => setTimeout(() => {
      const extraExams = [];
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('onboarding_draft');
        if (stored) {
          try {
            const data = JSON.parse(stored);
            if (data.name) {
              const placed = localStorage.getItem('actual_placed_level') || 'A2';
              extraExams.push({
                id: 'ex_994',
                user_name: data.name,
                paper: `Placement Test (${placed})`,
                confidence: 42,
                issue: 'Needs manual grading for writing task'
              });
            }
          } catch (e) {}
        }
      }
      resolve({
        total_users: extraExams.length ? 12451 : 12450,
        active_learners: extraExams.length ? 3241 : 3240,
        llm_tokens_used: 45000000,
        grading_accuracy: 94.2,
        flagged_exams: [
          ...extraExams,
          { id: 'ex_991', user_name: 'John Doe', paper: 'Goethe B1', confidence: 45, issue: 'Ambiguous writing response' },
          { id: 'ex_992', user_name: 'Anna Schmidt', paper: 'Telc B2', confidence: 60, issue: 'Speech recognition failure' },
          { id: 'ex_993', user_name: 'Carlos Ruiz', paper: 'TestDaF', confidence: 55, issue: 'Audio corrupted' }
        ]
      });
    }, 400));
  }
};
