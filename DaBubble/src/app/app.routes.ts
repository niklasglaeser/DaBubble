import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'landing-page/login', pathMatch: 'full' },
  { path: 'landing-page/:action', component: LandingPageComponent },
  { path: 'dashboard', component: DashboardComponent },
];
