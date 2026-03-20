import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { InterviewSession } from '../../models/interfaces';

@Component({
  selector: 'app-session-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-white mb-2">Session History</h1>
      <p class="text-slate-400 mb-8">Review your past interview sessions and feedback.</p>

      @if (loading) {
        <div class="text-center py-16 text-slate-500">
          <p class="text-lg">Loading sessions...</p>
        </div>
      } @else if (sessions.length === 0) {
        <div class="text-center py-16 text-slate-500">
          <p class="text-lg">No sessions yet.</p>
          <a routerLink="/interview/setup" class="text-indigo-400 hover:text-indigo-300 mt-2 inline-block">Start your first interview →</a>
        </div>
      } @else {
        <div class="space-y-3">
          @for (session of sessions; track session.id) {
            <div class="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-500 transition-colors">
              <div class="flex items-center justify-between">
                <a [routerLink]="['/history', session.id]" class="flex items-center gap-4 flex-1 min-w-0">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                       [class]="session.type === 'technical' ? 'bg-indigo-600/20' : 'bg-green-600/20'">
                    @if (session.type === 'technical') {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                  </div>
                  <div class="min-w-0">
                    <div class="text-white font-medium">{{ session.topic }}</div>
                    <div class="text-slate-500 text-sm">
                      {{ session.type | titlecase }} · {{ session.difficulty | titlecase }} · {{ session.created_at | date:'medium' }}
                    </div>
                  </div>
                </a>
                <div class="flex items-center gap-3 shrink-0 ml-4">
                  @if (session.timer_duration > 0) {
                    <span class="text-slate-500 text-sm">{{ session.timer_duration / 60 }}min</span>
                  }
                  <span class="text-xs px-2.5 py-1 rounded-full font-medium"
                        [class]="session.is_completed ? 'bg-green-900/50 text-green-400' : 'bg-amber-900/50 text-amber-400'">
                    {{ session.is_completed ? 'Completed' : 'In Progress' }}
                  </span>
                  <button (click)="deleteSession($event, session.id)"
                          class="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/30 transition-colors"
                          title="Delete session">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <a [routerLink]="['/history', session.id]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class SessionHistoryComponent implements OnInit {
  sessions: InterviewSession[] = [];
  loading = true;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    this.api.getSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteSession(event: Event, sessionId: number): void {
    event.stopPropagation();
    event.preventDefault();
    if (!confirm('Are you sure you want to delete this session? This cannot be undone.')) {
      return;
    }
    this.api.deleteSession(sessionId).subscribe({
      next: () => {
        this.sessions = this.sessions.filter((s) => s.id !== sessionId);
        this.cdr.detectChanges();
      },
    });
  }
}
