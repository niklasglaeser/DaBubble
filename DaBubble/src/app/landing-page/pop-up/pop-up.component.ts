import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LandingPageComponent } from '../landing-page.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pop-up',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './pop-up.component.html',
  styleUrl: './pop-up.component.scss'
})
/**
 * The PopUpComponent class manages the display and interaction of pop-up elements within the application.
 * 
 * This component is responsible for handling any pop-up related functionality and interacts with the LandingPageComponent 
 * to manage UI states.
 */
 export class PopUpComponent {
  lp = inject(LandingPageComponent);  // Injects the LandingPageComponent to manage UI states related to the pop-up.

  /**
   * Constructor for PopUpComponent.
   * 
   * Initializes the component and ensures it has access to the landing page's UI management services.
   */
  constructor() {}
}

