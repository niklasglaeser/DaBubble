import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './services/auth.guard';



export const routes: Routes = [
  { path: '', component: LandingPageComponent},
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]  },
  { path: ':action', component: LandingPageComponent},

];

