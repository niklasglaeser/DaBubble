import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { LandingPageComponent } from '../landing-page.component';
import { AuthService } from '../../services/lp-services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserLoggedService } from '../../services/lp-services/user-logged.service';
import { UserLogged } from '../../models/user-logged.model';
import { UserInterface } from '../../models/user.interface';


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

  constructor(private fb: FormBuilder, private lp: LandingPageComponent,private route: ActivatedRoute,
   ) {
    this.authService.subscribeUser();
  }

  onSubmit(): void {
    const rawForm = this.registerForm.getRawValue();
    const username = rawForm.username ?? '';
    const email = rawForm.email ?? '';

    this.registerUser(email, username, rawForm.password!)
      .then(() => this.navigateToAvatarSelection())
      .catch(() => this.alreadyUsed = true);
  }

  private async registerUser(email: string, username: string, password: string): Promise<void> {
    await this.authService.register(email, username, password).toPromise();

    const currentUser = this.authService.currentUserSig(); 
    if (currentUser) {
      const user = this.createUserObject(currentUser.userId, username, email);
      await this.userService.addUser(user);
    } else {
      throw new Error('No current user found after registration.');
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
    this.router.navigate(['/landing-page/avatar']);
  }

  errorFc(id: string) {
    const control = this.registerForm.get(id);
    return control && control.invalid && (control.dirty || control.touched || this.isSubmited);
  }

  backToLogin(){
    this.router.navigate(['/landing-page/login']);
  }
}
