import { Component } from '@angular/core';
import { ChatHeaderComponent } from "./chat-header/chat-header.component";
import { ChatMessagesComponent } from "./chat-messages/chat-messages.component";
import { ChatFooterComponent } from "./chat-footer/chat-footer.component";

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [ChatHeaderComponent, ChatMessagesComponent, ChatFooterComponent],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss'
})
export class ChatWindowComponent {

}
