import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
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
      transition('in => out', animate('175ms ease-in')),
      transition('out => in', animate('175ms ease-out'))
    ])
  ]
})
export class SidebarComponent implements OnInit {
  @ViewChild('dialogAddChannel')
  dialogAddChannelComponent!: DialogAddChannelComponent;

  @Output() conversationSet = new EventEmitter<void>();
  @Input() workspaceVisible: boolean = true;

  isChannelsDropdownOpen = true;
  isMessagesDropdownOpen = true;
  isActive = false;
  isOnline = true;
  isDirectChat = false;
  selectedUserId: string | null = null;

  channels: any = [];
  channelsSubscription!: Subscription;
  selectedChannelId: string | null = null;

  users: UserLogged[] = [];
  directMessagesUsers: UserLogged[] = [];
  unsubscribe: any;

  constructor(public dialog: MatDialog, private channelService: ChannelService, private userService: UserService, private channelStateService: ChannelStateService, private authService: AuthService, private dmService: DirectMessagesService) {

  }

  get currentUserId(): string | undefined {
    return this.authService.currentUserSig()?.userId;
  }

  ngOnInit(): void {
    this.userService.users$.subscribe((users) => {
      this.users = users;
    });

    this.channelService.channels$.subscribe((channels) => {
      this.channels = channels;
      // this.channels = channels.sort((a, b) => a.name.localeCompare(b.name));

      if (this.channels.length > 0) {
        this.openChannel(this.channels[0].id);
      }
    });
    this.channelStateService.emitOpenDirectMessage.subscribe((userId: string) => {
      this.openDirectmessage(userId);
    });

    this.userService.userSearchSelected.subscribe((userId: string) => {
      this.openDirectmessage(userId);
    });
    this.userService.channelSearchSelect.subscribe((channelId: string) => {
      this.openChannel(channelId);
    });

    this.loadDmConvos();
  }

  loadDmConvos() {
    const currentUserId = this.currentUserId;
    if (currentUserId) {
      this.dmService.setCurrentUserId(currentUserId);
      console.log('DER FEHLER: ' + this.directMessagesUsers);
  
      this.dmService.conversations$.subscribe(users => {
        this.directMessagesUsers = users;
      });
    } else {
      console.error('Current user ID is undefined, unable to load direct message conversations.');
    }
  }
  

  getList(): Channel[] {
    return this.channelService.channels;
    // return this.channelService.channels.sort((a, b) => a.name.localeCompare(b.name));
  }

  addChannel() {
    const dialogRef = this.dialog.open(DialogAddChannelComponent);

    dialogRef.afterClosed().subscribe((result) => { });
  }

  /*TESTING*/
  openEditDialog(channelId: string) {
    const dialogRef = this.dialog.open(DialogChannelEditComponent, {
      data: { channelId: channelId }
    });
    console.log(this.selectedChannelId);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selectedChannelId = channelId;
        this.channelStateService.setSelectedChannelId(channelId);
      }
    });
  }
  /*TESTING*/

  openChannel(channelId: string) {
    let dmWindow = document.querySelector('.dm-window') as HTMLElement;
    let chatWindow = document.querySelector('.chat-window') as HTMLElement;
    if (dmWindow && chatWindow) {
      dmWindow.style.display = 'none';
      chatWindow.style.display = 'flex';
    }
    this.selectedChannelId = channelId;
    this.selectedUserId = null;
    this.isDirectChat = false;
    this.channelStateService.setSelectedChannelId(channelId);
  }

  openDirectmessage(userId: string) {
    let recipientId = userId;
    let currentUser = this.authService.currentUserSig();
    let currentUserId = currentUser!.userId;

    this.dmService.setConversationMembers(currentUserId, recipientId).then(() => {
      // Notify the DM window that the conversation is ready to be loaded
      this.conversationSet.emit();
      this.dmService.setRecipientId(recipientId);
    });


    console.log('open Directmessage for User' + userId);
    let dmWindow = document.querySelector('.dm-window') as HTMLElement;
    let chatWindow = document.querySelector('.chat-window') as HTMLElement;
    if (dmWindow && chatWindow) {
      dmWindow.style.display = 'flex';
      chatWindow.style.display = 'none';
    }
    this.selectedChannelId = null;
    this.selectedUserId = userId;
    this.isDirectChat = true;
  }

  openSearchBar() {
    this.channelStateService.openSearchBar();
  }

  toggleDropdown(menu: string) {
    if (menu === 'channels') {
      this.isChannelsDropdownOpen = !this.isChannelsDropdownOpen;
    } else if (menu === 'messages') {
      this.isMessagesDropdownOpen = !this.isMessagesDropdownOpen;
    }
  }
}
