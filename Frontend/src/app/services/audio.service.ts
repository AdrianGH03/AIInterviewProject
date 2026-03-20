import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private audioTimeout: ReturnType<typeof setTimeout> | null = null;
  private maxAudioDuration = 30000; // 30 seconds max for TTS playback

  // Real-time transcription via Web Speech API
  private recognition: any = null;
  liveTranscript$ = new Subject<string>();
  private interimTranscript = '';

  async startRecording(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();

    // Start browser speech recognition for live transcript
    this.startSpeechRecognition();
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      this.stopSpeechRecognition();

      if (!this.mediaRecorder) {
        resolve(new Blob());
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.mediaRecorder?.stream.getTracks().forEach((t) => t.stop());
        this.mediaRecorder = null;
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  get isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  playAudio(blob: Blob): void {
    this.stopAudio(); // Stop any currently playing audio
    const url = URL.createObjectURL(blob);
    this.currentAudio = new Audio(url);
    this.currentAudio.onended = () => {
      URL.revokeObjectURL(url);
      this.currentAudio = null;
      this.clearAudioTimeout();
    };
    this.currentAudio.play();

    // Auto-cutoff after max duration
    this.audioTimeout = setTimeout(() => {
      this.stopAudio();
    }, this.maxAudioDuration);
  }

  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      if (this.currentAudio.src) {
        URL.revokeObjectURL(this.currentAudio.src);
      }
      this.currentAudio = null;
    }
    this.clearAudioTimeout();
  }

  get isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  private clearAudioTimeout(): void {
    if (this.audioTimeout) {
      clearTimeout(this.audioTimeout);
      this.audioTimeout = null;
    }
  }

  // ── Web Speech API for real-time transcription ──────────

  private startSpeechRecognition(): void {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.interimTranscript = '';

    this.recognition.onresult = (event: any) => {
      let final = '';
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      this.interimTranscript = (final + interim).trim();
      this.liveTranscript$.next(this.interimTranscript);
    };

    this.recognition.onerror = () => {
      // Silently fail — Whisper backend is the fallback
    };

    try {
      this.recognition.start();
    } catch {
      // Already started or not available
    }
  }

  private stopSpeechRecognition(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Already stopped
      }
      this.recognition = null;
    }
  }

  get hasSpeechRecognition(): boolean {
    return !!(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
  }
}
