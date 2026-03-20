import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { QuestionBank, QuestionBankCreate, QuestionCreate, Question, JobCategory } from '../../models/interfaces';

@Component({
  selector: 'app-question-banks',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      <div class="flex items-center justify-between mb-10">
        <div>
          <h1 class="text-3xl font-bold text-white tracking-tight">Question Banks</h1>
          <p class="text-zinc-500 mt-1 text-sm">Organize your interview questions by topic.</p>
        </div>
        <div class="flex items-center gap-3">
          <button (click)="showJobImport = true"
                  class="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
            Import from Job Description
          </button>
          <button (click)="showCreateBank = true"
                  class="btn-gradient px-4 py-2 rounded-lg text-sm font-medium">
            + New Question Bank
          </button>
        </div>
      </div>

      <!-- Banks Grid -->
      @if (banks.length === 0) {
        <div class="text-center py-16 text-zinc-600">
          <p class="text-base">No question banks yet.</p>
          <p class="mt-1 text-sm">Create one to start organizing your questions.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (bank of banks; track bank.id) {
            <div class="glass-card p-6 card-hover animate-slide-up">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-base font-semibold text-white">{{ bank.name }}</h3>
                  <span class="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium uppercase tracking-wider">
                    {{ bank.topic }}
                  </span>
                </div>
                <button (click)="deleteBank(bank.id)"
                        class="text-zinc-600 hover:text-red-400 transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              @if (bank.description) {
                <p class="text-zinc-500 text-xs mb-3 leading-relaxed">{{ bank.description }}</p>
              }
              <div class="text-zinc-600 text-xs mb-3">
                {{ bank.questions.length }} question{{ bank.questions.length !== 1 ? 's' : '' }}
              </div>

              <div class="flex items-center gap-2">
                <button (click)="toggleExpand(bank.id)"
                        class="text-violet-400 text-xs font-medium hover:text-violet-300 transition-all duration-200">
                  {{ expandedBankId === bank.id ? 'Hide' : 'Show Questions' }}
                </button>
                <button (click)="openBulkAdd(bank)"
                        class="text-zinc-500 text-xs font-medium hover:text-white transition-all duration-200 ml-auto">
                  + Bulk Add
                </button>
              </div>

              @if (expandedBankId === bank.id) {
                <div class="mt-4 space-y-2 animate-fade-in">
                  @for (q of bank.questions; track q.id) {
                    <div class="bg-zinc-900/80 rounded-lg p-3 flex items-start justify-between border border-zinc-800/50">
                      <div>
                        <div class="text-xs text-zinc-300">{{ q.question_text }}</div>
                        <div class="text-[10px] text-zinc-600 mt-1">
                          {{ q.question_type }} · {{ q.difficulty }}
                          @if (q.time_limit) { · {{ q.time_limit }}s }
                        </div>
                      </div>
                      <div class="flex items-center gap-1 shrink-0 ml-2">
                        <button (click)="addToReview(q.id)" title="Add to review deck"
                                class="transition-colors duration-200"
                                [class]="reviewAddedId === q.id ? 'text-emerald-400' : 'text-zinc-700 hover:text-violet-400'">
                          @if (reviewAddedId === q.id) {
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          } @else {
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          }
                        </button>
                        <button (click)="deleteQuestion(q.id, bank.id)"
                                class="text-zinc-700 hover:text-red-400 transition-colors duration-200">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  }

                  <!-- Add Question Form -->
                  <div class="mt-3 bg-zinc-900/80 rounded-lg p-3 space-y-2 border border-zinc-800/50">
                    <input [(ngModel)]="newQuestion.question_text" type="text" placeholder="Question text..."
                           class="w-full dark-input rounded px-3 py-1.5 text-xs">
                    <div class="flex gap-2">
                      <select [(ngModel)]="newQuestion.question_type"
                              class="dark-input rounded px-2 py-1.5 text-xs">
                        <option value="coding">Coding</option>
                        <option value="behavioral">Behavioral</option>
                        <option value="system_design">System Design</option>
                      </select>
                      <select [(ngModel)]="newQuestion.difficulty"
                              class="dark-input rounded px-2 py-1.5 text-xs">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                      <button (click)="addQuestion(bank)"
                              [disabled]="!newQuestion.question_text.trim()"
                              class="btn-gradient disabled:opacity-30 px-3 py-1.5 rounded text-xs font-medium ml-auto">
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

    <!-- Create Bank Modal -->
    @if (showCreateBank) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 animate-fade-in" (click)="showCreateBank = false">
        <div class="glass-card p-8 w-full max-w-md shadow-2xl shadow-violet-500/5 animate-fade-scale" (click)="$event.stopPropagation()">
          <h2 class="text-lg font-semibold text-white mb-4">Create Question Bank</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-zinc-500 mb-1">Name</label>
              <input [(ngModel)]="newBank.name" type="text"
                     class="w-full dark-input rounded-lg px-3 py-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-500 mb-1">Topic</label>
              <input [(ngModel)]="newBank.topic" type="text"
                     class="w-full dark-input rounded-lg px-3 py-2 text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-500 mb-1">Description</label>
              <textarea [(ngModel)]="newBank.description" rows="3"
                        class="w-full dark-input rounded-lg px-3 py-2 text-sm resize-none"></textarea>
            </div>
            <div class="flex gap-3 justify-end pt-2">
              <button (click)="showCreateBank = false"
                      class="px-4 py-2 text-zinc-500 hover:text-white text-sm transition-colors duration-200">Cancel</button>
              <button (click)="createBank()"
                      [disabled]="!newBank.name.trim() || !newBank.topic.trim()"
                      class="btn-gradient px-5 py-2 rounded-lg text-sm font-medium">
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Job Description Import Modal -->
    @if (showJobImport) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-60 animate-fade-in overflow-y-auto" (click)="showJobImport = false">
        <div class="glass-card p-8 w-full max-w-2xl shadow-2xl shadow-violet-500/5 my-16 animate-fade-scale" (click)="$event.stopPropagation()">
          <h2 class="text-lg font-semibold text-white mb-2">Import from Job Description</h2>
          <p class="text-zinc-500 text-xs mb-6">Paste a job posting URL or the description text to auto-generate categorized questions.</p>

          @if (!jobCategories.length) {
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-zinc-500 mb-1">Company Name</label>
                <input [(ngModel)]="jobCompanyName" type="text" placeholder="e.g. MediaFire, Google, etc."
                       class="w-full dark-input rounded-lg px-3 py-2 text-sm">
              </div>

              <div>
                <label class="block text-xs font-medium text-zinc-500 mb-1">Job Posting URL</label>
                <div class="flex gap-2">
                  <input [(ngModel)]="jobUrl" type="url" placeholder="https://..."
                         class="flex-1 dark-input rounded-lg px-3 py-2 text-sm">
                  <button (click)="scrapeJobUrl()"
                          [disabled]="!jobUrl.trim() || isJobLoading"
                          class="btn-gradient px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">
                    {{ isJobLoading ? 'Fetching...' : 'Fetch' }}
                  </button>
                </div>
                <p class="text-xs text-zinc-600 mt-1">Note: Some sites (e.g. LinkedIn) block scraping. Paste the description below instead.</p>
              </div>

              <div class="text-center text-zinc-600 text-xs">— or —</div>

              <div>
                <label class="block text-xs font-medium text-zinc-500 mb-1">Paste Job Description</label>
                <textarea [(ngModel)]="jobDescription" rows="8" placeholder="Paste the full job description here..."
                          class="w-full dark-input rounded-lg px-3 py-2 text-sm resize-none"></textarea>
              </div>

              @if (jobError) {
                <div class="text-red-400 text-xs">{{ jobError }}</div>
              }

              <div class="flex gap-3 justify-end pt-2">
                <button (click)="showJobImport = false; resetJobImport()"
                        class="px-4 py-2 text-zinc-500 hover:text-white text-sm transition-colors duration-200">Cancel</button>
                <button (click)="generateQuestionsFromJob()"
                        [disabled]="!jobDescription.trim() || !jobCompanyName.trim() || isJobLoading"
                        class="btn-gradient px-5 py-2 rounded-lg text-sm font-medium">
                  {{ isJobLoading ? 'Analyzing...' : 'Generate Questions' }}
                </button>
              </div>
            </div>
          } @else {
            <div class="space-y-5">
              <p class="text-xs text-zinc-500">
                Select which categories to create as question banks. Each will be named
                "{{ jobCompanyName }} - [Category] Question Practice".
              </p>

              @for (cat of jobCategories; track cat.name; let i = $index) {
                <div class="border rounded-xl p-4 bg-zinc-900/50 animate-slide-up transition-all duration-200"
                     [class]="isCategorySelected(i) ? 'border-violet-500/50' : 'border-zinc-800'">
                  <div class="flex items-center gap-3 mb-2">
                    <input type="checkbox" [checked]="isCategorySelected(i)"
                           (change)="toggleCategorySelection(i)"
                           class="rounded border-zinc-700 bg-zinc-900 accent-violet-500">
                    <div>
                      <h3 class="font-semibold text-sm text-white">{{ jobCompanyName }} - {{ cat.name }} Question Practice</h3>
                      <span class="text-xs text-zinc-600">{{ cat.questions.length }} questions</span>
                    </div>
                  </div>

                  <div class="ml-7 space-y-1 max-h-40 overflow-y-auto">
                    @for (q of cat.questions; track q.text) {
                      <div class="text-xs text-zinc-400 flex items-center gap-2 py-0.5">
                        <span class="shrink-0 px-1.5 py-0.5 rounded text-[10px]"
                              [class]="q.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400' : q.difficulty === 'hard' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'">
                          {{ q.difficulty }}
                        </span>
                        <span>{{ q.text }}</span>
                      </div>
                    }
                  </div>
                </div>
              }

              <div class="flex gap-3 justify-end pt-4 border-t border-zinc-800/50">
                <button (click)="jobCategories = []; jobError = ''"
                        class="px-4 py-2 text-zinc-500 hover:text-white text-sm transition-colors duration-200">Back</button>
                <button (click)="createBanksFromCategories()"
                        [disabled]="getSelectedCategoryCount() === 0 || isJobLoading"
                        class="btn-gradient px-5 py-2 rounded-lg text-sm font-medium">
                  {{ isJobLoading ? 'Creating...' : 'Create ' + getSelectedCategoryCount() + ' Question Banks' }}
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    }

    <!-- Bulk Add Modal -->
    @if (showBulkAdd) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 animate-fade-in" (click)="showBulkAdd = false">
        <div class="glass-card p-8 w-full max-w-lg shadow-2xl shadow-violet-500/5 animate-fade-scale" (click)="$event.stopPropagation()">
          <h2 class="text-lg font-semibold text-white mb-1">Bulk Add Questions</h2>
          <p class="text-zinc-500 text-xs mb-4">Enter one question per line. All will use the settings below.</p>
          <div class="space-y-4">
            <textarea [(ngModel)]="bulkQuestionsText" rows="8" placeholder="What is a closure in JavaScript?\nExplain the SOLID principles.\nHow does garbage collection work in Python?"
                      class="w-full dark-input rounded-lg px-3 py-2 text-sm resize-none font-mono"></textarea>
            <div class="flex gap-3">
              <select [(ngModel)]="bulkQuestionType"
                      class="dark-input rounded-lg px-3 py-2 text-sm">
                <option value="coding">Coding</option>
                <option value="behavioral">Behavioral</option>
                <option value="system_design">System Design</option>
              </select>
              <select [(ngModel)]="bulkDifficulty"
                      class="dark-input rounded-lg px-3 py-2 text-sm">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div class="flex gap-3 justify-end pt-2">
              <button (click)="showBulkAdd = false"
                      class="px-4 py-2 text-zinc-500 hover:text-white text-sm transition-colors duration-200">Cancel</button>
              <button (click)="submitBulkQuestions()"
                      [disabled]="!bulkQuestionsText.trim()"
                      class="btn-gradient px-5 py-2 rounded-lg text-sm font-medium">
                Add Questions
              </button>
            </div>
          </div>
        </div>
      </div>
    }
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

  // Bulk add state
  showBulkAdd = false;
  bulkQuestionsText = '';
  bulkQuestionType = 'coding';
  bulkDifficulty = 'medium';
  bulkTargetBank: QuestionBank | null = null;

  // Job import state
  showJobImport = false;
  jobUrl = '';
  jobDescription = '';
  jobCategories: JobCategory[] = [];
  jobCompanyName = '';
  jobError = '';
  isJobLoading = false;
  selectedCategories = new Set<number>();

  // Review state
  reviewAddedId: number | null = null;

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
    this.api.deleteQuestionBank(id).subscribe({ next: () => this.loadBanks() });
  }

  toggleExpand(bankId: number): void {
    this.expandedBankId = this.expandedBankId === bankId ? null : bankId;
  }

  addQuestion(bank: QuestionBank): void {
    this.newQuestion.topic = bank.topic;
    this.newQuestion.questionbank_id = bank.id;
    this.api.createQuestion(this.newQuestion).subscribe({
      next: () => {
        this.newQuestion = { question_text: '', question_type: 'coding', difficulty: 'medium', topic: '' };
        this.loadBanks();
      },
    });
  }

  deleteQuestion(questionId: number, bankId: number): void {
    this.api.deleteQuestion(questionId).subscribe({ next: () => this.loadBanks() });
  }

  // ── Bulk Add ────────────────────────────────────────────

  openBulkAdd(bank: QuestionBank): void {
    this.bulkTargetBank = bank;
    this.bulkQuestionsText = '';
    this.showBulkAdd = true;
  }

  submitBulkQuestions(): void {
    if (!this.bulkTargetBank || !this.bulkQuestionsText.trim()) return;

    const lines = this.bulkQuestionsText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const questions: QuestionCreate[] = lines.map((line) => ({
      question_text: line,
      question_type: this.bulkQuestionType,
      difficulty: this.bulkDifficulty,
      topic: this.bulkTargetBank!.topic,
      questionbank_id: this.bulkTargetBank!.id,
    }));

    this.api.createQuestionsBulk(questions).subscribe({
      next: () => {
        this.showBulkAdd = false;
        this.bulkQuestionsText = '';
        this.loadBanks();
      },
    });
  }

  // ── Job Description Import ──────────────────────────────

  scrapeJobUrl(): void {
    if (!this.jobUrl.trim()) return;
    this.isJobLoading = true;
    this.jobError = '';
    this.api.scrapeJobUrl(this.jobUrl).subscribe({
      next: (res) => {
        this.jobDescription = res.text;
        this.isJobLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.jobError = err.error?.detail || 'Failed to fetch URL. Try pasting the description manually.';
        this.isJobLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  generateQuestionsFromJob(): void {
    if (!this.jobDescription.trim() || !this.jobCompanyName.trim()) return;
    this.isJobLoading = true;
    this.jobError = '';
    this.api.generateQuestionsFromJob(this.jobDescription, this.jobCompanyName).subscribe({
      next: (res) => {
        this.jobCategories = res.categories;
        this.selectedCategories.clear();
        // Pre-select all categories
        res.categories.forEach((_, i) => {
          this.selectedCategories.add(i);
        });
        this.isJobLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.jobError = err.error?.detail || 'Failed to analyze job description.';
        this.isJobLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  isCategorySelected(index: number): boolean {
    return this.selectedCategories.has(index);
  }

  toggleCategorySelection(index: number): void {
    if (this.selectedCategories.has(index)) {
      this.selectedCategories.delete(index);
    } else {
      this.selectedCategories.add(index);
    }
  }

  getSelectedCategoryCount(): number {
    return this.selectedCategories.size;
  }

  createBanksFromCategories(): void {
    if (this.getSelectedCategoryCount() === 0 || !this.jobCompanyName.trim()) return;

    const selectedCats = this.jobCategories
      .filter((_, i) => this.selectedCategories.has(i))
      .map((cat) => ({
        name: cat.name,
        questions: cat.questions,
      }));

    this.isJobLoading = true;
    this.api.createBanksFromJob({
      company_name: this.jobCompanyName,
      categories: selectedCats,
    }).subscribe({
      next: () => {
        this.showJobImport = false;
        this.resetJobImport();
        this.loadBanks();
        this.isJobLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isJobLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  addToReview(questionId: number): void {
    this.api.createReviewCard({ question_id: questionId }).subscribe({
      next: () => {
        this.reviewAddedId = questionId;
        setTimeout(() => {
          this.reviewAddedId = null;
          this.cdr.detectChanges();
        }, 2000);
        this.cdr.detectChanges();
      },
    });
  }

  resetJobImport(): void {
    this.jobUrl = '';
    this.jobDescription = '';
    this.jobCategories = [];
    this.jobCompanyName = '';
    this.jobError = '';
    this.isJobLoading = false;
    this.selectedCategories.clear();
  }
}
