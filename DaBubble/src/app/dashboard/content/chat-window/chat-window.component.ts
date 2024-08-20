import { Component, OnInit } from '@angular/core';
import { ChatHeaderComponent } from './chat-header/chat-header.component';
import { ChatMessagesComponent } from './chat-messages/chat-messages.component';
import { ChatFooterComponent } from './chat-footer/chat-footer.component';
import { ChannelStateService } from '../../../services/channel-state.service';
import { UserService } from '../../../services/user.service';
import { ChannelService } from '../../../services/channel.service';
import { Channel } from '../../../models/channel.class';
import { UserLogged } from '../../../models/user-logged.model';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [ChatHeaderComponent, ChatMessagesComponent, ChatFooterComponent],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss',
})
export class ChatWindowComponent implements OnInit {
  channelId: string | null = null;
  channel: Channel | null = null;
  members: UserLogged[] = [];
  unsubscribe: (() => void) | undefined;

  constructor(
    private channelService: ChannelService,
    private userService: UserService,
    private channelStateService: ChannelStateService
  ) {}

  ngOnInit() {
    this.channelStateService.selectedChannelId$.subscribe((channelId) => {
      if (channelId) {
        if (this.unsubscribe) {
          this.unsubscribe();
        }
        this.channelId = channelId;
        const subscription = this.channelService
          .loadChannelData(this.channelId)
          .subscribe((channel) => {
            this.channel = channel;
            if (this.channel && this.channel.members) {
              this.loadChannelMembers(this.channel.members);
            }
          });
        this.unsubscribe = () => subscription.unsubscribe();
      }
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
    console.log('Loaded user:', this.members);
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  /*subscribe observable - zeile 49 channel.service*/
  /*
  subscribeToChannelData() {
    if (this.channelId) {
      const subscription = this.channelService
        .loadChannelData(this.channelId)
        .subscribe((channel) => {
          this.channel = channel;
          if (this.channel && this.channel.members) {
            this.loadChannelMembers(this.channel.members);
            console.log(this.channel.members);
          }
        });

      this.unsubscribe = () => subscription.unsubscribe();
    }
  }
  */
  /*subscribe observable - zeile 49 channel.service*/

  // subscribeToChannelData() {
  //   if (this.channelId) {
  //     this.unsubscribe = this.channelService.loadChannelData(
  //       this.channelId,
  //       (channel) => {
  //         this.channel = channel;
  //         if (this.channel && this.channel.members) {
  //           this.loadChannelMembers(this.channel.members);
  //           console.log(this.channel.members);
  //         }
  //       }
  //     );
  //   }
  // }
}
