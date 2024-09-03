import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LandingPageComponent } from '../landing-page.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})

export class PrivacyPolicyComponent {
  router = inject(Router)
  mobileVersion?: boolean

  constructor(private lp: LandingPageComponent){}

  ngOnInit() {
    this.lp.$mobileVersion.subscribe(isMobile => {
      this.mobileVersion = isMobile;
    });
  }

  backToLogin(){
    this.lp.resetAllStates()
     this.lp.$login = true
   }
}
