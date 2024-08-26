import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import { DeviceService } from '../../../services/device.service';

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
export class SidebarComponent implements OnInit, OnDestroy {
  @ViewChild('dialogAddChannel')
  dialogAddChannelComponent!: DialogAddChannelComponent;

  isMobile: boolean = false;
  previousIsMobile: boolean = false;
  subscription: Subscription | undefined;

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

  constructor(
    public dialog: MatDialog,
    private channelService: ChannelService,
    private userService: UserService,
    private channelStateService: ChannelStateService,
    private deviceService: DeviceService
  ) {
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
        this.openChannel(this.channels[0].id);
      }
    });

    this.subscription = this.deviceService.screenWidth.subscribe((width) => {
      this.isMobile = this.deviceService.isMobile();
      if (!this.isMobile && !this.workspaceVisible) {
        this.workspaceVisible = true;
      } else if (this.isMobile && this.workspaceVisible) {
        this.toggleWorkspace();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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
      data: { channelId: channelId },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }
  /*TESTING*/

  toggleWorkspace() {
    this.workspaceVisible = !this.workspaceVisible;
  }

  openChannel(channelId: string) {
    this.selectedChannelId = channelId;
    this.channelStateService.setSelectedChannelId(channelId);
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
