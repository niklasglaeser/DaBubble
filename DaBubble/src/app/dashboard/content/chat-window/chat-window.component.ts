import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ChatHeaderComponent } from './chat-header/chat-header.component';
import { ChatMessagesComponent } from './chat-messages/chat-messages.component';
import { ChatFooterComponent } from './chat-footer/chat-footer.component';
import { ChannelStateService } from '../../../services/channel-state.service';
import { UserService } from '../../../services/user.service';
import { ChannelService } from '../../../services/channel.service';
import { Channel } from '../../../models/channel.class';
import { UserLogged } from '../../../models/user-logged.model';
import { Observable } from 'rxjs';
import { Message } from '../../../models/message.model';
import { MessageService } from '../../../services/message.service';
import { AuthService } from '../../../services/lp-services/auth.service';
import { CommonModule } from '@angular/common';
import { ThreadService } from '../../../services/thread.service';
import { DeviceService } from '../../../services/device.service';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    ChatHeaderComponent,
    ChatMessagesComponent,
    ChatFooterComponent,
    CommonModule,
  ],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss',
})
export class ChatWindowComponent implements OnInit {
  @Input() workspaceVisible: boolean = true;
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  showChatMessage: boolean = true;

  channelId: string = '';
  channel: Channel | null = null;

  members: UserLogged[] = [];
  users: UserLogged[] = [];

  messages$: Observable<Message[]> | undefined;
  threadCounts: Map<string, number> = new Map<string, number>();
  lastThreadMessageTimes: Map<string, Date | null> = new Map<
    string,
    Date | null
  >();

  currentUser: UserLogged | null = null;
  userId: string | null = null;

  deviceType: 'mobile' | 'tablet' | 'desktop' | undefined;

  unsubscribe: (() => void) | undefined;

  constructor(
    private channelService: ChannelService,
    private userService: UserService,
    private messageService: MessageService,
    private channelStateService: ChannelStateService,
    private authService: AuthService,
    private threadService: ThreadService,
    private deviceService: DeviceService
  ) { }

  ngOnInit() {
    this.loadAllUsers();
    this.channelStateService.selectedChannelId$.subscribe(async (channelId) => {
      if (channelId) {
        this.channelId = channelId;
        this.subscribeToChannelData();
        this.loadMessages(channelId);
        await this.getCurrentUserId();
        if (this.userId) {
          this.loadCurrentUser(this.userId);
        }
      }
    });

    this.deviceService.deviceType$.subscribe((type) => {
      this.deviceType = type;
    })
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  subscribeToChannelData() {
    if (this.channelId) {
      this.unsubscribe = this.channelService.loadChannelData(
        this.channelId,
        (channel) => {
          this.channel = channel;
          if (this.channel && this.channel.members) {
            this.loadChannelMembers(this.channel.members);
          }
        }
      );
    }
  }

  loadMessages(channelId: string) {
    this.messages$ = this.messageService.getMessagesWithUsers(channelId);
    this.messages$.subscribe((messages) => {
      messages.forEach((message) => {
        const messageId = message.id;
        this.threadService
          .getThreadMessageCount(this.channelId, messageId!)
          .subscribe((count) => {
            this.threadCounts.set(messageId!, count);
          });
        this.threadService
          .getLastThreadMessageTime(this.channelId, messageId!)
          .subscribe((lastMessageTime) => {
            this.lastThreadMessageTimes.set(messageId!, lastMessageTime);
          });
      });
    });
  }

  async loadChannelMembers(memberIds: string[]): Promise<void> {
    const members: UserLogged[] = [];
    for (const userId of memberIds) {
      const user = await this.userService.getSingleUserObj(userId);
      if (user) {
        members.push(user);
      } else {
        console.error(`User with ID ${userId} could not be found.`);
      }
    }
    this.members = members;
  }

  async loadAllUsers() {
    this.userService.users$.subscribe((users) => {
      this.users = users;
    });
  }

  async loadCurrentUser(userId: string) {
    let user = await this.userService.getSingleUserObj(userId);
    if (user) {
      this.currentUser = user;
    }
  }

  async getCurrentUserId() {
    const currentUser = this.authService.currentUserSig();
    if (currentUser) {
      this.userId = currentUser.userId;
    }
  }

  scrollToMessage(messageId: string): void {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Optional: Nachricht hervorheben
      messageElement.classList.add('highlight');
      setTimeout(() => {
        messageElement.classList.remove('highlight');
      }, 2000);
    } else {
      console.warn('Nachricht nicht gefunden: ', messageId);
    }
  }

  toggleChatMessage() {
    this.showChatMessage = !this.showChatMessage;
  }
}
