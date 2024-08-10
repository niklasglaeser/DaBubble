import { Component } from '@angular/core';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ThreadWindowComponent } from './thread-window/thread-window.component';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [ChatWindowComponent, ThreadWindowComponent],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent {

}
