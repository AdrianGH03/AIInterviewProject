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

export interface WSMessage {
  type: 'message' | 'end_session';
  content?: string;
}

export interface WSServerMessage {
  type: 'ai_message' | 'feedback' | 'session_ended' | 'error' | 'connected';
  content?: string;
  detail?: string;
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
