import { Component, Input, OnInit } from '@angular/core';
import { MessageService } from '../../../../services/message.service';
import { Message } from '../../../../models/message.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Channel } from '../../../../models/channel.class';

@Component({
  selector: 'app-chat-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-messages.component.html',
  styleUrls: ['./chat-messages.component.scss']
})
export class ChatMessagesComponent implements OnInit {
  @Input() channel: Channel | null = null;
  messages$: Observable<Message[]> | undefined;

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {

    const channelId = this.channel?.id;
    console.log('chat messages' + channelId)
    if (channelId) {
      this.messages$ = this.messageService.getMessages(channelId);
    }
  }
}
