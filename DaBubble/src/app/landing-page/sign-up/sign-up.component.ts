import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { LandingPageComponent } from '../landing-page.component';
import { AuthService } from '../../services/lp-services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';


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
export class SignUpComponent {
  authService = inject(AuthService)
  router = inject(Router)
  http = inject(HttpClient)
  
  isSubmited: boolean = false

  registerForm = this.fb.group({
    username: ['', [Validators.required,
      Validators.pattern(/^[a-zA-Z]+ [a-zA-Z]+$/) ]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required,Validators.minLength(6)]],
    checkbox: ['', [Validators.required]],
  });

  constructor(private fb: FormBuilder, private lp: LandingPageComponent) {}

  onSubmit(): void {
    const rawForm = this.registerForm.getRawValue();
    console.log(rawForm);
  
    this.authService.register(
      rawForm.email!,
      rawForm.username!,
      rawForm.password!
    ).subscribe({
      next: () => {
        this.lp.$signUp = false;
        this.lp.$avatar = true;
      },
      error: (err) => console.error('Registration error:', err)
    });
  }
  

  errorFc(id: string) {
    const control = this.registerForm.get(id);
    return control && control.invalid && (control.dirty || control.touched || this.isSubmited);
  }

  backToLogin(){
    this.lp.$signUp = false
    this.lp.$login = true
  }
}
