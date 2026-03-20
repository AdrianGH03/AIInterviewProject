import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { QuestionBank, InterviewSessionCreate } from '../../models/interfaces';

@Component({
  selector: 'app-interview-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-white mb-2">Start New Interview</h1>
      <p class="text-slate-400 mb-8">Configure your practice interview session.</p>

      <div class="space-y-6">
        <!-- Interview Type -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-3">Interview Type</label>
          <div class="grid grid-cols-2 gap-4">
            <button (click)="config.type = 'technical'"
                    class="p-4 rounded-lg border-2 transition-all text-left"
                    [class]="config.type === 'technical'
                      ? 'border-indigo-500 bg-indigo-600/10 text-white'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'">
              <div class="font-semibold mb-1">Technical</div>
              <div class="text-sm opacity-75">Coding, system design, concepts</div>
            </button>
            <button (click)="config.type = 'behavioral'"
                    class="p-4 rounded-lg border-2 transition-all text-left"
                    [class]="config.type === 'behavioral'
                      ? 'border-green-500 bg-green-600/10 text-white'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'">
              <div class="font-semibold mb-1">Behavioral</div>
              <div class="text-sm opacity-75">STAR method, leadership, teamwork</div>
            </button>
          </div>
        </div>

        <!-- Topic -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Topic</label>
          <select [(ngModel)]="config.topic"
                  class="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            @for (topic of topics; track topic) {
              <option [value]="topic">{{ topic }}</option>
            }
          </select>
        </div>

        <!-- Custom Topic -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Or enter a custom topic</label>
          <input type="text"
                 [(ngModel)]="customTopic"
                 placeholder="e.g. GraphQL, Kubernetes, AWS..."
                 class="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500">
        </div>

        <!-- Difficulty -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-3">Difficulty</label>
          <div class="grid grid-cols-3 gap-4">
            @for (diff of difficulties; track diff.value) {
              <button (click)="config.difficulty = diff.value"
                      class="p-3 rounded-lg border-2 transition-all text-center"
                      [class]="config.difficulty === diff.value
                        ? 'border-indigo-500 bg-indigo-600/10 text-white'
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'">
                <div class="font-semibold">{{ diff.label }}</div>
              </button>
            }
          </div>
        </div>

        <!-- Timer Duration -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">
            Timer Duration (minutes) — 0 for no timer
          </label>
          <input type="number"
                 [(ngModel)]="timerMinutes"
                 min="0" max="120"
                 class="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500">
        </div>

        <!-- Question Bank (optional) -->
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">
            Question Bank (optional)
          </label>
          <select [(ngModel)]="selectedBankId"
                  class="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option [ngValue]="null">None — AI will generate questions</option>
            @for (bank of questionBanks; track bank.id) {
              <option [ngValue]="bank.id">{{ bank.name }} ({{ bank.topic }})</option>
            }
          </select>
        </div>

        <!-- Start Button -->
        <button (click)="startInterview()"
                [disabled]="isLoading"
                class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors text-lg">
          @if (isLoading) {
            Starting Interview...
          } @else {
            Start Interview
          }
        </button>
      </div>
    </div>
  `,
})
export class InterviewSetupComponent implements OnInit {
  config: InterviewSessionCreate = {
    type: 'technical',
    topic: 'Python',
    difficulty: 'medium',
    timer_duration: 0,
  };

  customTopic = '';
  timerMinutes = 0;
  selectedBankId: number | null = null;
  questionBanks: QuestionBank[] = [];
  isLoading = false;

  topics = [
    'Python', 'JavaScript', 'TypeScript', 'React', 'Angular',
    'Node.js', 'System Design', 'Data Structures', 'Algorithms',
    'SQL', 'Docker', 'AWS', 'Git', 'REST APIs', 'General CS',
  ];

  difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['type']) {
        this.config.type = params['type'];
      }
    });

    this.api.getQuestionBanks().subscribe({
      next: (banks) => {
        this.questionBanks = banks;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load question banks:', err),
    });
  }

  startInterview(): void {
    if (this.customTopic.trim()) {
      this.config.topic = this.customTopic.trim();
    }
    this.config.timer_duration = this.timerMinutes * 60;
    this.config.question_bank_id = this.selectedBankId;

    this.isLoading = true;
    this.api.createSession(this.config).subscribe({
      next: (session) => {
        this.router.navigate(['/interview', session.id]);
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}
