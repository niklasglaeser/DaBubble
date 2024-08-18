import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AuthService } from './services/lp-services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LandingPageComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'DaBubble';
  authService = inject(AuthService)
  router = inject(Router);

  ngOnInit(): void {
    this.authService.subscribeUser()
  }

  logout(){
    this.authService.logout()
    this.router.navigateByUrl('');
  }
}
