import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserLogged } from '../../models/user-logged.model';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { Channel } from '../../models/channel.class';

@Component({
  selector: 'app-dialog-add-user-header',
  standalone: true,
  imports: [DialogAddUserComponent],
  templateUrl: './dialog-add-user-header.component.html',
  styleUrl: './dialog-add-user-header.component.scss'
})
export class DialogAddUserHeaderComponent implements OnInit {
  allUsers: UserLogged[] = [];
  selectedUsers: UserLogged[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { members: UserLogged[]; channel: Channel | null; users: UserLogged[] },
    public dialogRef: MatDialogRef<DialogAddUserHeaderComponent>
  ) {}

  ngOnInit(): void {
    this.selectedUsers = this.data.members || [];
    this.allUsers = this.data.users || []; // Assume all users are passed in data.users

    console.log('All users:', this.allUsers);
  }

  close() {
    this.dialogRef.close(this.selectedUsers);
  }

  onUsersUpdated(updatedUsers: UserLogged[]) {
    this.selectedUsers = updatedUsers; // Update the selected users list
  }
}
