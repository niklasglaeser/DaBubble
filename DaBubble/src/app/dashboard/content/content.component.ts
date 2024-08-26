import { Component } from '@angular/core';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ThreadWindowComponent } from './thread-window/thread-window.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DmWindowComponent } from './dm-window/dm-window.component';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [ChatWindowComponent, ThreadWindowComponent, SidebarComponent, DmWindowComponent],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent {

}
