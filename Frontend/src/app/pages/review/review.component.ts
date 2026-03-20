import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ReviewCardWithQuestion, ReviewStats } from '../../models/interfaces';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-6 py-12 animate-fade-in">
      <h1 class="text-3xl font-bold text-white tracking-tight mb-2">Spaced Repetition Review</h1>
      <p class="text-zinc-500 text-sm mb-8">Review your questions using spaced repetition to improve retention.</p>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="glass-card p-4 text-center animate-slide-up delay-1">
          <div class="text-2xl font-bold text-white">{{ stats.total_cards }}</div>
          <div class="text-zinc-500 text-xs mt-1">Total Cards</div>
        </div>
        <div class="glass-card p-4 text-center animate-slide-up delay-2">
          <div class="text-2xl font-bold text-violet-400">{{ stats.due_today }}</div>
          <div class="text-zinc-500 text-xs mt-1">Due Today</div>
        </div>
        <div class="glass-card p-4 text-center animate-slide-up delay-3">
          <div class="text-2xl font-bold text-emerald-400">{{ stats.reviewed_today }}</div>
          <div class="text-zinc-500 text-xs mt-1">Reviewed Today</div>
        </div>
      </div>

      @if (loading) {
        <div class="text-center py-16 text-zinc-600">Loading review cards...</div>
      } @else if (dueCards.length === 0) {
        <div class="text-center py-16 animate-fade-in">
          <div class="text-zinc-500 text-lg mb-2">No cards due for review!</div>
          <p class="text-zinc-600 text-sm">
            Add questions to your review deck from the
            <a routerLink="/question-banks" class="text-violet-400 hover:text-violet-300 font-medium">Question Banks</a> page.
          </p>
        </div>
      } @else if (currentCard) {
        <!-- Current Card -->
        <div class="glass-card p-8 mb-6 animate-fade-scale">
          <div class="flex items-center justify-between mb-6">
            <span class="text-xs text-zinc-600">Card {{ currentIndex + 1 }} of {{ dueCards.length }}</span>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-0.5 rounded-full"
                    [class]="currentCard.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : currentCard.difficulty === 'hard' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'">
                {{ currentCard.difficulty }}
              </span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {{ currentCard.topic }}
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">
                {{ currentCard.question_type }}
              </span>
            </div>
          </div>

          <div class="text-white text-lg leading-relaxed mb-6">
            {{ currentCard.question_text }}
          </div>

          @if (!showAnswer) {
            <button (click)="showAnswer = true"
                    class="w-full btn-gradient py-3 rounded-xl text-sm font-medium">
              Show Answer
            </button>
          } @else {
            <div class="border-t border-zinc-800 pt-5 mb-6 animate-fade-in">
              <div class="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-medium">Your Notes</div>
              @if (isEditingNotes) {
                <textarea [(ngModel)]="editingNotesText" rows="4"
                          class="w-full dark-input rounded-lg px-3 py-2 text-sm resize-none mb-2"
                          placeholder="Write your answer or notes here..."></textarea>
                <div class="flex gap-2 mb-4">
                  <button (click)="saveNotes()" class="btn-gradient px-3 py-1.5 rounded-lg text-xs font-medium">Save</button>
                  <button (click)="isEditingNotes = false" class="text-zinc-500 text-xs hover:text-white transition-colors">Cancel</button>
                </div>
              } @else {
                <div class="text-zinc-300 text-sm whitespace-pre-wrap mb-3 min-h-8">
                  {{ currentCard.notes || 'No notes yet. Click edit to add your answer notes.' }}
                </div>
                <button (click)="startEditNotes()" class="text-violet-400 text-xs hover:text-violet-300 font-medium mb-4 transition-colors">
                  Edit Notes
                </button>
              }

              <!-- Rating Buttons -->
              <div class="text-xs text-zinc-500 mb-3 text-center">How well did you know this?</div>
              <div class="grid grid-cols-4 gap-3">
                <button (click)="rateCard(1)"
                        class="py-3 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all duration-200">
                  <div>Again</div>
                  <div class="text-[10px] opacity-60 mt-0.5">1 day</div>
                </button>
                <button (click)="rateCard(2)"
                        class="py-3 rounded-xl text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all duration-200">
                  <div>Hard</div>
                  <div class="text-[10px] opacity-60 mt-0.5">1 day</div>
                </button>
                <button (click)="rateCard(3)"
                        class="py-3 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all duration-200">
                  <div>Good</div>
                  <div class="text-[10px] opacity-60 mt-0.5">{{ getNextInterval(3) }}</div>
                </button>
                <button (click)="rateCard(4)"
                        class="py-3 rounded-xl text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all duration-200">
                  <div>Easy</div>
                  <div class="text-[10px] opacity-60 mt-0.5">{{ getNextInterval(4) }}</div>
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- All Review Cards List -->
      @if (allCards.length > 0) {
        <div class="mt-12 animate-slide-up">
          <h2 class="text-lg font-semibold text-white mb-4">All Review Cards</h2>
          <div class="space-y-2">
            @for (card of allCards; track card.id) {
              <div class="glass-card p-4 flex items-center justify-between">
                <div class="min-w-0 flex-1">
                  <div class="text-sm text-zinc-300 truncate">{{ card.question_text }}</div>
                  <div class="text-xs text-zinc-600 mt-0.5 flex items-center gap-2">
                    <span>{{ card.topic }}</span>
                    <span class="text-zinc-700">·</span>
                    <span>{{ card.difficulty }}</span>
                    <span class="text-zinc-700">·</span>
                    <span>Next: {{ card.next_review_at | date:'mediumDate' }}</span>
                    <span class="text-zinc-700">·</span>
                    <span>Interval: {{ card.interval_days }}d</span>
                  </div>
                </div>
                <button (click)="removeCard(card.id)"
                        class="text-zinc-700 hover:text-red-400 ml-3 shrink-0 transition-colors duration-200"
                        title="Remove from review deck">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ReviewComponent implements OnInit {
  dueCards: ReviewCardWithQuestion[] = [];
  allCards: ReviewCardWithQuestion[] = [];
  stats: ReviewStats = { total_cards: 0, due_today: 0, reviewed_today: 0 };
  currentIndex = 0;
  showAnswer = false;
  isEditingNotes = false;
  editingNotesText = '';
  loading = true;

  get currentCard(): ReviewCardWithQuestion | null {
    return this.dueCards[this.currentIndex] || null;
  }

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.api.getReviewStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.cdr.detectChanges();
      },
    });
    this.api.getDueCards().subscribe({
      next: (cards) => {
        this.dueCards = cards;
        this.currentIndex = 0;
        this.showAnswer = false;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
    this.api.getReviewCards().subscribe({
      next: (cards) => {
        this.allCards = cards;
        this.cdr.detectChanges();
      },
    });
  }

  rateCard(quality: number): void {
    if (!this.currentCard) return;
    this.api.reviewCard(this.currentCard.id, quality).subscribe({
      next: () => {
        this.dueCards.splice(this.currentIndex, 1);
        if (this.currentIndex >= this.dueCards.length) {
          this.currentIndex = 0;
        }
        this.showAnswer = false;
        this.stats.reviewed_today++;
        this.stats.due_today = Math.max(0, this.stats.due_today - 1);
        // Refresh all cards list
        this.api.getReviewCards().subscribe({
          next: (cards) => {
            this.allCards = cards;
            this.cdr.detectChanges();
          },
        });
        this.cdr.detectChanges();
      },
    });
  }

  getNextInterval(quality: number): string {
    if (!this.currentCard) return '';
    const card = this.currentCard;
    if (quality < 3) return '1d';
    if (card.repetitions === 0) return '1d';
    if (card.repetitions === 1) return '6d';
    const days = Math.max(1, Math.round(card.interval_days * card.ease_factor));
    return days + 'd';
  }

  startEditNotes(): void {
    this.editingNotesText = this.currentCard?.notes || '';
    this.isEditingNotes = true;
  }

  saveNotes(): void {
    if (!this.currentCard) return;
    this.api.updateCardNotes(this.currentCard.id, this.editingNotesText).subscribe({
      next: () => {
        this.currentCard!.notes = this.editingNotesText;
        this.isEditingNotes = false;
        this.cdr.detectChanges();
      },
    });
  }

  removeCard(cardId: number): void {
    this.api.deleteReviewCard(cardId).subscribe({
      next: () => {
        this.dueCards = this.dueCards.filter((c) => c.id !== cardId);
        this.allCards = this.allCards.filter((c) => c.id !== cardId);
        if (this.currentIndex >= this.dueCards.length) {
          this.currentIndex = 0;
        }
        this.showAnswer = false;
        this.stats.total_cards = Math.max(0, this.stats.total_cards - 1);
        this.cdr.detectChanges();
      },
    });
  }
}
