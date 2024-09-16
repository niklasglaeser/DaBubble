import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserLogged } from '../../models/user-logged.model';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '../../services/user.service';
import { getDoc } from '@angular/fire/firestore';
import { SidebarComponent } from '../../dashboard/content/sidebar/sidebar.component';
import { ChannelStateService } from '../../services/channel-state.service';
import { AvatarProfileComponent } from './avatar/avatar.component';
import { AuthService } from '../../services/lp-services/auth.service';
import { UserLoggedService } from '../../services/lp-services/user-logged.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dialog-edit-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, MatIconModule],
  templateUrl: './dialog-edit-profil.component.html',
  styleUrl: './dialog-edit-profil.component.scss'
})
export class DialogEditProfilComponent implements OnInit {
  authService = inject(AuthService)
  UserService = inject(UserLoggedService)
  currentUserId$ = new BehaviorSubject<string | null>(null);
  user!: UserLogged;

  title: string = 'Profil';
  profilName: string = '';
  profilEmail: string = '';
  profileImg: string = ''
  edit: boolean = false

  originalProfilName: string = '';
  originalProfilEmail: string = '';
  editName: string = 'Bearbeiten';
  editNameClicked: boolean = false;

  isGuestUser: boolean = false;

  inputNameDisabled: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { user: UserLogged }, private auth: Auth = inject(Auth), public dialogRef: MatDialogRef<DialogEditProfilComponent>, private userService: UserService, private channelStateService: ChannelStateService, private dialog: MatDialog) {
    this.getCurrentUserId();
  }

  /**
   * Angular lifecycle hook that runs on component initialization.
   * Loads the user profile and checks if the current user is a guest user.
   */
  ngOnInit() {
    this.loadProfile();
    this.checkIfGuestUser();
    // this.subscribeToUserData()
  }

  /**
   * Subscribes to user data based on the authenticated user's ID.
   * Updates the profile image upon receiving the user data.
   * This function is marked to be potentially removed after a bug fix.
   * @returns {Promise<void>} A promise that resolves when the subscription is set up.
   */
  async subscribeToUserData(): Promise<void> {
    if (this.authService.uid) {
      await this.UserService.subscribeUser(this.authService.uid).subscribe((data) => {
        this.profileImg = data?.photoURL!;
      });
    }
  }

  /**
   * Toggles the edit mode for the profile name.
   * If the user is in edit mode, it allows them to edit the name.
   */
  editProfilBtn() {
    if (!this.editNameClicked) {
      this.editNameClicked = true;
      this.edit = true;
    }
  }

  /**
   * Loads the profile information for the current user based on their user ID.
   * Retrieves and assigns the user's username and email to the component's properties.
   * @returns {Promise<void>} A promise that resolves when the profile data is loaded.
   */
  async loadProfile() {
    if (this.data.user.uid) {
      const userDoc = this.userService.getSingleUser(this.data.user.uid);
      const userData = (await getDoc(userDoc)).data();
      if (userData) {
        this.user = new UserLogged({
          uid: this.data.user.uid,
          ...userData
        });
        this.profilName = this.user.username;
        this.profilEmail = this.user.email;
        this.originalProfilName = this.user.username;
        this.originalProfilEmail = this.user.email;
      }
    }
  }

  /**
   * Updates the user's profile with the modified username and email.
   * Validates the username and email fields and submits changes to the user service.
   * Closes the dialog after successfully updating the user.
   * @returns {Promise<void>} A promise that resolves when the user is updated.
   */
  async updateUser() {
    if (!this.profilName || !this.profilEmail) {
      console.error('Name und E-Mail dürfen nicht leer sein.');
      return;
    }
    const nameParts = this.profilName.trim().split(' ');
    if (nameParts.length < 2) {
      return;
    }
    if (this.user) {
      try {
        this.user.username = this.profilName;
        this.user.email = this.profilEmail;
        await this.userService.updateUser(this.user.uid, this.user);
        this.dialogRef.close(this.user);
      } catch (e) {
        console.error('Error updating user', e);
      }
    }
  }

  /**
   * Checks whether the profile has been modified by comparing current and original values.
   * @returns {boolean} True if the profile name or email has changed, otherwise false.
   */
  hasChanges(): boolean {
    return (
      this.profilName !== this.originalProfilName ||
      this.profilEmail !== this.originalProfilEmail
    );
  }

  /**
   * Opens a direct message channel for the specified user ID.
   * Closes all open dialogs after initiating the direct message.
   * @param {string} userId - The ID of the user to send a direct message to.
   */
  openDirectMessage(userId: string) {
    this.channelStateService.openDirectMessage(userId);
    this.dialog.closeAll();
  }

  /**
   * Closes the current dialog without saving changes.
   */
  close() {
    this.dialogRef.close();
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
   * Opens the AvatarProfileComponent dialog for avatar selection if the user is in edit mode.
   * Reloads the user profile after avatar selection.
   */
  openProfilAvatar() {
    if (this.edit) {
      const dialogRef = this.dialog.open(AvatarProfileComponent, {
        width: '100vw',
        maxWidth: '550px',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadProfile();
        }
      });
    }
    this.close();
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }


}
