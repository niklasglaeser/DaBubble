import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/lp-services/auth.service';
import { LandingPageComponent } from '../landing-page.component';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss']
})

/**
 * The SetPasswordComponent class handles setting a new password for users who have received a password reset link.
 * 
 * This component allows users to set a new password, ensuring that the passwords match and the reset link is valid. 
 * It interacts with the authentication service and provides feedback through pop-ups and error messages.
 */
 export class SetPasswordComponent {
  lp = inject(LandingPageComponent);  // Injects the LandingPageComponent to manage UI states.
  setPasswordForm: FormGroup;  // Reactive form group for setting a new password.
  errorM: string | null = null;  // Stores error messages for the password setting process.
  confirmPasswordTouched: boolean = false;  // Tracks if the confirm password field has been touched.
  
  mode: string | null = null;  // Stores the mode from the query parameters (if any).
  oobCode: string | null = null;  // Stores the out-of-band code from the password reset link.
  apiKey: string | null = null;  // Stores the API key (if required for verification).
  lang: string | null = null;  // Stores the language (if required for localization).
  mobileVersion: boolean = false;  // Indicates whether the app is being viewed on a mobile device.

  /**
   * Constructor for SetPasswordComponent.
   * 
   * Initializes the form group for setting a password and extracts the necessary query parameters 
   * from the route, including the oobCode.
   * 
   * @param {FormBuilder} fb - Instance of FormBuilder to manage the reactive form.
   * @param {AuthService} authService - Service for managing authentication and password reset operations.
   * @param {ActivatedRoute} route - ActivatedRoute for managing query parameters from the URL.
   * @param {Router} router - Router for navigating between routes.
   */
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.setPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });

    this.route.queryParams.subscribe((queryParams) => {
      this.oobCode = queryParams['oobCode'];
    });
  }

  /**
   * Initializes the component and sets the mobile version state based on the observable from the landing page service.
   * 
   * @returns {void} - Does not return anything.
   */
  ngOnInit(): void {
    this.lp.$mobileVersion.subscribe(isMobile => {
      this.mobileVersion = isMobile;
    });
  }

  /**
   * Submits the form to set a new password.
   * 
   * This function validates the form and ensures the passwords match. If valid, it uses the authentication 
   * service to confirm the password reset using the oobCode from the reset link. If successful, it shows a 
   * success pop-up and redirects the user to the login page. In case of error, appropriate messages are displayed.
   * 
   * @returns {void} - Does not return anything.
   */
  setPassword(): void {
    if (this.setPasswordForm.valid && this.passwordsMatch()) {
      const newPassword = this.setPasswordForm.get('password')?.value;
      if (this.oobCode) {
        this.authService.confirmPassword(this.oobCode, newPassword).subscribe({
          next: () => {
            this.lp.showPopUp('setPw');
            setTimeout(() => {
              this.backToLogin();
            }, 1500);
          },
          error: (error) => {
            if (error.code === 'auth/expired-action-code' || error.code === 'auth/invalid-action-code') {
              this.errorM = 'Der Link zum Zurücksetzen des Passworts ist ungültig. Bitte fordere einen neuen Link an.';
            } else {
              this.errorM = 'Fehler beim Setzen des Passworts. Bitte versuchen Sie es erneut.';
            }
          }
        });
      }
    } else {
      this.errorM = 'Die Passwörter stimmen nicht überein oder das Formular ist ungültig.';
    }
  }

  /**
   * Checks if the password and confirm password fields match.
   * 
   * This function compares the password and confirm password fields, and returns `true` if they match, otherwise `false`.
   * It also checks if the confirm password field has been touched or modified before showing validation feedback.
   * 
   * @returns {boolean} - Returns `true` if the passwords match, otherwise `false`.
   */
  passwordsMatch(): boolean {
    const password = this.setPasswordForm.get('password')?.value;
    const confirmPasswordControl = this.setPasswordForm.get('confirmPassword');
    const confirmPassword = confirmPasswordControl?.value;

    if (confirmPasswordControl && (confirmPasswordControl.dirty || confirmPasswordControl.touched)) {
      return password === confirmPassword;
    }

    return true;
  }

  /**
   * Navigates back to the login screen.
   * 
   * This function redirects the user back to the login page after the password has been successfully reset or cancelled.
   * 
   * @returns {void} - Does not return anything.
   */
  backToLogin(): void {
    this.router.navigate(['']);
  }
}

