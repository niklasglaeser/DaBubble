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
export class PopUpComponent {
  lp = inject(LandingPageComponent)
  
}
