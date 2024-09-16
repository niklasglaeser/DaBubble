import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DialogAddChannelComponent } from '../../../dialog/dialog-add-channel/dialog-add-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogChannelEditComponent } from '../../../dialog/dialog-channel-edit/dialog-channel-edit.component';
import { ChannelService } from '../../../services/channel.service';
import { Subscription } from 'rxjs';
import { Channel } from '../../../models/channel.class';
import { WorkspaceToggleComponent } from '../../../dialog/workspace-toggle/workspace-toggle.component';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { UserLogged } from '../../../models/user-logged.model';
import { ChannelStateService } from '../../../services/channel-state.service';
import { AuthService } from '../../../services/lp-services/auth.service';
import { DirectMessagesService } from '../../../services/direct-message.service';
import { SearchComponent } from '../../search/search.component';
import { GlobalService } from '../../../services/global.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [DialogAddChannelComponent, WorkspaceToggleComponent, CommonModule, SearchComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  @ViewChild('dialogAddChannel')
  dialogAddChannelComponent!: DialogAddChannelComponent;

  @Output() conversationSet = new EventEmitter<void>();
  @Output() channelOpened = new EventEmitter<void>();
  @Output() directMessageOpened = new EventEmitter<void>();

  @Input() showSidebar: boolean | undefined;
  @Input() isMobile: boolean | undefined;

  isChannelsDropdownOpen = true;
  isMessagesDropdownOpen = true;
  isActive = false;
  isOnline = true;
  isDirectChat = false;
  selectedUserId: string | null = null;

  channels: any = [];
  channelsSubscription!: Subscription;
  selectedChannelId: string | null = null;
  readonly fixedChannelId: string = 'IiKdwSHaVmXdf2JiliaU';

  users: UserLogged[] = [];
  directMessagesUsers: UserLogged[] = [];
  unsubscribe: any;

  currentUser: UserLogged | null = null;

  private subscriptions: Subscription[] = [];

  constructor(public dialog: MatDialog, private channelService: ChannelService, private userService: UserService, private channelStateService: ChannelStateService, private authService: AuthService, private dmService: DirectMessagesService, private cdref: ChangeDetectorRef, private globalService: GlobalService) { }

  get currentUserId(): string | undefined {
    return this.authService.uid;
  }

  /**
   * Angular lifecycle hook that runs on component initialization.
   * Subscribes to various services to handle users, channels, and direct messages.
   */
  ngOnInit(): void {
    const usersSub = this.userService.users$.subscribe((users) => {
      this.users = users;
    });
    this.subscriptions.push(usersSub);

    const channelsSub = this.channelService.channels$.subscribe((channels) => {
      this.channels = channels;
      // this.channels = channels.sort((a, b) => a.name.localeCompare(b.name));
      if (!this.isMobile) {
        if (this.channels.length > 0 && !this.selectedChannelId) {
          if (window.innerWidth >= 1200) {
            this.openChannel(this.fixedChannelId);
          }
        }
      }
    });
    this.subscriptions.push(channelsSub);


    this.channelStateService.emitOpenDirectMessage.subscribe((userId: string) => {
      this.openDirectmessage(userId);
    });
    this.userService.userSearchSelected.subscribe((userId: string) => {
      this.openDirectmessage(userId);
    });
    this.userService.channelSearchSelect.subscribe((channelId: string) => {
      this.openChannel(channelId);
    });
    this.dmService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
    this.globalService.getChannelSwitch().subscribe((channelId: string | null) => {
      if (channelId) {
        this.openChannel(channelId);
      }
    });
    this.loadDmConvos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Loads direct message conversations for the current user.
   * Subscribes to the direct message service to retrieve conversations.
   */
  loadDmConvos() {
    const currentUserId = this.currentUserId;
    if (currentUserId) {
      this.dmService.setCurrentUserId(currentUserId);
      this.dmService.conversations$.subscribe((users) => {
        this.directMessagesUsers = users;
      });
    } else {
      console.error('Current user ID is undefined, unable to load direct message conversations.');
    }
  }

  /**
   * Retrieves the list of channels from the channel service.
   * @returns {Channel[]} The list of available channels.
   */
  getList(): Channel[] {
    return this.channelService.channels;
    // Optionally return channels sorted by name
    // return this.channelService.channels.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Opens the dialog for adding a new channel.
   * Subscribes to the result of the dialog after it's closed.
   */
  addChannel() {
    const dialogRef = this.dialog.open(DialogAddChannelComponent);
    dialogRef.afterClosed().subscribe((result) => { });
  }

  /**
   * Opens the edit dialog for a specific channel.
   * Sets the selected channel ID after the dialog is closed and updates the channel state.
   * @param {string} channelId - The ID of the channel to edit.
   */
  openEditDialog(channelId: string) {
    const dialogRef = this.dialog.open(DialogChannelEditComponent, {
      data: { channelId: channelId }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selectedChannelId = channelId;
        this.channelStateService.setSelectedChannelId(channelId);
      }
    });
  }

  /**
   * Opens a specified channel by its ID.
   * Clears any selected user and switches to channel mode.
   * @param {string} channelId - The ID of the channel to open.
   */
  openChannel(channelId: string) {
    this.selectedChannelId = channelId;
    this.selectedUserId = null;
    this.isDirectChat = false;
    this.channelStateService.setSelectedChannelId(channelId);
    this.channelOpened.emit();
    let textarea = document.getElementById('chat-message-input') as HTMLTextAreaElement;
    textarea.value = '';
    setTimeout(() => {
      textarea.focus();
    }, 500);
  }

  /**
   * Opens a direct message conversation with a specified user.
   * Sets the conversation members and loads the direct messages.
   * @param {string} userId - The ID of the user to start a direct message with.
   */
  openDirectmessage(userId: string) {
    let recipientId = userId;
    let currentUser = this.authService.currentUserSig();
    let currentUserId = currentUser!.userId;
    this.directMessageOpened.emit();
    this.dmService
      .setConversationMembers(currentUserId, recipientId)
      .then(() => {
        this.conversationSet.emit();
        this.dmService.setRecipientId(recipientId);
        this.dmService.triggerLoadMessages();
      })
      .catch((error) => {console.error('Error setting conversation members:', error);});
    this.selectedChannelId = null;
    this.selectedUserId = userId;
    this.isDirectChat = true;
    let textarea = document.getElementById('dm-message-input') as HTMLTextAreaElement;
    textarea.value = '';
    setTimeout(() => {
      textarea.focus();
    }, 100);
  }

  /**
   * Opens the search bar for finding channels or users.
   */
  openSearchBar() {
    this.channelStateService.openSearchBar();
  }

  /**
   * Toggles the dropdown menu for either channels or messages.
   * @param {string} menu - The menu to toggle, either 'channels' or 'messages'.
   */
  toggleDropdown(menu: string) {
    if (menu === 'channels') {
      this.isChannelsDropdownOpen = !this.isChannelsDropdownOpen;
    } else if (menu === 'messages') {
      this.isMessagesDropdownOpen = !this.isMessagesDropdownOpen;
    }
  }
}
