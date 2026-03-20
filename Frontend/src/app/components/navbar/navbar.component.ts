import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-slate-900 border-b border-slate-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <a routerLink="/" class="flex items-center gap-2 text-white font-bold text-xl">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            PrepPilot
          </a>
          <div class="flex items-center gap-1">
            <a routerLink="/" routerLinkActive="bg-slate-700" [routerLinkActiveOptions]="{exact: true}"
               class="text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Dashboard
            </a>
            <a routerLink="/interview/setup" routerLinkActive="bg-slate-700"
               class="text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              New Interview
            </a>
            <a routerLink="/question-banks" routerLinkActive="bg-slate-700"
               class="text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Question Banks
            </a>
            <a routerLink="/history" routerLinkActive="bg-slate-700"
               class="text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              History
            </a>
          </div>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {}
