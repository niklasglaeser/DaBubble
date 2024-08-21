import { Component, OnInit } from '@angular/core';
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
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {

  $login = false;
  $signUp = false;
  $avatar = false;
  $resetPW = false;
  $setPW = false;
  $imprint = false;
  $privacy = false;
  animated = false;
  oobCode: string | null = null;

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
  this.route.params.subscribe(params => {
    const action = params['action'];
    this.route.queryParams.subscribe(params => {
      this.oobCode = params['oobCode']
    })

    console.log('Action:', action);
    console.log('oobCode', this.oobCode);
    this.handleAction(action)
  });
  }

  private handleAction(action: string): void {
    this.resetAllStates();
    switch(action) {
      case 'setPassword':
        this.$setPW = true;
        break;
      case 'resetPassword':
        this.$resetPW = true;
        break;
      case 'login':
        this.$login = true;
        break;
      case 'signUp':
        this.$signUp = true;
        break;
      case 'avatar':
        this.$avatar = true;
        break;
      case 'imprint':
        this.$imprint = true;
        break;
      case 'privacy':
        this.$privacy = true;
        break;
      default:
        this.$login = true;
    }

    this.startAnimationWithDelay();
  }

  private resetAllStates(): void {
    this.$login = false;
    this.$signUp = false;
    this.$avatar = false;
    this.$resetPW = false;
    this.$setPW = false;
    this.$imprint = false;
    this.$privacy = false;
  }

  private startAnimationWithDelay(): void {
    setTimeout(() => {
      this.animated = true;
    }, 2500);
  }

  toCreatAcc(): void {
    this.router.navigate(['/signUp']);
  }

  toImprint(): void {
    this.router.navigate(['/landing-page/imprint']);
  }

  toPrivacy(): void {
    this.router.navigate(['/landing-page/privacy']); 
  }
}
