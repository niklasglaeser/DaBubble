import { Component, HostListener, ViewChild } from '@angular/core';
import { DialogAddChannelComponent } from '../../../dialog/dialog-add-channel/dialog-add-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogChannelEditComponent } from '../../../dialog/dialog-channel-edit/dialog-channel-edit.component';
import { ChannelService } from '../../../models/channel.service';
import { Subscription } from 'rxjs';
import { Channel } from '../../../models/channel.class';
import { WorkspaceToggleComponent } from '../../../dialog/workspace-toggle/workspace-toggle.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [DialogAddChannelComponent, WorkspaceToggleComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @ViewChild('dialogAddChannel')
  dialogAddChannelComponent!: DialogAddChannelComponent;

  workspaceVisible: boolean = true;
  showWorkspaceToggle = true;

  isChannelsDropdownOpen = true;
  isMessagesDropdownOpen = true;
  isActive = true;
  isOnline = true;
  isDirectChat = false;

  channels: any = [];
  channelsSubscription!: Subscription;

  directUser = Array(5).fill(0);

  constructor(
    public dialog: MatDialog,
    private channelService: ChannelService
  ) {
    this.checkWindowSize();
  }

  getList(): Channel[] {
    return this.channelService.channels;
  }

  // ngOnInit(): void {
  //   this.channelsSubscription = this.channelService.channels$.subscribe(
  //     (data: any) => {
  //       this.channels = data;
  //       console.log(this.channels);
  //     }
  //   );
  // }

  addChannel() {
    console.log('add channel');
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

  toggleWorkspace(isHidden: boolean) {
    this.workspaceVisible = !isHidden;
  }

  openChannel() {
    console.log('open channel');
  }
  openDirectmessage() {
    console.log('open Directmessage');
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
