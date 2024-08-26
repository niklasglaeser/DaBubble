import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Message } from '../../../../models/message.model';
import { Observable, Subscription } from 'rxjs';
import { UserLogged } from '../../../../models/user-logged.model';
import { ThreadService } from '../../../../services/thread.service';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../../../services/message.service';

@Component({
  selector: 'app-chat-messages',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './chat-messages.component.html',
  styleUrls: ['./chat-messages.component.scss'],
  providers: [DatePipe],
})
export class ChatMessagesComponent implements OnInit, OnDestroy {
  @Input() messages$: Observable<Message[]> | undefined;
  @Input() currentUser: UserLogged | null = null;
  @Input() channelId: string = '';
  @Input() threadCounts: Map<string, number> = new Map<string, number>();
  @Input() lastThreadMessageTimes: Map<string, Date | null> = new Map<
    string,
    Date | null
  >();

  selectedMessage: Message | null = null;
  editMessageClicked: boolean = false;
  editMessageText: string = '';

  private userSubscription: Subscription | undefined;

  constructor(
    private datePipe: DatePipe,
    private threadService: ThreadService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channelId'] && !changes['channelId'].isFirstChange()) {
      this.closeEditMode();
    }
  }

  editMessage(message: Message) {
    if (this.currentUser && message.senderId === this.currentUser.uid) {
      this.editMessageClicked = true;
      this.editMessageText = message.message;
      this.selectedMessage = message;
    }
  }

  async saveEditedMessage() {
    if (this.selectedMessage) {
      try {
        this.selectedMessage.message = this.editMessageText;
        await this.messageService.updateMessage(
          this.channelId,
          this.selectedMessage.id!,
          this.editMessageText
        );
        this.editMessageClicked = false;
        this.selectedMessage = null;
        this.editMessageText = '';

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

  getReplayCount(messageId: string): boolean {
    const count = this.threadCounts.get(messageId);
    return count !== undefined && count > 0;
  }

  getAnswerTime(messageId: string): Date | null {
    return this.lastThreadMessageTimes.get(messageId) || null;
  }

  openThread(channelId: string, messageId: string, originMessage: Message) {
    this.threadService.checkAndCreateThread(
      channelId,
      messageId,
      originMessage
    );
    const threadWindow = document.querySelector(
      '.thread-window'
    ) as HTMLElement;
    if (threadWindow) {
      threadWindow.classList.add('open');
    }
  }
}
