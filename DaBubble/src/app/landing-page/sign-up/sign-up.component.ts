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
  userService = inject(UserLoggedService)
  router = inject(Router)
  http = inject(HttpClient)
  alreadyUsed:boolean = false

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
    
    // Sicherstellen, dass `username` und `email` nicht null sind
    const username = rawForm.username ?? '';
    const email = rawForm.email ?? '';

    this.authService.register(email, username, rawForm.password!).subscribe({
      next: async () => {
        const currentUser = this.authService.firebaseAuth.currentUser;
        const user = new UserLogged({
          uid: currentUser?.uid,
          username: username,
          email: email,
          photoURL: '',
          joinedChannels: [], 
          directMessage: [], 
          onlineStatus: false
        });
       
        try {
          await this.userService.addUser(user);
          this.lp.$signUp = false;
          this.lp.$avatar = true;
        } catch (err) {
          console.error('Error adding user: ', err);
        }
      },
      error: () => {
        this.alreadyUsed = true;
      }
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
