import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="app-shell">
      <app-navbar />
      <main class="min-h-[calc(100vh-4rem)] relative">
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100dvh;
      background: #09090b;
    }
    .app-shell {
      min-height: 100dvh;
      background: linear-gradient(135deg, #09090b 0%, #0f0f1a 40%, #0a0a14 70%, #09090b 100%);
      position: relative;
    }
    .app-shell::before {
      content: '';
      position: fixed;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(ellipse at 20% 50%, rgba(124, 58, 237, 0.06) 0%, transparent 50%),
                  radial-gradient(ellipse at 80% 20%, rgba(99, 102, 241, 0.04) 0%, transparent 50%),
                  radial-gradient(ellipse at 50% 80%, rgba(139, 92, 246, 0.03) 0%, transparent 50%);
      pointer-events: none;
      z-index: -1;
    }
    main {
      position: relative;
    }
  `,
})
export class App {}
