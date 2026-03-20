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
    <div class="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <h1 class="text-5xl font-bold text-white mb-4 tracking-tight gradient-text">Interview Preparation</h1>
        <p class="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Practice technical and behavioral interviews with an AI interviewer.
          Get real-time feedback and improve your skills.
        </p>
        <a routerLink="/interview/setup"
           class="inline-block mt-8 btn-gradient font-medium py-3 px-8 rounded-lg text-base">
          Start an Interview
        </a>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div class="glass-card p-6 card-hover animate-slide-up delay-1">
          <div class="text-4xl font-bold text-white">{{ totalSessions }}</div>
          <div class="text-zinc-500 mt-1 text-sm">Total Sessions</div>
        </div>
        <div class="glass-card p-6 card-hover animate-slide-up delay-2">
          <div class="text-4xl font-bold text-white">{{ completedSessions }}</div>
          <div class="text-zinc-500 mt-1 text-sm">Completed</div>
        </div>
        <div class="glass-card p-6 card-hover animate-slide-up delay-3">
          <div class="text-4xl font-bold text-white">{{ questionBanks.length }}</div>
          <div class="text-zinc-500 mt-1 text-sm">Question Banks</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div class="glass-card p-8 card-hover animate-slide-up delay-2">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-linear-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-white">Technical Interview</h2>
          </div>
          <p class="text-zinc-400 mb-6 text-sm leading-relaxed">
            Practice coding questions, system design, and technical concepts with AI-powered feedback.
          </p>
          <a routerLink="/interview/setup" [queryParams]="{type: 'technical'}"
             class="text-violet-400 hover:text-violet-300 font-medium text-sm transition-all duration-200">
            Start Technical Interview →
          </a>
        </div>

        <div class="glass-card p-8 card-hover animate-slide-up delay-3">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-linear-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-white">Behavioral Interview</h2>
          </div>
          <p class="text-zinc-400 mb-6 text-sm leading-relaxed">
            Practice STAR method answers, leadership scenarios, and communication skills.
          </p>
          <a routerLink="/interview/setup" [queryParams]="{type: 'behavioral'}"
             class="text-violet-400 hover:text-violet-300 font-medium text-sm transition-all duration-200">
            Start Behavioral Interview →
          </a>
        </div>
      </div>

      <!-- In Progress Sessions -->
      @if (inProgressSessions.length > 0) {
        <div class="glass-card mb-16 overflow-hidden animate-slide-up delay-4">
          <div class="p-5 border-b border-zinc-800/50">
            <h2 class="text-base font-semibold text-white">Resume In-Progress Sessions</h2>
          </div>
          <div class="divide-y divide-zinc-800/50">
            @for (session of inProgressSessions; track session.id) {
              <a [routerLink]="['/interview', session.id]"
                 class="flex items-center justify-between p-4 hover:bg-white/3 transition-colors duration-200">
                <div class="flex items-center gap-4">
                  <div class="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50 animate-pulse"></div>
                  <div>
                    <div class="text-zinc-200 font-medium text-sm">{{ session.topic }} — {{ session.type | titlecase }}</div>
                    <div class="text-zinc-600 text-xs mt-0.5">{{ session.difficulty | titlecase }} · {{ session.created_at | date:'medium' }}</div>
                  </div>
                </div>
                <span class="text-xs px-3 py-1 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Resume →
                </span>
              </a>
            }
          </div>
        </div>
      }

      <!-- Recent Sessions -->
      <div class="glass-card animate-slide-up delay-4 overflow-hidden">
        <div class="p-5 border-b border-zinc-800/50 flex items-center justify-between">
          <h2 class="text-base font-semibold text-white">Recent Sessions</h2>
          <a routerLink="/history" class="text-zinc-500 hover:text-violet-400 text-sm font-medium transition-colors duration-200">
            View All →
          </a>
        </div>
        @if (recentSessions.length === 0) {
          <div class="p-12 text-center text-zinc-600">
            No interview sessions yet. Start your first interview!
          </div>
        } @else {
          <div class="divide-y divide-zinc-800/50">
            @for (session of recentSessions; track session.id) {
              <a [routerLink]="session.is_completed ? ['/history', session.id] : ['/interview', session.id]"
                 class="flex items-center justify-between p-4 hover:bg-white/3 transition-colors duration-200">
                <div class="flex items-center gap-4">
                  <div class="w-2 h-2 rounded-full"
                       [class]="session.is_completed ? 'bg-violet-500 shadow-sm shadow-violet-500/50' : 'bg-zinc-600'"></div>
                  <div>
                    <div class="text-zinc-200 font-medium text-sm">{{ session.topic }} — {{ session.type | titlecase }}</div>
                    <div class="text-zinc-600 text-xs mt-0.5">{{ session.difficulty | titlecase }} · {{ session.created_at | date:'medium' }}</div>
                  </div>
                </div>
                <span class="text-xs px-2.5 py-0.5 rounded-full font-medium"
                      [class]="session.is_completed ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-zinc-800 text-zinc-500'">
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
  inProgressSessions: InterviewSession[] = [];
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
        this.inProgressSessions = sessions.filter((s) => !s.is_completed);
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
