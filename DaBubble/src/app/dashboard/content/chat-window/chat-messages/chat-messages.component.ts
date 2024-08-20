import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../../../models/message.model';
import { Observable } from 'rxjs';
import { Channel } from '../../../../models/channel.class';

@Component({
  selector: 'app-chat-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-messages.component.html',
  styleUrls: ['./chat-messages.component.scss'],
})
export class ChatMessagesComponent {
  @Input() messages$: Observable<Message[]> | undefined;
}
