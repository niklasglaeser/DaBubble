import { Component, Input } from '@angular/core';
import { Channel } from '../../../../models/channel.class';
import { UserLogged } from '../../../../models/user-logged.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogChannelEditComponent } from '../../../../dialog/dialog-channel-edit/dialog-channel-edit.component';
import { DialogOverviewUsersComponent } from '../../../../dialog/dialog-overview-users/dialog-overview-users.component';
import { DialogAddUserHeaderComponent } from '../../../../dialog/dialog-add-user-header/dialog-add-user-header.component';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss',
})
export class ChatHeaderComponent {
  @Input() channel: Channel | null = null;
  @Input() members: UserLogged[] = [];
  @Input() users: UserLogged[] = [];

  constructor(public dialog: MatDialog) {}

  openEditChannel(): void {
    if (this.channel && this.channel.id) {
      const dialogRef = this.dialog.open(DialogChannelEditComponent, {
        data: { channelId: this.channel.id },
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
        data: { members: this.members },
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
      const dialogRef = this.dialog.open(DialogAddUserHeaderComponent, {
        data: {
          members: this.members,
          channel: this.channel,
          users: this.users,
        },
      });

      dialogRef.afterClosed().subscribe((updatedMembers: UserLogged[]) => {
        if (updatedMembers) {
          this.members = updatedMembers; // Aktualisieren Sie die Mitgliederliste
          console.log('Updated Members:', updatedMembers);
        }
      });
    } else {
      console.error('No channel ID');
    }
  }
}
