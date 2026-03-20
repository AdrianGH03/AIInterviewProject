export interface QuestionBank {
  id: number;
  topic: string;
  name: string;
  description: string | null;
  created_at: string;
  questions: Question[];
}

export interface QuestionBankCreate {
  topic: string;
  name: string;
  description?: string | null;
}

export interface Question {
  id: number;
  question_text: string;
  question_type: 'coding' | 'behavioral' | 'system_design';
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  time_limit: number | null;
  questionbank_id: number | null;
  created_at: string;
}

export interface QuestionCreate {
  question_text: string;
  question_type: string;
  difficulty: string;
  topic: string;
  time_limit?: number | null;
  questionbank_id?: number | null;
}

export interface InterviewSession {
  id: number;
  type: 'technical' | 'behavioral';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  is_completed: boolean;
  time_started: string | null;
  time_ended: string | null;
  question_bank_id: number | null;
  timer_duration: number;
  created_at: string;
}

export interface InterviewSessionCreate {
  type: string;
  topic: string;
  difficulty: string;
  is_completed?: boolean;
  question_bank_id?: number | null;
  timer_duration?: number;
}

export interface Feedback {
  id: number;
  feedback_text: string;
  interview_session_id: number;
  question_id: number | null;
  response_id: number | null;
  audio_feedback: string | null;
  created_at: string;
}

export interface InterviewResponse {
  id: number;
  type_of_response: string;
  question_id: number | null;
  feedback_id: number | null;
  interview_session_id: number;
  response_text: string | null;
  audio_response: string | null;
  response_order: number;
  created_at: string;
}

export interface WSServerMessage {
  type: 'ai_message' | 'feedback' | 'session_ended' | 'error' | 'connected' | 'history';
  content?: string;
  detail?: string;
  messages?: HistoryMessage[];
}

export interface HistoryMessage {
  type_of_response: string;
  response_text: string;
  response_order: number;
}

export interface WSMessage {
  type: 'message' | 'end_session';
  content?: string;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface CodeRunRequest {
  language: string;
  code: string;
  stdin?: string;
}

export interface CodeRunResponse {
  stdout: string;
  stderr: string;
  exit_code: number;
  timed_out: boolean;
}

// ── Job Description Parsing ───────────────────────────────

export interface GeneratedQuestion {
  text: string;
  type: string;
  difficulty: string;
}

export interface JobCategory {
  name: string;
  questions: GeneratedQuestion[];
}

export interface JobParseResponse {
  categories: JobCategory[];
  company_name?: string;
  raw_text?: string;
}

// ── Review / Spaced Repetition ────────────────────────────

export interface ReviewCard {
  id: number;
  question_id: number;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_at: string;
  last_reviewed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface ReviewCardWithQuestion extends ReviewCard {
  question_text: string;
  question_type: string;
  difficulty: string;
  topic: string;
}

export interface ReviewStats {
  total_cards: number;
  due_today: number;
  reviewed_today: number;
}

export interface JobBankCreateRequest {
  company_name: string;
  categories: {
    name: string;
    questions: GeneratedQuestion[];
  }[];
}
