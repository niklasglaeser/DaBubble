import { Component, OnInit } from '@angular/core';
import { ThreadHeaderComponent } from './thread-header/thread-header.component';
import { ThreadMessagesComponent } from './thread-messages/thread-messages.component';
import { ThreadFooterComponent } from './thread-footer/thread-footer.component';
import { Message } from '../../../models/message.model';
import { combineLatest, map, Observable } from 'rxjs';
import { ThreadService } from '../../../services/thread.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/lp-services/auth.service';
import { UserService } from '../../../services/user.service';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-thread-window',
  standalone: true,
  imports: [
    ThreadHeaderComponent,
    ThreadMessagesComponent,
    ThreadFooterComponent,
  ],
  templateUrl: './thread-window.component.html',
  styleUrl: './thread-window.component.scss',
})
export class ThreadWindowComponent implements OnInit {
  channelId: string | null = null;
  messageId: string | null = null;
  originMessage: Message | null = null;
  threadMessages$: Observable<Message[]> | undefined;
  threadMessageCount$: Observable<number> | undefined;
  currentUserId: string | undefined = '';

  constructor(
    private threadService: ThreadService,
    private authService: AuthService,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.threadService.selectedMessage$.subscribe((data) => {
      if (data) {
        this.channelId = data.channelId;
        this.messageId = data.messageId;
        this.originMessage = data.originMessage;
        this.loadThreadMessages();
        this.getCurrentUserId();
        this.loadThreadMessageCount();
      }
    });
  }

  loadThreadMessages() {
    if (this.channelId && this.messageId) {
      this.threadMessages$ = this.messageService
        .getThreadMessagesWithUsers(this.channelId, this.messageId)
        .pipe(
          map((threadMessages) => {
            // Filtere die originMessage aus den Thread-Nachrichten heraus
            return threadMessages.filter(
              (message) => message.id !== this.originMessage?.id
            );
          })
        );
    }
  }

  loadThreadMessageCount() {
    if (this.channelId && this.messageId) {
      this.threadMessageCount$ = this.threadService.getThreadMessageCount(
        this.channelId,
        this.messageId
      );
    }
  }

  getCurrentUserId() {
    const currentUser = this.authService.currentUserSig();
    this.currentUserId = currentUser?.userId;
  }
}
