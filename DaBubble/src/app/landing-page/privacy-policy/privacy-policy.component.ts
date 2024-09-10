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

/**
 * The PrivacyPolicyComponent class manages the display and interactions for the privacy policy page.
 * 
 * This component is responsible for showing the privacy policy content and providing navigation options 
 * based on whether the application is being viewed on a mobile device. It also provides functionality to 
 * navigate back to the login screen.
 */
 export class PrivacyPolicyComponent {
  router = inject(Router);  // Injects the Angular Router for navigation.
  mobileVersion?: boolean;  // Indicates whether the app is being viewed on a mobile device.

  /**
   * Constructor for PrivacyPolicyComponent.
   * 
   * @param {LandingPageComponent} lp - Instance of the landing page component to manage UI interactions.
   */
  constructor(private lp: LandingPageComponent) {}

  /**
   * Initializes the component and sets the mobile version state based on the observable from the landing page service.
   * 
   * @returns {void} - Does not return anything.
   */
  ngOnInit(): void {
    this.lp.$mobileVersion.subscribe(isMobile => {
      this.mobileVersion = isMobile;
    });
  }

  /**
   * Resets the application state and navigates back to the login screen.
   * 
   * This function resets all states in the landing page service and sets the login state to `true`.
   * 
   * @returns {void} - Does not return anything.
   */
  backToLogin(): void {
    this.lp.resetAllStates();
    this.lp.$login = true;
  }
}

