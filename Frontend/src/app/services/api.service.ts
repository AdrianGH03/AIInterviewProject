import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  InterviewSession,
  InterviewSessionCreate,
  QuestionBank,
  QuestionBankCreate,
  Question,
  QuestionCreate,
  Feedback,
  InterviewResponse,
  CodeRunRequest,
  CodeRunResponse,
} from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Question Banks ──────────────────────────────────────

  getQuestionBanks(): Observable<QuestionBank[]> {
    return this.http.get<QuestionBank[]>(`${this.baseUrl}/question-banks/`);
  }

  getQuestionBank(id: number): Observable<QuestionBank> {
    return this.http.get<QuestionBank>(`${this.baseUrl}/question-banks/${id}`);
  }

  createQuestionBank(data: QuestionBankCreate): Observable<QuestionBank> {
    return this.http.post<QuestionBank>(`${this.baseUrl}/question-banks/`, data);
  }

  updateQuestionBank(id: number, data: QuestionBankCreate): Observable<QuestionBank> {
    return this.http.put<QuestionBank>(`${this.baseUrl}/question-banks/${id}`, data);
  }

  deleteQuestionBank(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/question-banks/${id}`);
  }

  // ── Questions ───────────────────────────────────────────

  getQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.baseUrl}/questions/`);
  }

  getQuestionsByBank(bankId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.baseUrl}/questions/bank/${bankId}`);
  }

  getQuestion(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.baseUrl}/questions/${id}`);
  }

  createQuestion(data: QuestionCreate): Observable<Question> {
    return this.http.post<Question>(`${this.baseUrl}/questions/`, data);
  }

  updateQuestion(id: number, data: QuestionCreate): Observable<Question> {
    return this.http.put<Question>(`${this.baseUrl}/questions/${id}`, data);
  }

  deleteQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/questions/${id}`);
  }

  // ── Interview Sessions ──────────────────────────────────

  getSessions(): Observable<InterviewSession[]> {
    return this.http.get<InterviewSession[]>(`${this.baseUrl}/sessions/`);
  }

  getSession(id: number): Observable<InterviewSession> {
    return this.http.get<InterviewSession>(`${this.baseUrl}/sessions/${id}`);
  }

  createSession(data: InterviewSessionCreate): Observable<InterviewSession> {
    return this.http.post<InterviewSession>(`${this.baseUrl}/sessions/`, data);
  }

  completeSession(id: number): Observable<InterviewSession> {
    return this.http.patch<InterviewSession>(
      `${this.baseUrl}/sessions/${id}/complete`,
      {}
    );
  }

  deleteSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sessions/${id}`);
  }

  // ── Responses ───────────────────────────────────────────

  getResponsesBySession(sessionId: number): Observable<InterviewResponse[]> {
    return this.http.get<InterviewResponse[]>(
      `${this.baseUrl}/responses/session/${sessionId}`
    );
  }

  // ── Feedback ────────────────────────────────────────────

  getFeedbackBySession(sessionId: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(
      `${this.baseUrl}/feedback/session/${sessionId}`
    );
  }

  // ── Speech ──────────────────────────────────────────────

  textToSpeech(text: string): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/speech/tts`, { text }, {
      responseType: 'blob',
    });
  }

  speechToText(audioBlob: Blob): Observable<{ text: string }> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    return this.http.post<{ text: string }>(
      `${this.baseUrl}/speech/stt`,
      formData
    );
  }

  // ── Code Sandbox ────────────────────────────────────────

  runCode(data: CodeRunRequest): Observable<CodeRunResponse> {
    return this.http.post<CodeRunResponse>(`${this.baseUrl}/sandbox/run`, data);
  }
}
