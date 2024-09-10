import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/lp-services/auth.service';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { AvatarComponent } from './avatar/avatar.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { PopUpComponent } from './pop-up/pop-up.component';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    LoginComponent,
    SignUpComponent,
    AvatarComponent,
    ResetPasswordComponent,
    SetPasswordComponent,
    ImprintComponent,
    PrivacyPolicyComponent,
    PopUpComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})

/**
 * The LandingPageComponent class manages the state of the landing page, including navigation, UI interactions, and user authentication checks.
 * 
 * This component handles different sections of the landing page such as login, sign-up, privacy policy, imprint, password reset, and avatar selection.
 * It also determines whether the application is being viewed on a mobile device and triggers animations and pop-ups for different user interactions.
 */
 export class LandingPageComponent implements OnInit {
  authService: AuthService = inject(AuthService);  // Injects the authentication service to manage user authentication.
  router: Router = inject(Router);  // Injects the Angular Router for navigation.
  route: ActivatedRoute = inject(ActivatedRoute);  // Injects ActivatedRoute to manage route parameters and query params.

  $mobileVersion = new BehaviorSubject<boolean>(window.innerWidth <= 650);  // Tracks whether the app is being viewed on a mobile device.
  $login: boolean = true;  // Tracks whether the login section is visible.
  $signUp: boolean = false;  // Tracks whether the sign-up section is visible.
  $avatar: boolean = false;  // Tracks whether the avatar selection section is visible.
  $resetPW: boolean = false;  // Tracks whether the password reset section is visible.
  $imprint: boolean = false;  // Tracks whether the imprint section is visible.
  $privacy: boolean = false;  // Tracks whether the privacy policy section is visible.
  $setPW: boolean = false;  // Tracks whether the set password section is visible.
  $registration: boolean = false;  // Tracks whether the registration confirmation pop-up is visible.
  $emailSend: boolean = false;  // Tracks whether the email sent confirmation pop-up is visible.
  $setNewPW: boolean = false;  // Tracks whether the set new password confirmation pop-up is visible.
  $uid: string = '';  // Stores the user ID.
  animated: boolean = false;  // Tracks whether the landing page animation is active.
  oobCode: string | null = null;  // Stores the out-of-band code from the reset password link.

  /**
   * Constructor for LandingPageComponent.
   */
  constructor() {}

  /**
   * Detects window resize events and checks if the app is in mobile view.
   * 
   * @param {Event} event - The resize event.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkMobileVersion();
  }

  /**
   * Checks if the window width is less than or equal to 650 pixels to determine if it's mobile view.
   * 
   * @returns {void} - Does not return anything.
   */
  checkMobileVersion(): void {
    this.$mobileVersion.next(window.innerWidth <= 650);
  }

  /**
   * Initializes the component, checks the user's authentication status, and manages route parameters for password setting.
   * 
   * @returns {void} - Does not return anything.
   */
  ngOnInit(): void {
    this.checkMobileVersion();
    this.userIsLogged();
    this.route.params.subscribe((params) => {
      const action = params['action'];
      if (action === 'set-password') {
        this.route.queryParams.subscribe((queryParams) => {
          const oobCode = queryParams['oobCode'];
          console.log('oobCode:', oobCode);
          this.router.navigate(['/set-password'], { queryParams: { oobCode: oobCode } });
          this.resetAllStates();
          this.$setPW = true;
        });
      } else {
        this.checkUserStatus();
      }
    });
    this.startAnimationWithDelay();
  }

  /**
   * Checks if the user is logged in by checking the session storage for a user ID.
   * 
   * If a user ID is found, it navigates to the dashboard. Otherwise, it remains on the landing page.
   * 
   * @returns {void} - Does not return anything.
   */
  userIsLogged(): void {
    const uid = sessionStorage.getItem('uid') as string;
    if (uid) {
      this.authService.uid = uid;
      this.router.navigate(['dashboard']);
    }
  }

  /**
   * Checks the user's authentication status and navigates to the dashboard if logged in, otherwise redirects to the landing page.
   * 
   * @returns {void} - Does not return anything.
   */
  private checkUserStatus(): void {
    if (this.authService.uid) {
      this.router.navigate(['dashboard']);
    } else {
      this.router.navigate(['']);
    }
  }

  /**
   * Resets all UI states (login, sign-up, avatar, etc.), making them hidden.
   * 
   * @returns {void} - Does not return anything.
   */
  resetAllStates(): void {
    this.$login = false;
    this.$signUp = false;
    this.$avatar = false;
    this.$resetPW = false;
    this.$imprint = false;
    this.$privacy = false;
    this.$setPW = false;
  }

  /**
   * Starts the landing page animation after a delay of 2.5 seconds.
   * 
   * @returns {void} - Does not return anything.
   */
  private startAnimationWithDelay(): void {
    setTimeout(() => {
      this.animated = true;
    }, 2500);
  }

  /**
   * Navigates to the account creation (sign-up) section.
   * 
   * @returns {void} - Does not return anything.
   */
  toCreatAcc(): void {
    this.resetAllStates();
    this.$signUp = true;
  }

  /**
   * Navigates to the imprint section.
   * 
   * @returns {void} - Does not return anything.
   */
  toImprint(): void {
    this.resetAllStates();
    this.$imprint = true;
  }

  /**
   * Navigates to the privacy policy section.
   * 
   * @returns {void} - Does not return anything.
   */
  toPrivacy(): void {
    this.resetAllStates();
    this.$privacy = true;
  }

  /**
   * Displays a pop-up for registration, password setting, or email confirmation for 2 seconds.
   * 
   * @param {string} show - The type of pop-up to show ('regist', 'setPw', or 'email').
   * @returns {void} - Does not return anything.
   */
  showPopUp(show: string): void {
    if (show === 'regist') {
      this.$registration = true;
      setTimeout(() => {
        this.$registration = false;
      }, 2000);
    } else if (show === 'setPw') {
      this.$setNewPW = true;
      setTimeout(() => {
        this.$setNewPW = false;
      }, 2000);
    } else if (show === 'email') {
      this.$emailSend = true;
      setTimeout(() => {
        this.$emailSend = false;
      }, 2000);
    }
  }

  /**
   * Resets all states and navigates back to the landing page (login).
   * 
   * @returns {void} - Does not return anything.
   */
  toLandingPage(): void {
    this.resetAllStates();
    this.$login = true;
    this.router.navigate(['']);
  }
}

