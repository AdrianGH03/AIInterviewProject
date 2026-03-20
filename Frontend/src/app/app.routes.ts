import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'interview/setup',
    loadComponent: () =>
      import('./pages/interview-setup/interview-setup.component').then(
        (m) => m.InterviewSetupComponent
      ),
  },
  {
    path: 'interview/:id',
    loadComponent: () =>
      import('./pages/interview-session/interview-session.component').then(
        (m) => m.InterviewSessionComponent
      ),
  },
  {
    path: 'question-banks',
    loadComponent: () =>
      import('./pages/question-banks/question-banks.component').then(
        (m) => m.QuestionBanksComponent
      ),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./pages/session-history/session-history.component').then(
        (m) => m.SessionHistoryComponent
      ),
  },
  {
    path: 'history/:id',
    loadComponent: () =>
      import('./pages/session-detail/session-detail.component').then(
        (m) => m.SessionDetailComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
