import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { AvatarComponent } from './avatar/avatar.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    LoginComponent,
    SignUpComponent,
    AvatarComponent,
    ResetPasswordComponent,
    SetPasswordComponent,
    ImprintComponent,
    PrivacyPolicyComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

  $login: boolean = true;
  $signUp: boolean = false;
  $avatar: boolean = false;
  $resetPW: boolean = false;
  $setPW: boolean = false;
  $imprint: boolean = false;
  $privacy: boolean = false;
  $userId: string = '';
  animated: boolean = false;

  ngOnInit(): void {
    setTimeout(() => {
      this.animated = true
    }, 3000);
    
  }

  toCreatAcc(){
    this.$login = false
    this.$signUp = true
  }

  toImprint(){
    this.$signUp = false
    this.$setPW = false
    this.$resetPW = false
    this.$privacy = false
    this.$avatar = false
    this.$login = false
    this.$imprint = true
  }

  toPrivacy(){
    this.$signUp = false
    this.$setPW = false
    this.$resetPW = false
    this.$imprint = false
    this.$avatar = false
    this.$login = false
    this.$privacy = true
  }
}
