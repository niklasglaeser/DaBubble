import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserLogged } from '../../models/user-logged.model';
import { DialogEditProfilComponent } from '../dialog-edit-profil/dialog-edit-profil.component';
import { Channel } from '../../models/channel.class';

@Component({
  selector: 'app-dialog-overview-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-overview-users.component.html',
  styleUrl: './dialog-overview-users.component.scss'
})
export class DialogOverviewUsersComponent {
  @Output() openAddUserDialogEvent = new EventEmitter<void>();

  members: UserLogged[] = [];
  channel: Channel | null = null;
  users: UserLogged[] = [];

  isOpen = true;
  isOnline = true;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { members: UserLogged[]; channel: Channel | null; users: UserLogged[] }, public dialogRef: MatDialogRef<DialogOverviewUsersComponent>, private dialog: MatDialog) {
    this.members = data.members;
    this.channel = data.channel;
    this.users = data.users;
  }

  openProfil(user: UserLogged) {
    const dialogRef = this.dialog.open(DialogEditProfilComponent, {
      data: { user: user }
    });

    dialogRef.afterClosed().subscribe((updatedUser: UserLogged) => {
      if (updatedUser) {
        this.updateUserList(updatedUser);
      }
    });
  }

  updateUserList(updatedUser: UserLogged) {
    const index = this.members.findIndex((member) => member.uid === updatedUser.uid);
    if (index !== -1) {
      this.members[index] = updatedUser;
    }
    console.log('updateuserlist');
  }

  addUser() {
    this.openAddUserDialogEvent.emit();
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }
}
