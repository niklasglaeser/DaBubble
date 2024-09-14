import { Component, OnInit, ViewChild } from '@angular/core';
import { ThreadHeaderComponent } from './thread-header/thread-header.component';
import { ThreadMessagesComponent } from './thread-messages/thread-messages.component';
import { ThreadFooterComponent } from './thread-footer/thread-footer.component';
import { Message } from '../../../models/message.model';
import { map, Observable, Subscription } from 'rxjs';
import { ThreadService } from '../../../services/thread.service';
import { AuthService } from '../../../services/lp-services/auth.service';
import { UserService } from '../../../services/user.service';
import { MessageService } from '../../../services/message.service';
import { ChannelService } from '../../../services/channel.service';

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
  @ViewChild(ThreadMessagesComponent)
  threadMessagesComponent!: ThreadMessagesComponent;
  channelId: string = '';
  channelName: string | undefined = '';
  messageId: string = '';
  originMessage: Message | null = null;
  threadMessages$: Observable<Message[]> | undefined;
  threadMessageCount$: Observable<number> | undefined;
  currentUserId: string | null = null;

  private subscriptions = new Subscription();

  constructor(private threadService: ThreadService, private authService: AuthService, private userService: UserService, private messageService: MessageService, private channelService: ChannelService) { }

  ngOnInit(): void {
    this.threadService.selectedMessage$.subscribe((data) => {
      if (data) {
        this.channelId = data.channelId;
        this.messageId = data.messageId;
        this.originMessage = data.originMessage;
        this.loadChannelName();
        this.loadThreadMessages();
        this.getCurrentUserId();
        this.loadThreadMessageCount();
        this.subscribeToOriginMessage();
      }
    });
  }

  subscribeToOriginMessage() {
    if (this.channelId && this.messageId) {
      this.subscriptions.add(
        this.messageService.getSingleMessageWithReactions(this.channelId, this.messageId).subscribe((updatedMessage) => {
          if (updatedMessage) {this.originMessage = updatedMessage;}
        })
      );
    }
  }

  loadThreadMessages() {
    if (this.channelId && this.messageId) {
      this.threadMessages$ = this.messageService
        .getThreadMessagesWithUsers(this.channelId, this.messageId)
        .pipe(map((threadMessages) => {
            return threadMessages.filter((message) => message.id !== this.originMessage?.id);
          })
        );
    }
  }

  loadThreadMessageCount() {
    if (this.channelId && this.messageId) {
      this.threadMessageCount$ = this.threadService.getThreadMessageCount(this.channelId, this.messageId);
    }
  }

  loadChannelName() {
    if (this.channelId) {
      this.channelService.loadChannelData(this.channelId, (channel) => {
        if (channel) {this.channelName = channel.name;}
        else {this.channelName = 'Unbekannter Kanal';}
      });
    }
  }

  onCloseThread() {
    if (this.threadMessagesComponent) {this.threadMessagesComponent.closeEditMode();}
    let threadWindow = document.querySelector('.thread-window') as HTMLElement;
    if (threadWindow) {threadWindow.classList.remove('open');}
  }

  getCurrentUserId() {
    let currentUser = this.authService.currentUserSig();
    this.currentUserId = currentUser?.userId ?? null;
  }
}
