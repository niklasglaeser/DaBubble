import { Component, HostListener, inject, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { LandingPageComponent } from '../landing-page.component';
import { AuthService } from '../../services/lp-services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

/**
 * The LoginComponent class handles user login, form validation, and various login methods (standard, guest, and Google).
 * 
 * This component manages the login form, processes the login request, and handles errors during authentication. 
 * It also provides guest login functionality and integrates with Google login. Additionally, it detects if the application 
 * is viewed on a mobile device.
 */
 export class LoginComponent {
  authService = inject(AuthService);  // Injects the authentication service for managing user authentication.
  router = inject(Router);  // Injects the Angular Router for navigation.
  http = inject(HttpClient);  // Injects the HttpClient for making HTTP requests.
  isSubmited: boolean = false;  // Tracks if the form has been submitted.
  errorM: string | null = null;  // Stores error messages for the login process.
  mobileVersion?: boolean;  // Indicates whether the app is being viewed on a mobile device.

  // Reactive form for login, including validation for email and password fields.
  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  /**
   * Constructor for LoginComponent.
   * 
   * @param {FormBuilder} fb - Instance of FormBuilder to manage the reactive form.
   * @param {LandingPageComponent} lp - Instance of the landing page component to manage UI interactions.
   */
  constructor(private fb: FormBuilder, private lp: LandingPageComponent) {}

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
   * Handles the form submission for user login.
   * 
   * This function submits the login form, validates the input, and attempts to log the user in. 
   * If successful, it redirects to the dashboard. If login fails, it displays an error message.
   * 
   * @returns {void} - Does not return anything.
   */
  onSubmit(): void {
    this.isSubmited = true; 
    const rawForm = this.registerForm.getRawValue();

    this.authService.login(rawForm.email!, rawForm.password!).subscribe({
      next: () => {
        this.errorM = null; 
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        if(window.innerWidth <= 395){
          return this.errorM = 'Falsches Passwort oder E-Mail.';
        } else {
           return this.errorM = 'Falsches Passwort oder E-Mail. Bitte versuchen Sie es noch einmal.';
        }
      }
    });
  }

  /**
   * Logs in a guest user with predefined credentials.
   * 
   * This function logs in a guest user using predefined credentials and navigates to the dashboard upon success.
   * 
   * @returns {void} - Does not return anything.
   */
  guestLogin(): void {
    this.authService.login('guest@guest.com', 'Safa123').subscribe({
      next: () => {
        this.errorM = null; 
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorM = 'Falsches Passwort oder E-Mail. Bitte versuchen Sie es noch einmal.';
      }
    });
  }

  /**
   * Checks if a form control has errors and has been interacted with or submitted.
   * 
   * This function is used to display validation messages if the form control is invalid and has been touched.
   * 
   * @param {string} id - The ID of the form control.
   * @returns {boolean} - Returns `true` if the control is invalid and interacted with, otherwise `false`.
   */
  errorFc(id: string) {
    const control = this.registerForm.get(id);
    return control && control.invalid && (control.dirty || control.touched || this.isSubmited);
  }

  /**
   * Navigates to the password reset process.
   * 
   * This function resets the application state and initiates the password reset flow.
   * 
   * @returns {void} - Does not return anything.
   */
  resetPW(): void {
    this.lp.resetAllStates();
    this.lp.$resetPW = true;
  }

  /**
   * Initiates Google login and handles the response.
   * 
   * This function triggers Google login and, on success, resets the application state and moves to the avatar selection page.
   * If an error occurs, it displays an error message.
   * 
   * @returns {void} - Does not return anything.
   */
  googleLogin(): void {
    this.authService.googleLogin().subscribe({
      next: () => {
        this.lp.resetAllStates();
        this.lp.$avatar = true;
      },
      error: (err) => {
        this.errorM = 'Google Anmeldung fehlgeschlagen. Bitte versuchen Sie es noch einmal.';
        console.error('Error during Google login:', err);
      },
    });
  }
}

