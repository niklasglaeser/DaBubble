import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Message } from '../../../../models/message.model';
import { DirectMessagesService } from '../../../../services/direct-message.service';
import { Observable } from 'rxjs';
import { UserLogged } from '../../../../models/user-logged.model';

@Component({
  selector: 'app-dm-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dm-footer.component.html',
  styleUrl: './dm-footer.component.scss'
})
export class DmFooterComponent {
  recipientUser$: Observable<UserLogged | null>;

  constructor(private dmService: DirectMessagesService) {
    this.recipientUser$ = this.dmService.recipientUser$;
  }

  sendMessage(): void {
    const textarea = document.getElementById('dm-message-input') as HTMLTextAreaElement;
    const messageText = textarea.value;

    if (messageText) {
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

  @HostListener('keyup.enter', ['$event'])
  onEnter(event: KeyboardEvent): void {
    this.sendMessage();
  }

}
