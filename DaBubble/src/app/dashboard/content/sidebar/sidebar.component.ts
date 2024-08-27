import { Component, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { DialogAddChannelComponent } from '../../../dialog/dialog-add-channel/dialog-add-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogChannelEditComponent } from '../../../dialog/dialog-channel-edit/dialog-channel-edit.component';
import { ChannelService } from '../../../services/channel.service';
import { Subscription } from 'rxjs';
import { Channel } from '../../../models/channel.class';
import { WorkspaceToggleComponent } from '../../../dialog/workspace-toggle/workspace-toggle.component';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { UserService } from '../../../services/user.service';
import { UserLogged } from '../../../models/user-logged.model';
import { ChannelStateService } from '../../../services/channel-state.service';
import { AuthService } from '../../../services/lp-services/auth.service';
import { DirectMessagesService } from '../../../services/direct-message.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [DialogAddChannelComponent, WorkspaceToggleComponent, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  animations: [
    trigger('slideInOut', [
      state(
        'in',
        style({
          transform: 'translateX(0%)',
          display: 'flex'
        })
      ),
      state(
        'out',
        style({
          transform: 'translateX(-100%)',
          display: 'none'
        })
      ),
      transition('in => out', animate('125ms ease-in')),
      transition('out => in', animate('125ms ease-out'))
    ])
  ]
})
export class SidebarComponent implements OnInit {
  @ViewChild('dialogAddChannel')
  dialogAddChannelComponent!: DialogAddChannelComponent;

  @Output() conversationSet = new EventEmitter<void>();

  workspaceVisible: boolean = true;
  showWorkspaceToggle = true;

  isChannelsDropdownOpen = true;
  isMessagesDropdownOpen = true;
  isActive = false;
  isOnline = true;
  isDirectChat = false;

  channels: any = [];
  channelsSubscription!: Subscription;
  selectedChannelId: string | null = null;

  users: UserLogged[] = [];
  unsubscribe: any;

  constructor(public dialog: MatDialog, private channelService: ChannelService, private userService: UserService, private channelStateService: ChannelStateService, private authService: AuthService, private dmService: DirectMessagesService) {
    this.checkWindowSize();
  }

  ngOnInit(): void {
    this.userService.users$.subscribe((users) => {
      this.users = users;
    });

    this.channelService.channels$.subscribe((channels) => {
      this.channels = channels;
      // this.channels = channels.sort((a, b) => a.name.localeCompare(b.name));

      if (this.channels.length > 0) {
        // this.openChannel(this.channels[0].id);
      }
    });
  }

  getList(): Channel[] {
    return this.channelService.channels;
    // return this.channelService.channels.sort((a, b) => a.name.localeCompare(b.name));
  }

  addChannel() {
    const dialogRef = this.dialog.open(DialogAddChannelComponent);

    dialogRef.afterClosed().subscribe((result) => {});
  }

  /*TESTING*/
  openEditDialog(channelId: string) {
    const dialogRef = this.dialog.open(DialogChannelEditComponent, {
      data: { channelId: channelId }
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }
  /*TESTING*/

  toggleWorkspace() {
    this.workspaceVisible = !this.workspaceVisible;
  }

  openChannel(channelId: string) {
    let dmWindow = document.querySelector('.dm-window') as HTMLElement;
    let chatWindow = document.querySelector('.chat-window') as HTMLElement;
    if (dmWindow && chatWindow) {
      dmWindow.style.display = 'none';
      chatWindow.style.display = 'flex';
    }
    this.selectedChannelId = channelId;
    this.channelStateService.setSelectedChannelId(channelId);
  }


  openDirectmessage(userId: string,) {
    let recipientId = userId;
    let currentUser = this.authService.currentUserSig();
    let currentUserId = currentUser!.userId;

    this.dmService.setConversationMembers(currentUserId, recipientId).then(() => {
      // Notify the DM window that the conversation is ready to be loaded
      this.conversationSet.emit();
    });

    console.log('open Directmessage for User' + userId);
    let dmWindow = document.querySelector('.dm-window') as HTMLElement;
    let chatWindow = document.querySelector('.chat-window') as HTMLElement;
    if (dmWindow && chatWindow) {
      dmWindow.style.display = 'flex';
      chatWindow.style.display = 'none';
    }
  }

  toggleDropdown(menu: string) {
    if (menu === 'channels') {
      this.isChannelsDropdownOpen = !this.isChannelsDropdownOpen;
    } else if (menu === 'messages') {
      this.isMessagesDropdownOpen = !this.isMessagesDropdownOpen;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkWindowSize();
  }

  checkWindowSize() {
    this.showWorkspaceToggle = window.innerWidth <= 1980;
  }
}
