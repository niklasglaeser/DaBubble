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
    username: ['', [
      Validators.required,
      Validators.pattern(/^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)$/u)
    ]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required,Validators.minLength(6)]],
    checkbox: ['', [Validators.required]],
  });

  constructor(private fb: FormBuilder, private lp: LandingPageComponent) {
  }

  onSubmit(): void {
    const rawForm = this.registerForm.getRawValue();
    const username = rawForm.username ?? '';
    const email = rawForm.email ?? '';
    this.isSubmited = true

    this.registerUser(email, username, rawForm.password!)
      .then(() => {
        this.navigateToAvatarSelection()
      })
      .catch(() => this.alreadyUsed = true);
      this.isSubmited = false
  }

  private async registerUser(email: string, username: string, password: string): Promise<void> {
    try {
      const userCredential = await this.authService.register(email, username, password).toPromise();
      
      if (userCredential) {
        const user = userCredential.user;
        const uid = user.uid;
        
        const userObject = this.createUserObject(uid, username, email);
  
        await this.userService.addUser(userObject);
  
        
        this.authService.uid = uid;
        console.log('User ID:', this.lp.$uid);
      } else {
        throw new Error('No user credentials received after registration.');
      }
    } catch (err) {
      console.error('Error during user registration or Firestore update:', err);
    }
  }
  
  private createUserObject(userId: string, username: string, email: string): UserLogged {
    return new UserLogged({
      uid: userId,
      username: username,
      email: email,
      photoURL: '',
      joinedChannels: [],
      directMessage: [],
      onlineStatus: false,
    });
  }

  private navigateToAvatarSelection(): void {
    this.lp.$signUp = false
    this.lp.$avatar = true
  }

  errorFc(id: string) {
    const control = this.registerForm.get(id);
    return control && control.invalid && (control.dirty || control.touched || this.isSubmited || this.alreadyUsed);
  }
  errorPW(id: string) {
    const control = this.registerForm.get(id);
    return control && control.invalid && (control.dirty || control.touched || this.isSubmited);
  }

  backToLogin(){
    this.lp.$signUp = false
    this.lp.$login = true
  }
}
