import { Component, Input } from '@angular/core';
import { MessageService } from '../../../../services/message.service';
import { Message } from '../../../../models/message.model';
import { Timestamp } from '@angular/fire/firestore';
import { Channel } from '../../../../models/channel.class';

@Component({
  selector: 'app-chat-footer',
  standalone: true,
  templateUrl: './chat-footer.component.html',
  styleUrls: ['./chat-footer.component.scss']
})
export class ChatFooterComponent {
  @Input() channel: Channel | null = null;
  constructor(private messageService: MessageService) {}

  sendMessage(): void {
    const textarea = document.getElementById('chat-message-input') as HTMLTextAreaElement;
    const messageText = textarea.value;
  
    if (messageText.trim()) {
      const message: Message = {
        message: messageText,
        senderId: '',
        senderName: '',
        created_at: new Date(),
        updated_at: new Date()
      };
  
      const channelId = this.channel?.id;
      
      if (channelId) { // Ensure channelId is a valid string
        this.messageService.addMessage(channelId, message).then(() => {
          textarea.value = '';
        });
      } else {
        console.error('Channel ID is undefined.');
      }
    }
  }
}
