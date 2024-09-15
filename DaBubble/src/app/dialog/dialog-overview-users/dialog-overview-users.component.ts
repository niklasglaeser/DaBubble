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

  /**
   * Opens the DialogEditProfilComponent to allow editing of the user's profile.
   * After the dialog is closed, if the user has been updated, updates the user list.
   * @param {UserLogged} user - The user whose profile is to be edited.
   */
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

  /**
   * Updates the member list with the updated user data.
   * Finds the user in the list and updates the entry if the user exists.
   * @param {UserLogged} updatedUser - The user object with updated information.
   */
  updateUserList(updatedUser: UserLogged) {
    const index = this.members.findIndex((member) => member.uid === updatedUser.uid);
    if (index !== -1) {
      this.members[index] = updatedUser;
    }
  }

  addUser() {
    this.openAddUserDialogEvent.emit();
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }

}
