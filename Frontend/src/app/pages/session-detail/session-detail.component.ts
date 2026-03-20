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
    <div class="max-w-4xl mx-auto px-4 py-8">
      <a routerLink="/history" class="text-indigo-400 hover:text-indigo-300 text-sm mb-4 inline-block">
        ← Back to History
      </a>

      @if (session) {
        <!-- Session Info -->
        <div class="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl font-bold text-white">
              {{ session.topic }} - {{ session.type | titlecase }} Interview
            </h1>
            <span class="text-xs px-2.5 py-1 rounded-full font-medium"
                  [class]="session.is_completed ? 'bg-green-900/50 text-green-400' : 'bg-amber-900/50 text-amber-400'">
              {{ session.is_completed ? 'Completed' : 'In Progress' }}
            </span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div class="text-slate-500">Difficulty</div>
              <div class="text-white font-medium">{{ session.difficulty | titlecase }}</div>
            </div>
            <div>
              <div class="text-slate-500">Started</div>
              <div class="text-white font-medium">{{ session.time_started | date:'medium' }}</div>
            </div>
            <div>
              <div class="text-slate-500">Ended</div>
              <div class="text-white font-medium">
                {{ session.time_ended ? (session.time_ended | date:'medium') : 'N/A' }}
              </div>
            </div>
            <div>
              <div class="text-slate-500">Timer</div>
              <div class="text-white font-medium">
                {{ session.timer_duration > 0 ? (session.timer_duration / 60) + ' min' : 'None' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Transcript -->
        <h2 class="text-xl font-semibold text-white mb-4">Conversation Transcript</h2>
        @if (responses.length === 0) {
          <div class="text-slate-500 text-center py-8">No transcript data available.</div>
        } @else {
          <div class="space-y-3 mb-8">
            @for (resp of responses; track resp.id) {
              <div class="flex" [class]="resp.type_of_response === 'answer' ? 'justify-end' : 'justify-start'">
                <div class="max-w-[70%] rounded-lg p-4"
                     [class]="resp.type_of_response === 'answer'
                       ? 'bg-indigo-600/20 border border-indigo-500/30 text-slate-200'
                       : 'bg-slate-800 border border-slate-700 text-slate-200'">
                  <div class="text-xs mb-1"
                       [class]="resp.type_of_response === 'answer' ? 'text-indigo-400' : 'text-slate-500'">
                    {{ resp.type_of_response === 'answer' ? 'You' : 'AI Interviewer' }}
                  </div>
                  <div class="whitespace-pre-wrap">{{ resp.response_text }}</div>
                  <div class="text-xs mt-2 text-slate-600">{{ resp.created_at | date:'shortTime' }}</div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Feedback Section -->
        @if (feedbackItems.length > 0) {
          <h2 class="text-xl font-semibold text-white mb-4">Feedback</h2>
          <div class="space-y-4">
            @for (fb of feedbackItems; track fb.id) {
              <div class="bg-slate-800 rounded-xl border-2 border-indigo-500/30 p-6">
                <div class="text-indigo-400 text-sm font-medium mb-2">AI Feedback</div>
                <div class="text-slate-300 whitespace-pre-wrap">{{ fb.feedback_text }}</div>
                <div class="text-xs text-slate-600 mt-3">{{ fb.created_at | date:'medium' }}</div>
              </div>
            }
          </div>
        }
      } @else {
        <div class="text-slate-500 text-center py-16">Loading session...</div>
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
