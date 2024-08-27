import { Component, inject } from '@angular/core';
import { ChatWindowComponent } from './content/chat-window/chat-window.component';
import { HeaderComponent } from './header/header.component';
import { ContentComponent } from "./content/content.component";
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/lp-services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ChatWindowComponent, 
    HeaderComponent, 
    ContentComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  authService = inject(AuthService)
  router = inject(Router)


  ngOnInit(): void {
    try {
      if (this.authService.currentUserSig() === null) {
        this.router.navigate(['']); 
      }
    } catch (error) {
      console.error('Error during navigation:', error);
    }
  }
}
