import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';
import { AudioService } from '../../services/audio.service';
import { ChatMessage, InterviewSession } from '../../models/interfaces';
import { CodeEditorComponent } from '../../components/code-editor/code-editor.component';

@Component({
  selector: 'app-interview-session',
  standalone: true,
  imports: [CommonModule, FormsModule, CodeEditorComponent],
  template: `
    <div class="h-[calc(100vh-3.5rem)] flex flex-col bg-[#09090b]">
      <!-- Header Bar -->
      <div class="bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800/50 px-6 py-2.5 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-1.5 rounded-full" [class]="isConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-zinc-600'"></div>
            <span class="text-zinc-500 text-xs">{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
          </div>
          @if (session) {
            <span class="text-zinc-600 text-xs">
              {{ session.topic }} · {{ session.type | titlecase }} · {{ session.difficulty | titlecase }}
            </span>
          }
        </div>
        <div class="flex items-center gap-3">
          @if (session?.type === 'technical') {
            <button (click)="showCodeEditor = !showCodeEditor"
                    class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border"
                    [class]="showCodeEditor
                      ? 'bg-violet-500/15 text-violet-400 border-violet-500/30'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'">
              {{ showCodeEditor ? 'Hide Editor' : 'Code Editor' }}
            </button>
          }
          @if (audio.isPlaying) {
            <button (click)="audio.stopAudio()"
                    class="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700 transition-all duration-200">
              Stop Audio
            </button>
          }
          @if (timerDuration > 0) {
            <div class="font-mono text-sm px-3 py-1 rounded-lg"
                 [class]="timeRemaining <= 60 ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-zinc-300 bg-zinc-900 border border-zinc-800'">
              {{ formatTime(timeRemaining) }}
            </div>
          }
          <button (click)="endInterview()"
                  class="btn-gradient px-4 py-1.5 rounded-lg text-xs font-medium">
            End Interview
          </button>
        </div>
      </div>

      <!-- Main content area -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Chat Panel -->
        <div class="flex-1 flex flex-col min-w-0" [class]="showCodeEditor ? 'w-1/2' : 'w-full'">
          <!-- Chat Messages -->
          <div #chatContainer class="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            @for (msg of messages; track $index) {
              <div class="flex animate-fade-in" [class]="msg.role === 'user' ? 'justify-end' : 'justify-start'">
                <div class="max-w-[70%] rounded-2xl px-4 py-3"
                     [class]="msg.role === 'user'
                       ? 'bg-linear-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/10'
                       : 'bg-zinc-900/80 text-zinc-200 border border-zinc-800/50'">
                  <div class="text-[10px] mb-1 uppercase tracking-wider font-medium"
                       [class]="msg.role === 'user' ? 'text-violet-200/60' : 'text-zinc-500'">
                    {{ msg.role === 'user' ? 'You' : 'AI Interviewer' }}
                  </div>
                  <div class="whitespace-pre-wrap text-sm leading-relaxed">{{ msg.content }}</div>
                  <div class="text-[10px] mt-2 opacity-40">
                    {{ msg.timestamp | date:'shortTime' }}
                  </div>
                </div>
              </div>
            }

            @if (isAiThinking) {
              <div class="flex justify-start animate-fade-in">
                <div class="bg-zinc-900/80 text-zinc-500 border border-zinc-800/50 rounded-2xl px-4 py-3">
                  <div class="flex items-center gap-2 text-sm">
                    <div class="flex gap-1">
                      <div class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></div>
                      <div class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                      <div class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    </div>
                    AI is thinking...
                  </div>
                </div>
              </div>
            }

            @if (errorMessage) {
              <div class="flex justify-center animate-fade-in">
                <div class="bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl px-4 py-3 max-w-lg text-center">
                  <div class="font-medium mb-1 text-sm">Connection Error</div>
                  <div class="text-xs text-red-400/70">{{ errorMessage }}</div>
                  <button (click)="retryConnection()"
                          class="mt-2 btn-gradient px-3 py-1 rounded text-xs font-medium">
                    Retry
                  </button>
                </div>
              </div>
            }

            @if (feedbackText) {
              <div class="bg-zinc-900/80 border border-violet-500/30 rounded-2xl p-6 mx-auto max-w-3xl animate-fade-scale shadow-lg shadow-violet-500/5">
                <h3 class="text-sm font-semibold text-violet-400 mb-3 uppercase tracking-wider">Session Feedback</h3>
                <div class="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">{{ feedbackText }}</div>
              </div>
            }
          </div>

          <!-- Input Area -->
          @if (!sessionEnded) {
            <div class="bg-[#09090b]/80 backdrop-blur-xl border-t border-zinc-800/50 px-6 py-3 shrink-0">
              @if (isRecording && liveText) {
                <div class="mb-2 text-xs text-zinc-500 flex items-center gap-2">
                  <div class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50"></div>
                  Recording — edit text below before sending
                </div>
              }
              <div class="flex items-end gap-3 max-w-4xl mx-auto">
                <button (click)="toggleRecording()"
                        class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border"
                        [class]="isRecording
                          ? 'bg-red-500 border-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                <textarea
                  #inputField
                  [(ngModel)]="userInput"
                  (keydown.enter)="onEnterKey($event)"
                  placeholder="Type your answer or click the mic to speak..."
                  rows="2"
                  class="flex-1 dark-input rounded-xl px-4 py-2.5 text-sm resize-none">
                </textarea>

                <button (click)="sendMessage()"
                        [disabled]="!userInput.trim() || isAiThinking"
                        class="shrink-0 btn-gradient disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none px-5 py-2.5 rounded-xl text-sm font-medium">
                  Send
                </button>
              </div>
            </div>
          } @else {
            <div class="bg-[#09090b]/80 backdrop-blur-xl border-t border-zinc-800/50 px-6 py-4 text-center">
              <p class="text-zinc-500 mb-3 text-sm">Interview session has ended.</p>
              <div class="flex justify-center gap-3">
                <a class="btn-gradient px-5 py-2 rounded-lg text-sm font-medium cursor-pointer"
                   (click)="goToHistory()">
                  View Session Details
                </a>
                <a class="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                   (click)="goToSetup()">
                  Start Another
                </a>
              </div>
            </div>
          }
        </div>

        <!-- Code Editor Panel -->
        @if (showCodeEditor && session?.type === 'technical') {
          <div class="w-1/2 border-l border-zinc-800/50 flex flex-col">
            <app-code-editor
              [initialCode]="codeEditorInitialCode"
              [editorHeight]="editorHeight"
              [isRunning]="isCodeRunning"
              (runCode)="onRunCode($event)"
              (codeChange)="currentCode = $event"
            />
          </div>
        }
      </div>
    </div>
  `,
})
export class InterviewSessionComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('inputField') inputField!: ElementRef;
  @ViewChild(CodeEditorComponent) codeEditor!: CodeEditorComponent;

  session: InterviewSession | null = null;
  messages: ChatMessage[] = [];
  userInput = '';
  isConnected = false;
  isAiThinking = false;
  isRecording = false;
  sessionEnded = false;
  feedbackText = '';
  errorMessage = '';
  liveText = '';

  showCodeEditor = false;
  isCodeRunning = false;
  currentCode = '';
  codeEditorInitialCode = '# Write your solution here\n\n';
  editorHeight = 500;

  timerDuration = 0;
  timeRemaining = 0;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  private sessionId = 0;
  private wsSub: Subscription | null = null;
  private liveSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private ws: WebSocketService,
    public audio: AudioService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.sessionId = Number(this.route.snapshot.paramMap.get('id'));

    this.api.getSession(this.sessionId).subscribe({
      next: (session) => {
        this.session = session;
        this.timerDuration = session.timer_duration;
        this.timeRemaining = session.timer_duration;
        if (this.timerDuration > 0) this.startTimer();
      },
    });

    // Subscribe to live transcription updates
    this.liveSub = this.audio.liveTranscript$.subscribe((text) => {
      if (this.isRecording) {
        this.userInput = text;
        this.liveText = text;
        this.cdr.detectChanges();
      }
    });

    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
    this.liveSub?.unsubscribe();
    this.ws.disconnect();
    this.audio.stopAudio();
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  private connectWebSocket(): void {
    this.isAiThinking = true;
    this.errorMessage = '';
    this.wsSub = this.ws.connect(this.sessionId).subscribe({
      next: (msg) => {
        switch (msg.type) {
          case 'connected':
            this.isConnected = true;
            this.errorMessage = '';
            break;

          case 'history':
            // Rebuild chat from stored responses (session resume)
            if (msg.messages) {
              this.messages = msg.messages.map((m: any) => ({
                role: m.type_of_response === 'answer' ? 'user' as const : 'ai' as const,
                content: m.response_text || '',
                timestamp: new Date(),
              }));
              this.scrollToBottom();
            }
            this.isAiThinking = false;
            this.isConnected = true;
            break;

          case 'ai_message':
            this.isAiThinking = false;
            this.isConnected = true;
            this.errorMessage = '';
            this.messages.push({
              role: 'ai',
              content: msg.content || '',
              timestamp: new Date(),
            });
            this.scrollToBottom();
            if (msg.content) {
              this.api.textToSpeech(msg.content).subscribe({
                next: (audioBlob) => this.audio.playAudio(audioBlob),
              });
            }
            break;

          case 'feedback':
            this.isAiThinking = false;
            this.feedbackText = msg.content || '';
            this.scrollToBottom();
            break;

          case 'session_ended':
            this.sessionEnded = true;
            this.isAiThinking = false;
            this.isConnected = false;
            if (this.timerInterval) clearInterval(this.timerInterval);
            break;

          case 'error':
            this.isAiThinking = false;
            this.isConnected = false;
            this.errorMessage = msg.detail || 'An unexpected error occurred.';
            this.scrollToBottom();
            break;
        }
        this.cdr.detectChanges();
      },
    });
  }

  retryConnection(): void {
    this.wsSub?.unsubscribe();
    this.ws.disconnect();
    this.connectWebSocket();
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text || this.isAiThinking || this.sessionEnded) return;

    if (!this.ws.isOpen) {
      this.errorMessage = 'Not connected. Please retry the connection.';
      this.scrollToBottom();
      return;
    }

    this.messages.push({ role: 'user', content: text, timestamp: new Date() });
    this.ws.sendMessage(text);
    this.userInput = '';
    this.liveText = '';
    this.isAiThinking = true;
    this.errorMessage = '';
    this.scrollToBottom();
  }

  onEnterKey(event: Event): void {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey) {
      ke.preventDefault();
      this.sendMessage();
    }
  }

  async toggleRecording(): Promise<void> {
    if (this.isRecording) {
      // Stop recording — text is already in the input from live transcription
      this.isRecording = false;
      this.cdr.detectChanges();
      const blob = await this.audio.stopRecording();

      // If live transcription didn't produce text, fall back to Whisper
      if (!this.userInput.trim()) {
        this.api.speechToText(blob).subscribe({
          next: (res) => {
            this.userInput = res.text;
            this.cdr.detectChanges();
          },
        });
      }
      // Do NOT auto-send — let user review/edit the text first
    } else {
      try {
        await this.audio.startRecording();
        this.isRecording = true;
        this.liveText = '';
        this.cdr.detectChanges();
      } catch {
        console.error('Microphone access denied');
      }
    }
  }

  endInterview(): void {
    this.audio.stopAudio();
    if (this.ws.isOpen) {
      this.isAiThinking = true;
      this.ws.endSession();
    } else {
      this.sessionEnded = true;
      this.isConnected = false;
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.api.completeSession(this.sessionId).subscribe();
    }
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.endInterview();
      }
    }, 1000);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.chatContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }

  goToHistory(): void {
    this.router.navigate(['/history', this.sessionId]);
  }

  goToSetup(): void {
    this.router.navigate(['/interview/setup']);
  }

  onRunCode(event: { language: string; code: string }): void {
    this.isCodeRunning = true;
    this.api.runCode({ language: event.language, code: event.code }).subscribe({
      next: (result) => {
        this.isCodeRunning = false;
        this.codeEditor?.setOutput(result.stdout, result.stderr, result.timed_out);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isCodeRunning = false;
        this.codeEditor?.setOutput('', 'Failed to execute code. Is the backend running?', false);
        this.cdr.detectChanges();
      },
    });
  }
}
