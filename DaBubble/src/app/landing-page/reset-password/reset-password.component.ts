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
export class ResetPasswordComponent {
  isSubmited: boolean = false;
  authService = inject(AuthService);
  lp = inject(LandingPageComponent);
  resetForm: FormGroup;

  constructor(private fb: FormBuilder,private route: ActivatedRoute,
    private router: Router) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  backToLogin(){
    this.lp.resetAllStates()
     this.lp.$login = true
   }

  errorFc(id: string) {
    const control = this.resetForm.get(id);
    return control && control.invalid && (control.dirty || control.touched || this.isSubmited);
  }

  resetPassword() {
    if (this.resetForm.valid) {
      const email = this.resetForm.get('email')?.value;
      this.authService.resetPassword(email).subscribe({
        next: () => {
          this.backToLogin()
          console.log('Password reset email sent.');
        },
        error: (err) => {
          console.error('Error sending password reset email:', err);
        }
      });
    }
  }
}
