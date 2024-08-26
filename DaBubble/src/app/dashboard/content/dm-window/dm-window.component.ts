import { Component } from '@angular/core';
import { DmHeaderComponent } from './dm-header/dm-header.component';
import { DmMessagesComponent } from './dm-messages/dm-messages.component';
import { DmFooterComponent } from './dm-footer/dm-footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dm-window',
  standalone: true,
  imports: [DmHeaderComponent, DmMessagesComponent, DmFooterComponent, CommonModule],
  templateUrl: './dm-window.component.html',
  styleUrl: './dm-window.component.scss'
})
export class DmWindowComponent {

}
