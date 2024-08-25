import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Message } from '../../../../models/message.model';
import { Observable, Subscription } from 'rxjs';
import { UserLogged } from '../../../../models/user-logged.model';
import { ThreadService } from '../../../../services/thread.service';


@Component({
  selector: 'app-chat-messages',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './chat-messages.component.html',
  styleUrls: ['./chat-messages.component.scss'],
  providers: [DatePipe],
})
export class ChatMessagesComponent implements OnInit, OnDestroy {
  @Input() messages$: Observable<Message[]> | undefined;
  @Input() currentUser: UserLogged | null = null;
  @Input() channelId: string = '';
  @Input() threadCounts: Map<string, number> = new Map<string, number>();
  @Input() lastThreadMessageTimes: Map<string, Date | null> = new Map<string, Date | null>();


  selectedMessage: Message | null = null;
  private userSubscription: Subscription | undefined;

  constructor(
    private datePipe: DatePipe,
    private threadService: ThreadService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
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
    console.log(this.lastThreadMessageTimes.get(messageId));
    
    return this.lastThreadMessageTimes.get(messageId) || null;
  }

  openThread(channelId: string, messageId: string, originMessage: Message) {
    this.threadService.checkAndCreateThread(channelId, messageId, originMessage);
    const threadWindow = document.querySelector('.thread-window') as HTMLElement;
    if (threadWindow) {threadWindow.classList.add('open');}
  }
}
