import { Component, Input, SimpleChanges } from '@angular/core';
import { Message } from '../../../../models/message.model';
import { CommonModule, DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { MessageService } from '../../../../services/message.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-thread-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './thread-messages.component.html',
  styleUrl: './thread-messages.component.scss',
  providers: [DatePipe],
})
export class ThreadMessagesComponent {
  @Input() originMessage: Message | null = null;
  @Input() threadMessages$: Observable<Message[]> | undefined;
  @Input() threadMessageCount$: Observable<number> | undefined;
  @Input() currentUserId: string | null = null;
  @Input() channelId: string = '';

  selectedMessage: Message | null = null;
  editMessageClicked: boolean = false;
  editMessageText: string = '';

  constructor(
    private datePipe: DatePipe,
    private messageService: MessageService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channelId'] && !changes['channelId'].isFirstChange()) {
      this.closeEditMode();
    }
  }

  editMessage(message: Message) {
    if (message.senderId === this.currentUserId) {
      this.editMessageClicked = true;
      this.editMessageText = message.message;
      this.selectedMessage = message;
    }
  }

  async saveEditedMessage() {
    if (this.selectedMessage) {
      try {
        await this.messageService.updateThreadMessage(
          this.channelId,
          this.originMessage?.id!,
          this.selectedMessage.id!,
          this.editMessageText
        );
        this.closeEditMode();

        console.log('Message successfully saved.');
      } catch (e) {
        console.error('Error saving message:', e);
      }
    }
  }

  cancelEdit() {
    this.closeEditMode();
  }

  closeEditMode() {
    this.editMessageClicked = false;
    this.selectedMessage = null;
    this.editMessageText = '';
  }

  formatTime(timestamp: Date): string {
    const date = new Date(timestamp);
    return this.datePipe.transform(date, 'HH:mm') || '';
  }

  formatDate(timestamp: Date): string {
    const date = new Date(timestamp);
    const today = new Date();

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return 'Heute';
    } else {
      return this.datePipe.transform(date, 'EEEE, dd. MMMM yyyy') || '';
    }
  }
}
