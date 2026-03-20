import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { QuestionBank, QuestionBankCreate, QuestionCreate, Question } from '../../models/interfaces';

@Component({
  selector: 'app-question-banks',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white">Question Banks</h1>
          <p class="text-slate-400 mt-1">Organize your interview questions by topic.</p>
        </div>
        <button (click)="showCreateBank = true"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
          + New Question Bank
        </button>
      </div>

      <!-- Create Bank Modal -->
      @if (showCreateBank) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
            <h2 class="text-xl font-semibold text-white mb-4">Create Question Bank</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">Name</label>
                <input [(ngModel)]="newBank.name" type="text"
                       class="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">Topic</label>
                <input [(ngModel)]="newBank.topic" type="text"
                       class="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea [(ngModel)]="newBank.description" rows="3"
                          class="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
              </div>
              <div class="flex gap-3 justify-end">
                <button (click)="showCreateBank = false"
                        class="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                <button (click)="createBank()"
                        [disabled]="!newBank.name.trim() || !newBank.topic.trim()"
                        class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-medium transition-colors">
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Banks Grid -->
      @if (banks.length === 0) {
        <div class="text-center py-16 text-slate-500">
          <p class="text-lg">No question banks yet.</p>
          <p class="mt-1">Create one to start organizing your questions.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (bank of banks; track bank.id) {
            <div class="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-slate-500 transition-colors">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="text-lg font-semibold text-white">{{ bank.name }}</h3>
                  <span class="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-indigo-900/50 text-indigo-400">
                    {{ bank.topic }}
                  </span>
                </div>
                <button (click)="deleteBank(bank.id)"
                        class="text-slate-500 hover:text-red-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              @if (bank.description) {
                <p class="text-slate-400 text-sm mb-3">{{ bank.description }}</p>
              }
              <div class="text-slate-500 text-sm mb-4">
                {{ bank.questions.length }} question{{ bank.questions.length !== 1 ? 's' : '' }}
              </div>

              <!-- Expand/collapse questions -->
              <button (click)="toggleExpand(bank.id)"
                      class="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                {{ expandedBankId === bank.id ? 'Hide Questions' : 'Show Questions' }}
              </button>

              @if (expandedBankId === bank.id) {
                <div class="mt-4 space-y-2">
                  @for (q of bank.questions; track q.id) {
                    <div class="bg-slate-700/50 rounded-lg p-3 flex items-start justify-between">
                      <div>
                        <div class="text-sm text-white">{{ q.question_text }}</div>
                        <div class="text-xs text-slate-500 mt-1">
                          {{ q.question_type }} · {{ q.difficulty }}
                          @if (q.time_limit) { · {{ q.time_limit }}s }
                        </div>
                      </div>
                      <button (click)="deleteQuestion(q.id, bank.id)"
                              class="text-slate-500 hover:text-red-400 ml-2 shrink-0 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  }

                  <!-- Add Question Form -->
                  <div class="mt-3 bg-slate-700/30 rounded-lg p-3 space-y-2">
                    <input [(ngModel)]="newQuestion.question_text" type="text" placeholder="Question text..."
                           class="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <div class="flex gap-2">
                      <select [(ngModel)]="newQuestion.question_type"
                              class="bg-slate-700 border border-slate-600 text-white rounded px-2 py-1.5 text-sm focus:outline-none">
                        <option value="coding">Coding</option>
                        <option value="behavioral">Behavioral</option>
                        <option value="system_design">System Design</option>
                      </select>
                      <select [(ngModel)]="newQuestion.difficulty"
                              class="bg-slate-700 border border-slate-600 text-white rounded px-2 py-1.5 text-sm focus:outline-none">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                      <button (click)="addQuestion(bank)"
                              [disabled]="!newQuestion.question_text.trim()"
                              class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors ml-auto">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class QuestionBanksComponent implements OnInit {
  banks: QuestionBank[] = [];
  showCreateBank = false;
  expandedBankId: number | null = null;

  newBank: QuestionBankCreate = { name: '', topic: '', description: '' };
  newQuestion: QuestionCreate = {
    question_text: '',
    question_type: 'coding',
    difficulty: 'medium',
    topic: '',
  };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadBanks();
  }

  loadBanks(): void {
    this.api.getQuestionBanks().subscribe({
      next: (banks) => {
        this.banks = banks;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load question banks:', err),
    });
  }

  createBank(): void {
    this.api.createQuestionBank(this.newBank).subscribe({
      next: () => {
        this.showCreateBank = false;
        this.newBank = { name: '', topic: '', description: '' };
        this.cdr.detectChanges();
        this.loadBanks();
      },
    });
  }

  deleteBank(id: number): void {
    this.api.deleteQuestionBank(id).subscribe({
      next: () => this.loadBanks(),
    });
  }

  toggleExpand(bankId: number): void {
    this.expandedBankId = this.expandedBankId === bankId ? null : bankId;
  }

  addQuestion(bank: QuestionBank): void {
    this.newQuestion.topic = bank.topic;
    this.newQuestion.questionbank_id = bank.id;
    this.api.createQuestion(this.newQuestion).subscribe({
      next: () => {
        this.newQuestion = {
          question_text: '',
          question_type: 'coding',
          difficulty: 'medium',
          topic: '',
        };
        this.loadBanks();
      },
    });
  }

  deleteQuestion(questionId: number, bankId: number): void {
    this.api.deleteQuestion(questionId).subscribe({
      next: () => this.loadBanks(),
    });
  }
}
