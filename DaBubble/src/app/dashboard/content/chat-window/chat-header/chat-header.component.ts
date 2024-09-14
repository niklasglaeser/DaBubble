import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Channel } from '../../../../models/channel.class';
import { UserLogged } from '../../../../models/user-logged.model';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogChannelEditComponent } from '../../../../dialog/dialog-channel-edit/dialog-channel-edit.component';
import { DialogOverviewUsersComponent } from '../../../../dialog/dialog-overview-users/dialog-overview-users.component';
import { DialogAddUserHeaderComponent } from '../../../../dialog/dialog-add-user-header/dialog-add-user-header.component';
import { ChannelService } from '../../../../services/channel.service';
import { UserService } from '../../../../services/user.service';
import { arrayUnion, updateDoc } from '@angular/fire/firestore';
import { GlobalService } from '../../../../services/global.service';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss'
})
export class ChatHeaderComponent {
  @Input() channel: Channel | null = null;
  @Input() members: UserLogged[] = [];
  @Input() users: UserLogged[] = [];
  @ViewChild('openEditChannelPosition') openEditChannelPosition!: ElementRef;
  @ViewChild('openOverviewPosition') openOverviewPosition!: ElementRef;
  @ViewChild('openAddUserPosition') openAddUserPosition!: ElementRef;

  constructor(public dialog: MatDialog, private channelService: ChannelService, private userService: UserService, private globalService: GlobalService) {}

  openEditChannel(event: MouseEvent): void {
    if (this.channel && this.channel.id) {
      let dialogConfig = new MatDialogConfig();
      let dialogWidth = 872;

      if (window.innerWidth >= 1200) {
        let openEditChannelPosition = this.openEditChannelPosition.nativeElement;
        let position = { top: `${openEditChannelPosition.offsetTop + openEditChannelPosition.offsetHeight}px`, left: `${openEditChannelPosition.offsetLeft}px`};
        dialogConfig.position = position;
      }

      dialogConfig.data = { channelId: this.channel.id, members: this.members };
      dialogConfig.panelClass = 'dialog-panel-edit-channel';
      dialogConfig.width = '100%';
      dialogConfig.maxWidth = `${dialogWidth}px`;

      let dialogRef = this.dialog.open(DialogChannelEditComponent, dialogConfig);
    }
  }

  openOverviewChannel(event: MouseEvent): void {
    if (!this.members) return;

    let dialogConfig = new MatDialogConfig();
    dialogConfig.data = { members: this.members, channel: this.channel, users: this.users };
    dialogConfig.panelClass = 'dialog-panel-channel-overview';
    dialogConfig.width = '100%';
    dialogConfig.maxWidth = '415px';
    dialogConfig.autoFocus = false;
    dialogConfig.hasBackdrop = true;

    if (window.innerWidth >= 1200) {
      let { offsetTop, offsetHeight, offsetLeft } = this.openOverviewPosition.nativeElement;
      dialogConfig.position = { top: `${offsetTop + offsetHeight}px`, left: `${offsetLeft - 350}px`};
    }

    this.dialog.open(DialogOverviewUsersComponent, dialogConfig).componentInstance.openAddUserDialogEvent.subscribe(() => this.openAddUser(event));
  }

  openAddUser(event: MouseEvent): void {
    if (!this.members) return console.error('No channel ID');

    let dialogConfig = new MatDialogConfig();
    dialogConfig.data = { members: this.members, channel: this.channel, users: this.users };
    dialogConfig.panelClass = 'dialog-panel-channel-overview';
    dialogConfig.width = '100%';
    dialogConfig.maxWidth = '415px';
    dialogConfig.autoFocus = false;
    dialogConfig.hasBackdrop = true;

    if (window.innerWidth >= 1200) {
      const { offsetTop, offsetHeight, offsetLeft } = this.openAddUserPosition.nativeElement;
      dialogConfig.position = { top: `${offsetTop + offsetHeight}px`, left: `${offsetLeft - 380}px`};
    }

    this.dialog
      .open(DialogAddUserHeaderComponent, dialogConfig).afterClosed().subscribe(async (updatedMembers: UserLogged[]) => {
        if (!updatedMembers || !this.channel?.id) return;
        this.members = updatedMembers;
        try {
          let userIds = updatedMembers.map((user) => user.uid);
          await this.channelService.editUserlistInChannel(this.channel.id, userIds);
          await this.updateUserProfilesWithChannel(userIds, this.channel.id);
        } catch (error) {console.error('Error updating Firebase:', error);}
      });
  }

  async updateUserProfilesWithChannel(userIds: string[], channelId: string) {
    try {
      for (const userId of userIds) {
        const userRef = this.userService.getSingleUser(userId);
        await updateDoc(userRef, {
          joinedChannels: arrayUnion(channelId)
        });
      }
    } catch (e) {
      console.error('Error updating user profiles with channel:', e);
    }
  }
}
