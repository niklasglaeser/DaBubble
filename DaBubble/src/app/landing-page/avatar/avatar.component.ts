import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import { LandingPageComponent } from '../landing-page.component';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    LandingPageComponent
  ],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {
 avatar: string [] = [
  "assets/img/landing-page/women1.svg",
  "assets/img/landing-page/men1.svg",
  "assets/img/landing-page/men2.svg",
  "assets/img/landing-page/men3.svg",
  "assets/img/landing-page/women2.svg",
  "assets/img/landing-page/men4.svg",
  ]
}
