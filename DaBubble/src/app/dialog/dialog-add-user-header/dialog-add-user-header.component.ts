import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserLogged } from '../../models/user-logged.model';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { Channel } from '../../models/channel.class';

@Component({
  selector: 'app-dialog-add-user-header',
  standalone: true,
  imports: [DialogAddUserComponent],
  templateUrl: './dialog-add-user-header.component.html',
  styleUrl: './dialog-add-user-header.component.scss',
})
export class DialogAddUserHeaderComponent {
  @Input() users: UserLogged[] = []; // Alle verfügbaren Benutzer
  @Input() selectedUsers: UserLogged[] = [];
  @Input() filteredUsers: UserLogged[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      members: UserLogged[];
      channel: Channel | null;
      users: UserLogged[];
    },
    public dialogRef: MatDialogRef<DialogAddUserHeaderComponent>
  ) {
    // users und selectedUsers nicht hier initialisieren, sondern in ngOnInit
  }

  ngOnInit(): void {
    // Initialize users and selectedUsers based on the data passed to the dialog
    this.selectedUsers = this.data.members || [];
    this.users = this.data.users || [];

    // Hier muss eine Quelle für alle Benutzer angegeben werden, falls vorhanden
    this.users = this.getAllAvailableUsers(); // Ersetze dies mit der tatsächlichen Methode oder Quelle

    console.log('All users:', this.users);
    this.logAllUsers();
  }

  getAllAvailableUsers(): UserLogged[] {
    // Hier muss die tatsächliche Logik implementiert werden, um alle Benutzer zu erhalten
    // Momentan als Beispiel: Rückgabe der Benutzer, die nicht ausgewählt sind
    return this.users.filter(
      (user) =>
        !this.selectedUsers.some((selected) => selected.uid === user.uid)
    );
  }

  logAllUsers(): void {
    // Log each user in a readable format
    console.log('All available users:');
    this.users.forEach((user) =>
      console.log(`User ID: ${user.uid}, Username: ${user.username}`)
    );
  }
  getAvailableUsers(): UserLogged[] {
    // Placeholder function to get all users, you should replace it with actual implementation.
    return this.users.filter(
      (user) =>
        !this.selectedUsers.some((selected) => selected.uid === user.uid)
    );
  }

  close() {
    this.dialogRef.close(this.selectedUsers);
  }

  onUsersUpdated(updatedUsers: UserLogged[]) {
    this.selectedUsers = updatedUsers; // Update the selected users list
  }
}
