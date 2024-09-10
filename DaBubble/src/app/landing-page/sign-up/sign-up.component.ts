import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { LandingPageComponent } from '../landing-page.component';
import { AuthService } from '../../services/lp-services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserLoggedService } from '../../services/lp-services/user-logged.service';
import { UserLogged } from '../../models/user-logged.model';
import { user } from '@angular/fire/auth';
import { FirebaseError } from '@angular/fire/app';


@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})

/**
 * The SignUpComponent class handles the user registration process, including form validation and navigation.
 * 
 * This component provides a registration form where users can input their username, email, and password. It validates the input fields,
 * registers the user using the authentication service, and navigates to the avatar selection screen upon successful registration.
 */
 export class SignUpComponent {
  authService = inject(AuthService);  // Injects the authentication service for managing user registration.
  userService = inject(UserLoggedService);  // Injects the user service to manage user data.
  router = inject(Router);  // Injects the Angular Router for navigation.
  http = inject(HttpClient);  // Injects the HttpClient for making HTTP requests.
  alreadyUsed: boolean = false;  // Tracks whether the email is already in use.
  mobileVersion: boolean = false;  // Indicates whether the app is being viewed on a mobile device.

  isSubmited: boolean = false;  // Tracks if the form has been submitted.

  // Reactive form for registration with validation for username, email, password, and terms checkbox.
  registerForm = this.fb.group({
    username: ['', [
      Validators.required,
      Validators.pattern(/^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)$/u)  // Validates that the username contains valid Unicode letters.
    ]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    checkbox: ['', [Validators.required]],
  });

  /**
   * Constructor for SignUpComponent.
   * 
   * Initializes the form builder and handles UI interactions related to the landing page.
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
   * Handles the form submission for user registration.
   * 
   * This function retrieves the form data, validates it, and attempts to register the user. Upon success, it navigates
   * to the avatar selection screen. If the email is already in use, an error is displayed.
   * 
   * @returns {void} - Does not return anything.
   */
  onSubmit(): void {
    const rawForm = this.registerForm.getRawValue();
    const username = rawForm.username ?? '';
    const email = rawForm.email ?? '';
    this.isSubmited = true;
  
    this.registerUser(email, username, rawForm.password!)
      .then((successful) => {
        if (successful) {
          this.navigateToAvatarSelection();
        }
      })
      .catch(() => this.alreadyUsed = true)
      .finally(() => this.isSubmited = false);
  }

  /**
   * Registers a new user with the provided email, username, and password.
   * 
   * This asynchronous function uses the authentication service to register the user. If successful, it returns `true`.
   * If the email is already in use, it sets the `alreadyUsed` flag to `true` and returns `false`.
   * 
   * @param {string} email - The email address of the user.
   * @param {string} username - The username of the user.
   * @param {string} password - The password chosen by the user.
   * @returns {Promise<boolean>} - A promise that resolves to `true` if registration is successful, otherwise `false`.
   */
  private async registerUser(email: string, username: string, password: string): Promise<boolean> {
    try {
      await this.authService.register(email, username, password).toPromise();
      return true;
    } catch (err) {
      this.alreadyUsed = true;
      if (err instanceof FirebaseError && err.code === 'auth/email-already-in-use') {
        this.alreadyUsed = true;
      }
      return false;
    }
  }

  /**
   * Navigates to the avatar selection screen after successful registration.
   * 
   * This function changes the UI state to hide the sign-up form and display the avatar selection screen.
   * 
   * @returns {void} - Does not return anything.
   */
  private navigateToAvatarSelection(): void {
    this.lp.$signUp = false;
    this.lp.$avatar = true;
  }

  /**
   * Checks if a form control has validation errors and has been interacted with or submitted.
   * 
   * This function is used to display validation messages if the form control is invalid and has been touched or submitted.
   * 
   * @param {string} id - The ID of the form control.
   * @returns {boolean} - Returns `true` if the control is invalid and interacted with, otherwise `false`.
   */
  errorFc(id: string) {
    const control = this.registerForm.get(id);
    return control && control.invalid && (control.dirty || control.touched || this.isSubmited || this.alreadyUsed);
  }

  /**
   * Checks if the password field has validation errors and has been interacted with or submitted.
   * 
   * @param {string} id - The ID of the password form control.
   * @returns {boolean} - Returns `true` if the control is invalid and interacted with, otherwise `false`.
   */
  errorPW(id: string) {
    const control = this.registerForm.get(id);
    return control && control.invalid && (control.dirty || control.touched || this.isSubmited);
  }

  /**
   * Navigates back to the login screen.
   * 
   * This function hides the sign-up form and changes the UI state to display the login screen.
   * 
   * @returns {void} - Does not return anything.
   */
  backToLogin(): void {
    this.lp.$signUp = false;
    this.lp.$login = true;
  }

  /**
   * Navigates to the privacy policy page.
   * 
   * This function triggers the navigation to the privacy policy section using the landing page component.
   * 
   * @returns {void} - Does not return anything.
   */
  toPrivacy(): void {
    this.lp.toPrivacy();
  }
}

