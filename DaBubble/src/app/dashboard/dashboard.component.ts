import { Component } from '@angular/core';
import { ChatWindowComponent } from './content/chat-window/chat-window.component';
import { HeaderComponent } from './header/header.component';
import { ContentComponent } from "./content/content.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ChatWindowComponent, HeaderComponent, ContentComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
