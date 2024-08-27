import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DmWindowComponent } from '../dm-window.component';

@Component({
  selector: 'app-dm-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dm-header.component.html',
  styleUrl: './dm-header.component.scss'
})
export class DmHeaderComponent {

}
