import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { CommonModule} from '@angular/common';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AuthService } from './services/lp-services/auth.service';
import { UserLoggedService } from './services/lp-services/user-logged.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LandingPageComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'DaBubble';
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  userService = inject(UserLoggedService);
  currentUser = this.authService.currentUserSig()
  oobCode :string = ''

  ngOnInit(): void {
      
  }

 logout() {
    this.authService.logout();  
    this.router.navigateByUrl('');  
  }
 
  async setStatusOn() {
    if (this.currentUser) {
      try {
        await this.userService.updateUserStatus(this.currentUser.userId, true); 
        console.log("Status successfully set to online.");
      } catch (error) {
        console.error("Error setting status to online:", error);
      }
    }
  }
}
