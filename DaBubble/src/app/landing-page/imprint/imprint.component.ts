import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LandingPageComponent } from '../landing-page.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
/**
 * The ImprintComponent class handles the imprint page and its interactions.
 * 
 * This component is responsible for displaying the imprint information and managing the state based on 
 * whether the application is viewed on a mobile device. It also provides navigation back to the login screen.
 */
 export class ImprintComponent {
  router = inject(Router);  // Injects the Angular Router for navigation.
  mobileVersion: boolean = false;  // Indicates whether the app is being viewed on a mobile device.

  /**
   * Constructor for ImprintComponent.
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

