import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { InterviewSession, QuestionBank } from '../../models/interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-white mb-4">PrepPilot Interview Preparation</h1>
        <p class="text-slate-400 text-lg max-w-2xl mx-auto">
          Practice technical and behavioral interviews with an AI interviewer.
          Get real-time feedback and improve your skills.
        </p>
        <a routerLink="/interview/setup"
           class="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-lg">
          Start an Interview
        </a>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div class="text-3xl font-bold text-indigo-400">{{ totalSessions }}</div>
          <div class="text-slate-400 mt-1">Total Sessions</div>
        </div>
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div class="text-3xl font-bold text-green-400">{{ completedSessions }}</div>
          <div class="text-slate-400 mt-1">Completed</div>
        </div>
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div class="text-3xl font-bold text-amber-400">{{ questionBanks.length }}</div>
          <div class="text-slate-400 mt-1">Question Banks</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <!-- Technical Interview Card -->
        <div class="bg-slate-800 rounded-xl p-8 border border-slate-700 hover:border-indigo-500 transition-colors">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-white">Technical Interview</h2>
          </div>
          <p class="text-slate-400 mb-6">
            Practice coding questions, system design, and technical concepts with AI-powered feedback.
          </p>
          <a routerLink="/interview/setup" [queryParams]="{type: 'technical'}"
             class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Start Technical Interview →
          </a>
        </div>

        <!-- Behavioral Interview Card -->
        <div class="bg-slate-800 rounded-xl p-8 border border-slate-700 hover:border-green-500 transition-colors">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-white">Behavioral Interview</h2>
          </div>
          <p class="text-slate-400 mb-6">
            Practice STAR method answers, leadership scenarios, and communication skills.
          </p>
          <a routerLink="/interview/setup" [queryParams]="{type: 'behavioral'}"
             class="text-green-400 hover:text-green-300 font-medium transition-colors">
            Start Behavioral Interview →
          </a>
        </div>
      </div>

      <!-- Recent Sessions -->
      <div class="bg-slate-800 rounded-xl border border-slate-700">
        <div class="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-white">Recent Sessions</h2>
          <a routerLink="/history" class="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
            View All →
          </a>
        </div>
        @if (recentSessions.length === 0) {
          <div class="p-12 text-center text-slate-500">
            No interview sessions yet. Start your first interview!
          </div>
        } @else {
          <div class="divide-y divide-slate-700">
            @for (session of recentSessions; track session.id) {
              <a [routerLink]="['/history', session.id]"
                 class="flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors">
                <div class="flex items-center gap-4">
                  <div class="w-2 h-2 rounded-full"
                       [class]="session.is_completed ? 'bg-green-400' : 'bg-amber-400'"></div>
                  <div>
                    <div class="text-white font-medium">{{ session.topic }} - {{ session.type | titlecase }}</div>
                    <div class="text-slate-500 text-sm">{{ session.difficulty | titlecase }} · {{ session.created_at | date:'medium' }}</div>
                  </div>
                </div>
                <span class="text-xs px-2 py-1 rounded-full"
                      [class]="session.is_completed ? 'bg-green-900/50 text-green-400' : 'bg-amber-900/50 text-amber-400'">
                  {{ session.is_completed ? 'Completed' : 'In Progress' }}
                </span>
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  recentSessions: InterviewSession[] = [];
  questionBanks: QuestionBank[] = [];
  totalSessions = 0;
  completedSessions = 0;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.api.getSessions().subscribe({
      next: (sessions) => {
        this.totalSessions = sessions.length;
        this.completedSessions = sessions.filter((s) => s.is_completed).length;
        this.recentSessions = sessions.slice(0, 5);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load sessions:', err),
    });

    this.api.getQuestionBanks().subscribe({
      next: (banks) => {
        this.questionBanks = banks;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load question banks:', err),
    });
  }
}
