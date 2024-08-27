import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/lp-services/auth.service';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { AvatarComponent } from './avatar/avatar.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { PopUpComponent } from './pop-up/pop-up.component';

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
    PrivacyPolicyComponent,
    PopUpComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  authService = inject(AuthService)
  router = inject(Router)
  route = inject(ActivatedRoute)

  $login = true;
  $signUp = false;
  $avatar = false;
  $resetPW = false;
  $imprint = false;
  $privacy = false;
  $setPW = false;
  $registration = false;
  $emailSend = false;
  $setNewPW = false;
  $uid = '';
  animated = false;
  oobCode: string | null = null;

  constructor() {}

  ngOnInit(): void {
    this.userIsLogged()
    this.route.params.subscribe((params) => {
      const action = params['action'];
      if (action === 'set-password') {
        this.route.queryParams.subscribe((queryParams) => {
          const oobCode = queryParams['oobCode'];
          console.log('oobCode:', oobCode);
          this.router.navigate(['/set-password'], { queryParams: { oobCode: oobCode } });
          this.resetAllStates()
          this.$setPW= true
        });
      } else {
        this.checkUserStatus()
      }
    });
  
    this.startAnimationWithDelay();
  }

  userIsLogged(){
    const uid = sessionStorage.getItem('uid') as string;
    if(uid){
      this.authService.uid = uid; 
      this.router.navigate(['dashboard'])
    }
  }

  private checkUserStatus() {
    if (this.authService.uid) {
      this.router.navigate(['dashboard']);
    } else {
      this.router.navigate(['']);
    }
  }
  
   resetAllStates(): void {
    this.$login = false;
    this.$signUp = false;
    this.$avatar = false;
    this.$resetPW = false;
    this.$imprint = false;
    this.$privacy = false;
    this.$setPW = false;
  }

  private startAnimationWithDelay(): void {
    setTimeout(() => {
      this.animated = true;
    }, 2500);
  }

  toCreatAcc(): void {
    this.resetAllStates()
    this.$signUp = true
  }

  toImprint(): void {
    this.resetAllStates()
    this.$imprint = true
  }
  
  toPrivacy(): void {
    this.resetAllStates()
    this.$privacy = true
  }

  showPopUp(show: string){
    if(show === 'regist'){
      this.$registration = true
      setTimeout(() => {
        this.$registration = false
      },2000);
    }else if(show === 'setPw'){
      this.$setNewPW = true
      setTimeout(() => {
        this.$setNewPW= false
      },2000);
    }else if(show === 'email'){
      this.$emailSend = true
      setTimeout(() => {
        this.$emailSend = false
      },2000);
    }
  }

}
