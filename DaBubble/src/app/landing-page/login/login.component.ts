import { Component, inject } from '@angular/core';
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
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  http = inject(HttpClient);
  isSubmited: boolean = false;
  errorM: string | null = null; 

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor(private fb: FormBuilder, private lp: LandingPageComponent) {}

  onSubmit(): void {
    this.isSubmited = true; 
    const rawForm = this.registerForm.getRawValue();

    this.authService.login(rawForm.email!, rawForm.password!).subscribe({
      next: () => {
        this.errorM = null; 
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorM = 'Falsches Passwort oder E-Mail. Bitte versuchen Sie es noch einmal.';
      }
    });
  }

  guestLogin(): void {
    this.isSubmited = true; 
    
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

  errorFc(id: string) {
    const control = this.registerForm.get(id);
    return control && control.invalid && (control.dirty || control.touched || this.isSubmited);
  }

  resetPW() {
    this.lp.resetAllStates()
    this.lp.$resetPW = true
  }

  googleLogin(): void {
    this.isSubmited = true;
    
    this.authService.googleLogin().subscribe({
      next: async (userCredential) => {
        const email = userCredential.user.email!;
        const emailExists = await this.authService.userService.isEmailTaken(email);
        
        if (emailExists) {
          this.router.navigate(['/dashboard']);
        } else {
         this.lp.resetAllStates()
         this.lp.$avatar = true
        }
      },
      error: (err) => {
        this.errorM = 'Google Anmeldung fehlgeschlagen. Bitte versuchen Sie es noch einmal.';
        console.error('Error during Google login:', err);
      }
    });
  }

}
