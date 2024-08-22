import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { linkWithPhoneNumber } from '@angular/fire/auth';
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
export class SetPasswordComponent {
  lp = inject(LandingPageComponent)
  setPasswordForm: FormGroup;
  
  errorMessage: string | null = null;

  mode: string | null = null;
  oobCode: string | null = null;
  apiKey: string | null = null;
  lang: string | null = null;

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
  }

  setPassword(): void {
    if (this.setPasswordForm.valid && this.passwordsMatch()) {
      const newPassword = this.setPasswordForm.get('password')?.value;
      if (this.oobCode) {
        this.authService.confirmPassword(this.oobCode, newPassword).subscribe({
          next: () => {
            console.log('Password has been set successfully');
            this.backToLogin()
          },
          error: (error) => {
            console.error('Error setting password:', error);
            this.errorMessage = 'Fehler beim Setzen des Passworts. Bitte versuchen Sie es erneut.';
          }
        });
      }
    } else {
      this.errorMessage = 'Die Passwörter stimmen nicht überein oder das Formular ist ungültig.';
    }
  }

  passwordsMatch(): boolean {
    return this.setPasswordForm.get('password')?.value === this.setPasswordForm.get('confirmPassword')?.value;
  }

  backToLogin(): void {
    this.router.navigate([''])
  }
}
