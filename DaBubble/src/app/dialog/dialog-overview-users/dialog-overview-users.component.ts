import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { UserLogged } from '../../models/user-logged.model';
import { DialogEditProfilComponent } from '../dialog-edit-profil/dialog-edit-profil.component';

@Component({
  selector: 'app-dialog-overview-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-overview-users.component.html',
  styleUrl: './dialog-overview-users.component.scss',
})
export class DialogOverviewUsersComponent {
  isOpen = true;
  isOnline = true;

  members: UserLogged[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { members: UserLogged[] },
    public dialogRef: MatDialogRef<DialogOverviewUsersComponent>,
    private dialog: MatDialog
  ) {
    this.members = data.members;
  }

  openProfil(user: UserLogged) {
    console.log('open profile' + user);
    this.dialog.open(DialogEditProfilComponent, {
      data: { user: user },
    });
  }
  addUser() {
    console.log('add user');
  }

  close() {
    this.dialogRef.close();
  }
}
