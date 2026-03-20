import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { WSServerMessage } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messagesSubject = new Subject<WSServerMessage>();
  private sessionEndedByServer = false;
  private intentionalDisconnect = false;

  constructor(private ngZone: NgZone) {}

  connect(sessionId: number): Observable<WSServerMessage> {
    this.disconnect();
    this.sessionEndedByServer = false;
    this.intentionalDisconnect = false;

    const url = `${environment.wsUrl}/ws/interview/${sessionId}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.ngZone.run(() => {
        this.messagesSubject.next({ type: 'connected' });
      });
    };

    this.socket.onmessage = (event) => {
      this.ngZone.run(() => {
        try {
          const data: WSServerMessage = JSON.parse(event.data);
          if (data.type === 'session_ended') {
            this.sessionEndedByServer = true;
          }
          this.messagesSubject.next(data);
        } catch {
          console.error('Failed to parse WebSocket message');
        }
      });
    };

    this.socket.onerror = () => {
      this.ngZone.run(() => {
        this.messagesSubject.next({
          type: 'error',
          detail: 'WebSocket connection error. Please check that the backend is running.',
        });
      });
    };

    this.socket.onclose = (event) => {
      this.ngZone.run(() => {
        if (this.sessionEndedByServer) {
          // Already handled via onmessage
          return;
        }
        if (this.intentionalDisconnect) {
          return;
        }
        // Unexpected close — connection failed or dropped
        this.messagesSubject.next({
          type: 'error',
          detail: 'Connection lost. The interview session was interrupted.',
        });
      });
    };

    return this.messagesSubject.asObservable();
  }

  sendMessage(content: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'message', content }));
    }
  }

  endSession(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'end_session' }));
    }
  }

  disconnect(): void {
    this.intentionalDisconnect = true;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  get isOpen(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}
