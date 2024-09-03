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
export class SetPasswordComponent {
  lp = inject(LandingPageComponent);
  setPasswordForm: FormGroup;
  
  errorM: string | null = null;
  confirmPasswordTouched: boolean = false;

  mode: string | null = null;
  oobCode: string | null = null;
  apiKey: string | null = null;
  lang: string | null = null;
  mobileVersion: boolean = false

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

  ngOnInit() {
    this.lp.$mobileVersion.subscribe(isMobile => {
      this.mobileVersion = isMobile;
    });
  }

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

  passwordsMatch(): boolean {
    const password = this.setPasswordForm.get('password')?.value;
    const confirmPasswordControl = this.setPasswordForm.get('confirmPassword');
    const confirmPassword = confirmPasswordControl?.value;

    
    if (confirmPasswordControl && (confirmPasswordControl.dirty || confirmPasswordControl.touched)) {
        return password === confirmPassword;
    }

    return true
}


  backToLogin(): void {
    this.router.navigate(['']);
  }
}
