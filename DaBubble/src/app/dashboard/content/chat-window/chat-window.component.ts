import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @Output() threadOpened = new EventEmitter<void>();
  @ViewChild('chatMessageInput', { static: false }) chatMessageInput!: ElementRef;
  @ViewChild(ChatFooterComponent) chatFooterComponent!: ChatFooterComponent;


  showChatMessage: boolean = true;
  private previousMessageCount: number = 0;
  channelId: string = '';
  channel: Channel | null = null;

  members: UserLogged[] = [];
  users: UserLogged[] = [];

  messages$: Observable<Message[]> | undefined;
  threadCounts: Map<string, number> = new Map<string, number>();
  lastThreadMessageTimes: Map<string, Date | null> = new Map<string, Date | null>();

  currentUser: UserLogged | null = null;
  userId: string | null = null;

  deviceType: 'mobile' | 'tablet' | 'desktop' | undefined;

  unsubscribe: (() => void) | undefined;

  constructor(private channelService: ChannelService, private userService: UserService, private messageService: MessageService, private channelStateService: ChannelStateService, private authService: AuthService, private threadService: ThreadService, private deviceService: DeviceService) { }

  ngOnInit() {
    this.loadAllUsers();
    this.channelStateService.selectedChannelId$.subscribe(async (channelId) => {
      if (channelId) {
        this.channelId = channelId;
        this.subscribeToChannelData();
        this.loadMessages(channelId);
        await this.getCurrentUserId();
        if (this.userId) { this.loadCurrentUser(this.userId); }
        this.scrollToBottom();
        if (this.chatFooterComponent) {
          this.chatFooterComponent.clearInput();
        }
      }
    });
  }
  // this.deviceService.deviceType$.subscribe((type) => {this.deviceType = type;})

  ngOnDestroy() {
    if (this.unsubscribe) { this.unsubscribe(); }
  }

  subscribeToChannelData() {
    if (this.channelId) {
      this.unsubscribe = this.channelService.loadChannelData(
        this.channelId,
        (channel) => {
          this.channel = channel;
          if (this.channel && this.channel.members) { this.loadChannelMembers(this.channel.members); }
        }
      );
    }
  }

  loadMessages(channelId: string) {
    this.messages$ = this.messageService.getMessagesWithUsers(channelId);
    this.messages$.subscribe((messages) => {
      this.countMessages(messages)
      messages.forEach((message) => {
        let messageId = message.id;
        this.threadService.getThreadMessageCount(this.channelId, messageId!)
          .subscribe((count) => { this.threadCounts.set(messageId!, count); });
        this.threadService.getLastThreadMessageTime(this.channelId, messageId!)
          .subscribe((lastMessageTime) => { this.lastThreadMessageTimes.set(messageId!, lastMessageTime); });
      });
    });
  }

  countMessages(messages: any) {
    let newMessageCount = messages.length;
    if (newMessageCount > this.previousMessageCount && this.isUserAtBottom()) { setTimeout(() => { this.scrollToBottom(); }, 500); }
    this.previousMessageCount = newMessageCount;
  }


  private isUserAtBottom(): boolean {
    let element = this.chatContainer.nativeElement;
    let threshold = 150;
    let position = element.scrollTop + element.offsetHeight;
    let height = element.scrollHeight;

    return position > height - threshold;
  }

  async loadChannelMembers(memberIds: string[]): Promise<void> {
    const memberPromises = memberIds.map(userId => this.userService.getSingleUserObj(userId));
    const members = (await Promise.all(memberPromises)).filter(user => user !== null) as UserLogged[];
    this.members = members;
  }

  async loadAllUsers() {
    this.userService.users$.subscribe((users) => { this.users = users; });
  }

  async loadCurrentUser(userId: string) {
    let user = await this.userService.getSingleUserObj(userId);
    if (user) { this.currentUser = user; }
  }

  async getCurrentUserId() {
    const currentUser = this.authService.currentUserSig();
    if (currentUser) { this.userId = currentUser.userId; }
  }

  /*
  scrollToMessage(messageId: string): void {
    let messageElement = document.getElementById(messageId);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('highlight');
      setTimeout(() => {
        messageElement.classList.remove('highlight');
      }, 2000);
    } else {
      console.warn('Nachricht nicht gefunden: ', messageId);
    }
  }
  */

  openThread() {
    this.threadOpened.emit();
    console.log('Thread from cht-window');
  }

  toggleChatMessage() {
    this.showChatMessage = !this.showChatMessage;
  }

  scrollToBottom(): void {
    if (this.chatContainer && this.chatContainer.nativeElement) {
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }, 500);
    }
  }

}
