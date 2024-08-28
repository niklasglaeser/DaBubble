import { Component, Input } from '@angular/core';
import { Channel } from '../../../../models/channel.class';
import { UserLogged } from '../../../../models/user-logged.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogChannelEditComponent } from '../../../../dialog/dialog-channel-edit/dialog-channel-edit.component';
import { DialogOverviewUsersComponent } from '../../../../dialog/dialog-overview-users/dialog-overview-users.component';
import { DialogAddUserHeaderComponent } from '../../../../dialog/dialog-add-user-header/dialog-add-user-header.component';
import { ChannelService } from '../../../../services/channel.service';
import { UserService } from '../../../../services/user.service';
import { arrayUnion, updateDoc } from '@angular/fire/firestore';

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

  constructor(public dialog: MatDialog, private channelService: ChannelService, private userService: UserService) {}

  openEditChannel(): void {
    if (this.channel && this.channel.id) {
      const dialogRef = this.dialog.open(DialogChannelEditComponent, {
        data: { channelId: this.channel.id }
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

  openOverviewChannel(): void {
    if (this.members) {
      const dialogRef = this.dialog.open(DialogOverviewUsersComponent, {
        data: { members: this.members, channel: this.channel, users: this.users },
        autoFocus: false,
        hasBackdrop: true
      });

      dialogRef.componentInstance.openAddUserDialogEvent.subscribe(() => {
        this.openAddUser();
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
  openAddUser(): void {
    if (this.members) {
      console.log('All users before opening dialog:', this.users);
      const dialogRef = this.dialog.open(DialogAddUserHeaderComponent, {
        data: {
          members: this.members,
          channel: this.channel,
          users: this.users
        },
        autoFocus: false,
        hasBackdrop: true
      });

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
