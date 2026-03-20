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
    <div class="h-[calc(100vh-4rem)] flex flex-col bg-slate-900">
      <!-- Header Bar -->
      <div class="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" [class]="isConnected ? 'bg-green-400' : 'bg-red-400'"></div>
            <span class="text-slate-300 text-sm">{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
          </div>
          @if (session) {
            <span class="text-slate-500 text-sm">
              {{ session.topic }} · {{ session.type | titlecase }} · {{ session.difficulty | titlecase }}
            </span>
          }
        </div>
        <div class="flex items-center gap-4">
          <!-- Code Editor Toggle (only for technical interviews) -->
          @if (session?.type === 'technical') {
            <button (click)="showCodeEditor = !showCodeEditor"
                    class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    [class]="showCodeEditor
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'">
              {{ showCodeEditor ? 'Hide Editor' : 'Code Editor' }}
            </button>
          }
          <!-- Timer -->
          @if (timerDuration > 0) {
            <div class="font-mono text-lg"
                 [class]="timeRemaining <= 60 ? 'text-red-400' : 'text-white'">
              {{ formatTime(timeRemaining) }}
            </div>
          }
          <button (click)="endInterview()"
                  class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            End Interview
          </button>
        </div>
      </div>

      <!-- Main content area: chat + optional code editor -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Chat Panel -->
        <div class="flex-1 flex flex-col min-w-0" [class]="showCodeEditor ? 'w-1/2' : 'w-full'">
          <!-- Chat Messages Area -->
          <div #chatContainer class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            @for (msg of messages; track $index) {
              <div class="flex" [class]="msg.role === 'user' ? 'justify-end' : 'justify-start'">
                <div class="max-w-[70%] rounded-lg p-4"
                     [class]="msg.role === 'user'
                       ? 'bg-indigo-600 text-white'
                       : 'bg-slate-800 text-slate-200 border border-slate-700'">
                  <div class="text-xs mb-1"
                       [class]="msg.role === 'user' ? 'text-indigo-200' : 'text-slate-500'">
                    {{ msg.role === 'user' ? 'You' : 'AI Interviewer' }}
                  </div>
                  <div class="whitespace-pre-wrap">{{ msg.content }}</div>
                  <div class="text-xs mt-2 opacity-50">
                    {{ msg.timestamp | date:'shortTime' }}
                  </div>
                </div>
              </div>
            }

            @if (isAiThinking) {
              <div class="flex justify-start">
                <div class="bg-slate-800 text-slate-400 border border-slate-700 rounded-lg p-4">
                  <div class="flex items-center gap-2">
                    <div class="flex gap-1">
                      <div class="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                      <div class="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                      <div class="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    </div>
                    AI is thinking...
                  </div>
                </div>
              </div>
            }

            @if (errorMessage) {
              <div class="flex justify-center">
                <div class="bg-red-900/50 text-red-300 border border-red-700 rounded-lg p-4 max-w-lg text-center">
                  <div class="font-medium mb-1">Connection Error</div>
                  <div class="text-sm">{{ errorMessage }}</div>
                  <button (click)="retryConnection()"
                          class="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors">
                    Retry Connection
                  </button>
                </div>
              </div>
            }

            <!-- Final Feedback -->
            @if (feedbackText) {
              <div class="bg-slate-800 border-2 border-indigo-500 rounded-xl p-6 mx-auto max-w-3xl">
                <h3 class="text-lg font-semibold text-indigo-400 mb-3">Session Feedback</h3>
                <div class="text-slate-300 whitespace-pre-wrap">{{ feedbackText }}</div>
              </div>
            }
          </div>

          <!-- Input Area -->
          @if (!sessionEnded) {
            <div class="bg-slate-800 border-t border-slate-700 px-6 py-4 shrink-0">
              <div class="flex items-end gap-3 max-w-4xl mx-auto">
                <!-- Mic Button -->
                <button (click)="toggleRecording()"
                        class="shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                        [class]="isRecording
                          ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                <!-- Text Input -->
                <textarea
                  #inputField
                  [(ngModel)]="userInput"
                  (keydown.enter)="onEnterKey($event)"
                  placeholder="Type your answer or click the mic to speak..."
                  rows="2"
                  class="flex-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 resize-none">
                </textarea>

                <!-- Send Button -->
                <button (click)="sendMessage()"
                        [disabled]="!userInput.trim() || isAiThinking"
                        class="shrink-0 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Send
                </button>
              </div>
            </div>
          } @else {
            <div class="bg-slate-800 border-t border-slate-700 px-6 py-4 text-center">
              <p class="text-slate-400 mb-3">Interview session has ended.</p>
              <div class="flex justify-center gap-4">
                <a class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                   (click)="goToHistory()">
                  View Session Details
                </a>
                <a class="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                   (click)="goToSetup()">
                  Start Another Interview
                </a>
              </div>
            </div>
          }
        </div>

        <!-- Code Editor Panel (technical interviews only) -->
        @if (showCodeEditor && session?.type === 'technical') {
          <div class="w-1/2 border-l border-slate-700 flex flex-col">
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

  // Code editor state
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private ws: WebSocketService,
    private audio: AudioService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.sessionId = Number(this.route.snapshot.paramMap.get('id'));

    this.api.getSession(this.sessionId).subscribe({
      next: (session) => {
        this.session = session;
        this.timerDuration = session.timer_duration;
        this.timeRemaining = session.timer_duration;

        if (this.timerDuration > 0) {
          this.startTimer();
        }
      },
    });

    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
    this.ws.disconnect();
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
            // Play AI response as speech via TTS
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
            console.error('WS Error:', msg.detail);
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
      this.isRecording = false;
      this.cdr.detectChanges();
      const blob = await this.audio.stopRecording();
      this.api.speechToText(blob).subscribe({
        next: (res) => {
          this.userInput = res.text;
          this.cdr.detectChanges();
          // Auto-send the transcribed voice message
          this.sendMessage();
        },
      });
    } else {
      try {
        await this.audio.startRecording();
        this.isRecording = true;
        this.cdr.detectChanges();
      } catch {
        console.error('Microphone access denied');
      }
    }
  }

  endInterview(): void {
    if (this.ws.isOpen) {
      this.isAiThinking = true;
      this.ws.endSession();
    } else {
      // WebSocket not connected, just end locally
      this.sessionEnded = true;
      this.isConnected = false;
      if (this.timerInterval) clearInterval(this.timerInterval);
      // Mark session as complete via REST API
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
      error: (err) => {
        this.isCodeRunning = false;
        this.codeEditor?.setOutput('', 'Failed to execute code. Is the backend running?', false);
        this.cdr.detectChanges();
      },
    });
  }
}
