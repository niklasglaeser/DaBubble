import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserLogged } from '../../models/user-logged.model';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { Channel } from '../../models/channel.class';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Component({
  selector: 'app-dialog-add-user-header',
  standalone: true,
  imports: [DialogAddUserComponent, CommonModule],
  templateUrl: './dialog-add-user-header.component.html',
  styleUrl: './dialog-add-user-header.component.scss'
})
export class DialogAddUserHeaderComponent implements OnInit {
  allUsers: UserLogged[] = [];
  selectedUsers: UserLogged[] = [];
  currentUserId$ = new BehaviorSubject<string | null>(null);
  isGuestUser: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { members: UserLogged[]; channel: Channel | null; users: UserLogged[] },
    public dialogRef: MatDialogRef<DialogAddUserHeaderComponent>,
    private userService: UserService,
    private auth: Auth = inject(Auth)
  ) { this.getCurrentUserId(); }

  /**
   * Initializes the component by setting the selected users and all users from the provided data.
   */
  ngOnInit(): void {
    this.selectedUsers = this.data.members || [];
    this.allUsers = this.data.users || [];
    this.checkIfGuestUser();
  }

  /**
   * Closes the dialog, optionally saving the selected users.
   * @param {boolean} save - Determines whether to save the selected users before closing.
   */
  close(save: boolean): void {
    if (save) {
      this.dialogRef.close(this.selectedUsers);
    } else {
      this.dialogRef.close();
    }
  }

  /**
 * Checks if the current authenticated user is a guest user.
 * Sets the `isGuestUser` flag accordingly.
 */
  checkIfGuestUser() {
    this.currentUserId$.subscribe((currentUserId) => {
      if (currentUserId && currentUserId === this.userService.guestUser) {
        this.isGuestUser = true;
      } else {
        this.isGuestUser = false;
      }
    });

  }

  /**
 * Retrieves the current authenticated user's ID and updates the `currentUserId$` observable.
 */
  getCurrentUserId() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserId$.next(user ? user.uid : null);
    });
  }

  /**
   * Updates the list of selected users when they are changed.
   * @param {UserLogged[]} updatedUsers - The updated array of selected users.
   */
  onUsersUpdated(updatedUsers: UserLogged[]): void {
    this.selectedUsers = updatedUsers;
  }

}
