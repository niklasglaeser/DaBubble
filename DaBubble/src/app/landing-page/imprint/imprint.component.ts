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
export class ImprintComponent {
  router = inject(Router)

  constructor (private lp: LandingPageComponent){}

  backToLogin(){
    this.router.navigate(['/landing-page/login']);
  }

}
