import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/lp-services/auth.service';
import { LandingPageComponent } from '../landing-page.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})

/**
 * The ResetPasswordComponent class handles the password reset functionality for users.
 * 
 * This component provides a form for users to enter their email and request a password reset. It validates the form input, 
 * interacts with the authentication service to send a password reset email, and provides UI feedback and navigation.
 */
 export class ResetPasswordComponent {
  isSubmited: boolean = false;  // Tracks whether the form has been submitted.
  authService = inject(AuthService);  // Injects the authentication service for managing password reset requests.
  lp = inject(LandingPageComponent);  // Injects the LandingPageComponent to manage UI states.
  resetForm: FormGroup;  // Reactive form group for email input.
  mobileVersion: boolean = false;  // Indicates whether the app is being viewed on a mobile device.

  /**
   * Constructor for ResetPasswordComponent.
   * 
   * Initializes the form group and dependencies for handling password reset functionality.
   * 
   * @param {FormBuilder} fb - Instance of FormBuilder to manage the reactive form.
   * @param {ActivatedRoute} route - ActivatedRoute for managing route information.
   * @param {Router} router - Router for navigating between routes.
   */
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
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
   * Resets the application state and navigates back to the login screen.
   * 
   * This function resets all states in the landing page service and sets the login state to `true`.
   * 
   * @returns {void} - Does not return anything.
   */
  backToLogin(): void {
    this.lp.resetAllStates();
    this.lp.$login = true;
  }

  /**
   * Checks if a form control has errors and has been interacted with or submitted.
   * 
   * This function is used to display validation messages if the form control is invalid and has been touched or submitted.
   * 
   * @param {string} id - The ID of the form control.
   * @returns {boolean} - Returns `true` if the control is invalid and interacted with, otherwise `false`.
   */
  errorFc(id: string) {
    const control = this.resetForm.get(id);
    return control && control.invalid && (control.dirty || control.touched || this.isSubmited);
  }

  /**
   * Handles the password reset process.
   * 
   * This function validates the reset form, sends a password reset request to the authentication service, 
   * and provides feedback to the user. If successful, it displays a confirmation pop-up and navigates back to the login screen.
   * 
   * @returns {void} - Does not return anything.
   */
  resetPassword(): void {
    if (this.resetForm.valid) {
      const email = this.resetForm.get('email')?.value;
      this.authService.resetPassword(email).subscribe({
        next: () => {
          this.lp.showPopUp('email');
          setTimeout(() => {
            this.backToLogin();
          }, 1500);
          console.log('Password reset email sent.');
        },
        error: (err) => {
          console.error('Error sending password reset email:', err);
        }
      });
    }
  }
}

