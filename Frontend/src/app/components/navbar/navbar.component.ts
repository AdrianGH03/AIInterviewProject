import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="nav-glass sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14">
          <a routerLink="/" class="flex items-center gap-2 text-white font-semibold text-lg tracking-tight">
            <div class="w-7 h-7 rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            PrepPilot
          </a>
          <div class="flex items-center gap-1">
            <a routerLink="/" routerLinkActive="nav-active" [routerLinkActiveOptions]="{exact: true}"
               class="nav-link">
              Dashboard
            </a>
            <a routerLink="/interview/setup" routerLinkActive="nav-active"
               class="nav-link">
              New Interview
            </a>
            <a routerLink="/question-banks" routerLinkActive="nav-active"
               class="nav-link">
              Question Banks
            </a>
            <a routerLink="/history" routerLinkActive="nav-active"
               class="nav-link">
              History
            </a>
            <a routerLink="/review" routerLinkActive="nav-active"
               class="nav-link">
              Review
            </a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: `
    .nav-glass {
      background: rgba(9, 9, 11, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(63, 63, 70, 0.3);
    }
    .nav-link {
      color: #71717a;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .nav-link:hover {
      color: #e4e4e7;
      background: rgba(63, 63, 70, 0.3);
    }
    .nav-active {
      color: #e4e4e7 !important;
      background: rgba(124, 58, 237, 0.15) !important;
      box-shadow: 0 0 12px rgba(124, 58, 237, 0.1);
    }
  `,
})
export class NavbarComponent {}
