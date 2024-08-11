import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LandingPageComponent } from '../landing-page.component';

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

  constructor (private lp: LandingPageComponent){}

  backToLogin(){
    this.lp.$imprint = false
    this.lp.$login = true
  }

}
