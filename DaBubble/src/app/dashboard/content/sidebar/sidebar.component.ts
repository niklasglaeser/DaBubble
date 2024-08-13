import { Component, ViewChild } from '@angular/core';
import { DialogAddChannelComponent } from '../../../dialog/dialog-add-channel/dialog-add-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogChannelEditComponent } from '../../../dialog/dialog-channel-edit/dialog-channel-edit.component';
import { ChannelService } from '../../../models/channel.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [DialogAddChannelComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @ViewChild('dialogAddChannel')
  dialogAddChannelComponent!: DialogAddChannelComponent;

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
  ) {}

  ngOnInit(): void {
    this.channelsSubscription = this.channelService.channels$.subscribe(
      (data) => {
        this.channels = data;
        console.log(this.channels);
      }
    );
  }

  addChannel() {
    console.log('add channel');
    const dialogRef = this.dialog.open(DialogAddChannelComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog closed', result);
    });
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
}
