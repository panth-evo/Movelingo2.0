export type Language = 'de' | 'es' | 'fr' | 'it';
export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type Skill = 'reading' | 'listening' | 'writing' | 'speaking' | 'vocabulary' | 'grammar';

export interface ProfileInput {
  age: number | null;
  nationality: string | null;
  current_country: string | null;
  passport_valid_until: string | null;
  marital_status: string | null;
  dependants: number | null;
  education: {
    highest: string | null;
    field: string | null;
    university: string | null;
    graduation_year: number | null;
    grade: string | null;
  };
  work: {
    profession: string | null;
    years_experience: number | null;
    salary_range: string | null;
    job_offer: boolean;
    sponsor: boolean;
  };
  goal: {
    purpose: 'work' | 'study' | 'settle' | 'family';
    target_country: 'DE' | 'ES' | 'FR' | 'IT';
    target_city?: string | null;
    move_deadline: string;
  };
  finance: {
    savings_eur: number | null;
    monthly_budget_eur: number | null;
    open_to_loans: boolean;
  };
  languages_known: Array<{
    language: string;
    self_level: string;
    certificate?: string | null;
  }>;
  study: {
    hours_per_day: number;
    style: 'visual' | 'audio' | 'reading' | 'practice';
    device: string;
    weakest_skill: string;
  };
}

export interface PlanResult {
  target_country: string;
  language: string;
  recommended_route: string;
  required_level: string;
  current_level: string;
  weeks_to_target: number;
  days_to_deadline: number;
  on_track: boolean;
  weekly_plan: Array<{
    week: number;
    focus: string;
    hours: number;
    skill_focus: string;
  }>;
  budget: {
    currency: 'EUR';
    one_time: Array<{
      label: string;
      amount: number | null;
      source_url?: string | null;
    }>;
    monthly: Array<{
      label: string;
      amount: number | null;
    }>;
    savings_gap: number | null;
  };
  document_checklist: Array<{
    id: string;
    label: string;
    needs_translation: boolean;
    needs_apostille: boolean;
  }>;
  milestones: Array<{
    id: string;
    label: string;
    due_date: string;
  }>;
  risks: string[];
  sources: Array<{
    label: string;
    url: string;
    last_verified: string;
  }>;
  disclaimer: string;
}

export interface ProgressResponse {
  language: Language;
  current_level: Level;
  target_level: Level;
  updated_at: string;
  levels: Array<{
    level: Level;
    status: 'certified' | 'in_progress' | 'locked';
    progress: number;
    skills: {
      reading: { progress: number; certified: boolean };
      listening: { progress: number; certified: boolean };
      writing: { progress: number; certified: boolean };
      speaking: { progress: number; certified: boolean };
      vocabulary: { progress: number; certified: boolean };
      grammar: { progress: number; certified: boolean };
    };
  }>;
}

export interface SpecSummary {
  spec_id: string;
  exam_name: string;
  language: Language;
  cefr: Level;
  derived: boolean;
  verified_on: string | null;
  sections: Array<{
    skill: string;
    duration_min: number;
    parts: number;
  }>;
}

export interface RelocationInfo {
  country: string;
  routes: Array<{
    id: string;
    name: string;
    purpose: string;
    required_language_level: string | null;
    summary: string;
    eligibility: string[];
    fees: Array<{
      label: string;
      amount: number | null;
      currency: string;
      source_url: string | null;
    }>;
    official_url: string | null;
    last_verified: string | null;
    verified: boolean;
  }>;
  checklist: Array<{
    id: string;
    label: string;
    needs_translation: boolean;
    needs_apostille: boolean;
  }>;
  cities: Array<{
    name: string;
    rent_range_eur: string | null;
    note: string;
  }>;
  sources: Array<{
    label: string;
    url: string;
    last_verified: string | null;
  }>;
}

export interface ExamPaper {
  paper_id: string;
  spec_id: string;
  language: Language;
  cefr: Level;
  exam_name: string;
  derived: boolean;
  status: 'generating' | 'ready' | 'failed';
  parts_ready: number;
  parts_total: number;
  created_at: string;
  sections: Array<{
    skill: string;
    duration_min: number;
    instructions: string;
    parts: Array<{
      part_id: string;
      part_no: number;
      title: string;
      task_type: string;
      instructions: string;
      passage: string[];
      audio: {
        lang: string;
        preview_seconds: number;
        segments: Array<{
          segment_id: string;
          play_limit: number;
          script: Array<{
            speaker: string;
            text: string;
            voice_hint: string;
          }>;
        }>;
      } | null;
      items: Array<{
        item_id: string;
        type: 'mcq' | 'true_false' | 'yes_no' | 'matching';
        prompt: string;
        options: Array<{
          key: string;
          text: string;
        }>;
        segment_id?: string;
      }>;
      task: {
        kind: 'writing' | 'speaking';
        prompt: string;
        min_words?: number;
        max_words?: number;
        register?: string;
        prep_seconds?: number;
        speaking_seconds?: number;
        bullet_points?: string[];
      } | null;
    }>;
  }>;
}

export interface SubmitInput {
  skill: string;
  answers: Record<string, string>;
  texts: Record<string, string>;
  speaking: Record<string, {
    transcript: string;
    duration_sec: number;
    stt_confidence?: number;
  }>;
  time_spent_sec: number;
}

export interface SectionResult {
  paper_id: string;
  skill: string;
  level: Level;
  raw: number;
  max: number;
  ratio: number;
  scaled_100: number;
  passed: boolean;
  pass_ratio: number;
  per_part: Array<{
    part_id: string;
    raw: number;
    max: number;
  }>;
  criteria: Array<{
    part_id: string;
    criterion: string;
    band: string;
    points: number;
    max: number;
    feedback: string;
  }>;
  summary: string;
  ai_estimated: boolean;
  placed_level?: string;
  progress: ProgressResponse;
}

export interface LessonData {
  lesson_id: string;
  topic: string;
  cefr_level: string;
  original_text?: string;
  summary: string;
  vocabulary: Array<{
    word: string;
    translation: string;
    context: string;
  }>;
  grammar: Array<{
    rule: string;
    explanation: string;
    examples: string[];
  }>;
}

export interface ReviewItem {
  item_id: string;
  type: 'flashcard' | 'cloze' | 'dictation';
  prompt: string;
  answer: string;
  context?: string;
}

export interface TeachBackSession {
  session_id: string;
  concept: string;
  instructions: string;
}

export interface SkillNode {
  id: string;
  title: string;
  description: string;
  status: 'mastered' | 'learning' | 'needs_practice' | 'locked';
  mastery_percentage: number;
  dependencies: string[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  type: 'language' | 'relocation' | 'admin';
  status: 'completed' | 'current' | 'upcoming';
}

export interface EligibilityScore {
  route_name: string;
  score_percentage: number;
  eligible: boolean;
  missing_requirements: string[];
}
