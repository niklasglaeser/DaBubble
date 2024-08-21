import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { DialogAddChannelComponent } from '../../../dialog/dialog-add-channel/dialog-add-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogChannelEditComponent } from '../../../dialog/dialog-channel-edit/dialog-channel-edit.component';
import { ChannelService } from '../../../services/channel.service';
import { Subscription } from 'rxjs';
import { Channel } from '../../../models/channel.class';
import { WorkspaceToggleComponent } from '../../../dialog/workspace-toggle/workspace-toggle.component';
import { CommonModule } from '@angular/common';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { UserService } from '../../../services/user.service';
import { UserLogged } from '../../../models/user-logged.model';
import { ChannelStateService } from '../../../services/channel-state.service';

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
          display: 'flex',
        })
      ),
      state(
        'out',
        style({
          transform: 'translateX(-100%)',
          display: 'none',
        })
      ),
      transition('in => out', animate('125ms ease-in')),
      transition('out => in', animate('125ms ease-out')),
    ]),
  ],
})
export class SidebarComponent implements OnInit {
  @ViewChild('dialogAddChannel')
  dialogAddChannelComponent!: DialogAddChannelComponent;

  workspaceVisible: boolean = true;
  showWorkspaceToggle = true;

  isChannelsDropdownOpen = true;
  isMessagesDropdownOpen = true;
  isActive = false;
  isOnline = true;
  isDirectChat = false;

  channels: any = [];
  channelsSubscription!: Subscription;

  // directUser = Array(5).fill(0);
  users: UserLogged[] = [];
  unsubscribe: any;

  constructor(
    public dialog: MatDialog,
    private channelService: ChannelService,
    private userService: UserService,
    private channelStateService: ChannelStateService
  ) {
    this.checkWindowSize();
  }

  getList(): Channel[] {
    return this.channelService.channels;
  }

  ngOnInit(): void {
    this.userService.users$.subscribe((users) => {
      this.users = users;
      console.log(this.users);
    });
  }

  addChannel() {
    const dialogRef = this.dialog.open(DialogAddChannelComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog closed', result);
    });
  }

  /*TESTING*/
  openEditDialog(channelId: string) {
    console.log(channelId);

    const dialogRef = this.dialog.open(DialogChannelEditComponent, {
      data: { channelId: channelId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }
  /*TESTING*/

  toggleWorkspace() {
    this.workspaceVisible = !this.workspaceVisible;
  }

  openChannel(channelId: string) {
    this.channelStateService.setSelectedChannelId(channelId);
    console.log(channelId);
    console.log('open channel');
  }
  openDirectmessage(userId: string) {
    console.log('open Directmessage for User' + userId);
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
