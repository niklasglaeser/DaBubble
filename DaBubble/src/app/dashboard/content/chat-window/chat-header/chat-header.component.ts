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

  constructor(public dialog: MatDialog, private channelService: ChannelService, private userService: UserService, private globalService: GlobalService) { }

  openEditChannel(event: MouseEvent): void {
    if (this.channel && this.channel.id) {
      const dialogConfig = new MatDialogConfig();
      const dialogWidth = 872;
      const openEditChannelPosition = this.openEditChannelPosition.nativeElement;
      const position = {
        top: `${openEditChannelPosition.offsetTop + openEditChannelPosition.offsetHeight}px`,
        left: `${openEditChannelPosition.offsetLeft}px`
      }

      dialogConfig.data = { channelId: this.channel.id };
      dialogConfig.position = position;
      dialogConfig.panelClass = 'dialog-panel-edit-channel';
      dialogConfig.width = '100%';
      dialogConfig.maxWidth = `${dialogWidth}px`;

      const dialogRef = this.dialog.open(DialogChannelEditComponent, dialogConfig);

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          console.log('Dialog result:', result);
        }
      });
    } else {
      console.error('No channel ID');
    }
  }

  openOverviewChannel(event: MouseEvent): void {
    if (this.members) {

      const dialogConfig = new MatDialogConfig();
      const dialogWidth = 415;
      const openOverviewPosition = this.openOverviewPosition.nativeElement;
      const position = {
        top: `${openOverviewPosition.offsetTop + openOverviewPosition.offsetHeight}px`,
        left: `${openOverviewPosition.offsetLeft - 350}px`
      }
      dialogConfig.data = { members: this.members, channel: this.channel, users: this.users };
      dialogConfig.position = position;
      dialogConfig.panelClass = 'dialog-panel-channel-overview';
      dialogConfig.width = '100%';
      dialogConfig.maxWidth = `${dialogWidth}px`;
      dialogConfig.autoFocus = false;
      dialogConfig.hasBackdrop = true;

      const dialogRef = this.dialog.open(DialogOverviewUsersComponent, dialogConfig);

      dialogRef.componentInstance.openAddUserDialogEvent.subscribe(() => {
        this.openAddUser(event);
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          console.log('Dialog result:', result);
        }
      });
    } else {
      console.error('No channel ID');
    }
  }



  openAddUser(event: MouseEvent): void {
    if (this.members) {
      const dialogConfig = new MatDialogConfig();
      const dialogWidth = 415;
      const openAddUserPosition = this.openAddUserPosition.nativeElement;
      const position = {
        top: `${openAddUserPosition.offsetTop + openAddUserPosition.offsetHeight}px`,
        left: `${openAddUserPosition.offsetLeft - 380}px`
      }
      dialogConfig.data = { members: this.members, channel: this.channel, users: this.users };
      dialogConfig.position = position;
      dialogConfig.panelClass = 'dialog-panel-channel-overview';
      dialogConfig.width = '100%';
      dialogConfig.maxWidth = `${dialogWidth}px`;
      dialogConfig.autoFocus = false;
      dialogConfig.hasBackdrop = true;

      const dialogRef = this.dialog.open(DialogAddUserHeaderComponent, dialogConfig);

      dialogRef.afterClosed().subscribe(async (updatedMembers: UserLogged[]) => {
        if (updatedMembers) {
          this.members = updatedMembers;
          if (this.channel?.id) {
            try {
              await this.channelService.addUsersToChannel(
                this.channel.id,
                updatedMembers.map((user) => user.uid)
              );
              await this.updateUserProfilesWithChannel(
                updatedMembers.map((user) => user.uid),
                this.channel.id
              );
            } catch (error) {
              console.error('Error updating Firebase:', error);
            }
          } else {
            console.error('Channel ID is undefined.');
          }
        }
      });
    } else {
      console.error('No channel ID');
    }
  }

  async updateUserProfilesWithChannel(userIds: string[], channelId: string) {
    try {
      for (const userId of userIds) {
        const userRef = this.userService.getSingleUser(userId);
        await updateDoc(userRef, {
          joinedChannels: arrayUnion(channelId)
        });
      }
      console.log('User profiles updated successfully with channel.');
    } catch (e) {
      console.error('Error updating user profiles with channel:', e);
    }
  }
}
