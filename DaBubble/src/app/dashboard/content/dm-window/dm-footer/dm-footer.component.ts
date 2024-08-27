import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Message } from '../../../../models/message.model';
import { DirectMessagesService } from '../../../../services/direct-message.service';

@Component({
  selector: 'app-dm-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dm-footer.component.html',
  styleUrl: './dm-footer.component.scss'
})
export class DmFooterComponent {

  constructor (private dmService: DirectMessagesService) {}

  sendMessage(): void {
    const textarea = document.getElementById('dm-message-input') as HTMLTextAreaElement;
    const messageText = textarea.value;

    if (messageText.trim()) {
      const message: Message = {
        message: messageText,
        senderId: '',
        created_at: new Date(),
      };

      this.dmService.addMessage(message).then(() => {
        textarea.value = '';
      });
      console.log('send');
    }
  }

}
