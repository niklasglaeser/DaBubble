import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { AvatarComponent } from './avatar/avatar.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SetPasswordComponent } from './set-password/set-password.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    LoginComponent,
    SignUpComponent,
    AvatarComponent,
    ResetPasswordComponent,
    SetPasswordComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

  $login: boolean = true;
  $signUp: boolean = false;


  toCreatAcc(){
    this.$login = false
    this.$signUp = true
  }
}
