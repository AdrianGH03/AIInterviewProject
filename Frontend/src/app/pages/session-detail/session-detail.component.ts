import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { InterviewSession, InterviewResponse, Feedback } from '../../models/interfaces';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      <a routerLink="/history" class="text-zinc-500 hover:text-violet-400 text-sm mb-6 inline-block transition-colors duration-200">
        ← Back to History
      </a>

      @if (session) {
        <!-- Session Info -->
        <div class="glass-card p-6 mb-8 animate-slide-up">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl font-bold text-white tracking-tight">
              {{ session.topic }} - {{ session.type | titlecase }} Interview
            </h1>
            <span class="text-[10px] px-2.5 py-1 rounded-full font-medium"
                  [class]="session.is_completed ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-zinc-800 text-zinc-500'">
              {{ session.is_completed ? 'Completed' : 'In Progress' }}
            </span>
            @if (!session.is_completed) {
              <a [routerLink]="['/interview', session.id]"
                 class="text-xs px-3 py-1 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all duration-200">
                Resume Interview →
              </a>
            }
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div class="text-zinc-600 text-xs">Difficulty</div>
              <div class="text-white font-medium">{{ session.difficulty | titlecase }}</div>
            </div>
            <div>
              <div class="text-zinc-600 text-xs">Started</div>
              <div class="text-white font-medium">{{ session.time_started | date:'medium' }}</div>
            </div>
            <div>
              <div class="text-zinc-600 text-xs">Ended</div>
              <div class="text-white font-medium">
                {{ session.time_ended ? (session.time_ended | date:'medium') : 'N/A' }}
              </div>
            </div>
            <div>
              <div class="text-zinc-600 text-xs">Timer</div>
              <div class="text-white font-medium">
                {{ session.timer_duration > 0 ? (session.timer_duration / 60) + ' min' : 'None' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Transcript -->
        <h2 class="text-lg font-semibold text-white mb-4">Conversation Transcript</h2>
        @if (responses.length === 0) {
          <div class="text-zinc-600 text-center py-8 text-sm">No transcript data available.</div>
        } @else {
          <div class="space-y-3 mb-8">
            @for (resp of responses; track resp.id) {
              <div class="flex" [class]="resp.type_of_response === 'answer' ? 'justify-end' : 'justify-start'">
                <div class="max-w-[70%] rounded-2xl p-4"
                     [class]="resp.type_of_response === 'answer'
                       ? 'bg-linear-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/10'
                       : 'bg-zinc-900/80 border border-zinc-800/50 text-zinc-200'">
                  <div class="text-[10px] mb-1 font-medium"
                       [class]="resp.type_of_response === 'answer' ? 'text-violet-200/60' : 'text-zinc-500'">
                    {{ resp.type_of_response === 'answer' ? 'You' : 'AI Interviewer' }}
                  </div>
                  <div class="whitespace-pre-wrap text-sm">{{ resp.response_text }}</div>
                  <div class="text-[10px] mt-2" [class]="resp.type_of_response === 'answer' ? 'text-violet-200/40' : 'text-zinc-600'">{{ resp.created_at | date:'shortTime' }}</div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Feedback Section -->
        @if (feedbackItems.length > 0) {
          <h2 class="text-lg font-semibold text-white mb-4">Feedback</h2>
          <div class="space-y-4">
            @for (fb of feedbackItems; track fb.id) {
              <div class="glass-card p-6 border-violet-500/30">
                <div class="text-violet-400 text-xs font-semibold mb-2 uppercase tracking-wider">AI Feedback</div>
                <div class="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">{{ fb.feedback_text }}</div>
                <div class="text-xs text-zinc-600 mt-3">{{ fb.created_at | date:'medium' }}</div>
              </div>
            }
          </div>
        }
      } @else {
        <div class="text-zinc-600 text-center py-16">Loading session...</div>
      }
    </div>
  `,
})
export class SessionDetailComponent implements OnInit {
  session: InterviewSession | null = null;
  responses: InterviewResponse[] = [];
  feedbackItems: Feedback[] = [];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.api.getSession(id).subscribe({
      next: (session) => {
        this.session = session;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load session:', err),
    });

    this.api.getResponsesBySession(id).subscribe({
      next: (responses) => {
        this.responses = responses;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load responses:', err),
    });

    this.api.getFeedbackBySession(id).subscribe({
      next: (feedback) => {
        this.feedbackItems = feedback;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load feedback:', err),
    });
  }
}
