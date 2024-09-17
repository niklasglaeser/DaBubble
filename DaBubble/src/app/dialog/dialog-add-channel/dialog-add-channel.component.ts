import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Channel } from '../../../app/models/channel.class';
import { ChannelService } from '../../services/channel.service';
import { UserService } from '../../services/user.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { UserLogged } from '../../models/user-logged.model';
import { arrayUnion, Firestore, updateDoc } from '@angular/fire/firestore';
import { AuthService } from '../../services/lp-services/auth.service';

@Component({
  selector: 'app-dialog-add-channel',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatAutocompleteModule, MatChipsModule, MatFormFieldModule, DialogAddUserComponent],
  templateUrl: './dialog-add-channel.component.html',
  styleUrls: ['./dialog-add-channel.component.scss']
})
export class DialogAddChannelComponent implements OnInit {
  private firestore = inject(Firestore);
  addChannelForm: FormGroup;
  addUserForm: FormGroup;
  showInputField = false;
  addChannel: boolean = true;
  currentStep: 'channel' | 'user' = 'channel';
  channelName: string = '';
  errorMessage: boolean = false;

  userControl = new FormControl();
  users: UserLogged[] = [];
  filteredUsers: UserLogged[] = [];
  selectedUsers: UserLogged[] = [];

  currentUser: UserLogged | null = null;

  unsubscribe: any;
  createdChannel: any;

  allowDuplicateNames: boolean = false;

  constructor(private fbChannel: FormBuilder, private fbUser: FormBuilder, public dialogRef: MatDialogRef<DialogAddChannelComponent>, private channelService: ChannelService, private userService: UserService, private authService: AuthService) {
    this.addChannelForm = this.fbChannel.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
    this.addUserForm = this.fbUser.group({
      selection: ['', Validators.required],
      specificMembers: ['']
    });
  }

  /**
   * Initializes the component by subscribing to the users observable.
   */
  ngOnInit(): void {
    this.userService.users$.subscribe((users) => {
      this.users = users;
    });
  }

  /**
   * Handles the submission of the add channel form.
   * Validates the form, checks for duplicate channel names,
   * creates a new channel, and updates the channel state.
   */
  async submit() {
    if (this.addChannelForm.valid) {
      let formData = this.addChannelForm.value;
      let newChannelName = formData.name;
      try {
        if (!this.allowDuplicateNames) {
          const nameExists = await this.channelService.checkChannelExists(newChannelName);
          if (nameExists) {
            this.displayErrorMessage();
            return;
          }
        }
        const currentUser = this.authService.currentUserSig();
        let newChannel = this.createNewChannel(formData, currentUser);
        let channelId = await this.channelService.createChannel(newChannel);
        if (channelId) {
          this.updateChannelState(formData, channelId);
        }
      } catch (e) {
        console.error('Error creating channel:', e);
      }
    }
  }

  /**
   * Handles the submission of the add user form.
   * Adds selected users to the newly created channel and updates their profiles.
   */
  async submitUser() {
    if (this.addUserForm.valid && this.createdChannel) {
      let userIds: string[] = [];
      let currentUserId = this.authService.uid;

      if (this.addUserForm.get('selection')?.value === 'all') {
        userIds = this.users.map((user) => user.uid);
      } else {
        userIds = this.selectedUsers.map((user) => user.uid);
      }
      if (currentUserId && !userIds.includes(currentUserId)) {
        userIds.push(currentUserId);
      }
      try {
        await this.channelService.editUserlistInChannel(this.createdChannel, userIds);
        await this.updateUserProfilesWithChannel(userIds, this.createdChannel);
        this.dialogRef.close();
      } catch (e) {
        console.error('Error adding users to channel:', e);
      }
    }
  }

  /**
   * Updates user profiles by adding the channel ID to their list of joined channels.
   * @param {string[]} userIds - Array of user IDs to update.
   * @param {string} channelId - ID of the channel to add to the users' profiles.
   * @throws Will throw an error if updating the user profiles fails.
   */
  async updateUserProfilesWithChannel(userIds: string[], channelId: string) {
    try {
      for (const userId of userIds) {
        const userRef = this.userService.getSingleUser(userId);
        await updateDoc(userRef, {
          joinedChannels: arrayUnion(channelId)
        });
      }
    } catch (e) {
      console.error('Error updating user profiles with channel:', e);
      throw e;
    }
  }

  /**
   * Removes a user from the selected users list and adds them back to the filtered users list.
   * @param {UserLogged} user - The user to remove.
   */
  removeUser(user: UserLogged): void {
    this.selectedUsers = this.selectedUsers.filter((u) => u.uid !== user.uid);
    let alreadyInFilteredUsers = this.filteredUsers.some((u) => u.uid === user.uid);

    if (!alreadyInFilteredUsers) {
      this.filteredUsers.push(user);
      this.filteredUsers.sort((a, b) => a.username.localeCompare(b.username));
    }
  }

  /**
   * Creates a new Channel object with the provided form data and current user.
   * @param {any} formData - The data from the add channel form.
   * @param {any} currentUser - The current authenticated user.
   * @returns {Channel} A new Channel object.
   */
  createNewChannel(formData: any, currentUser: any): Channel {
    return new Channel({
      name: formData.name,
      description: formData.description,
      creator: currentUser?.username
    });
  }

  /**
   * Updates the component's state with the new channel information.
   * @param {any} formData - The data from the add channel form.
   * @param {string} channelId - The ID of the newly created channel.
   */
  updateChannelState(formData: any, channelId: string): void {
    this.channelName = formData.name;
    this.createdChannel = channelId;
    this.currentStep = 'user';
  }

  /**
   * Displays an error message for a specified duration.
   * @param {number} [duration=2000] - The duration in milliseconds to display the error message.
   */
  displayErrorMessage(duration: number = 2000): void {
    this.errorMessage = true;
    setTimeout(() => {
      this.errorMessage = false;
    }, duration);
  }

  close() {
    this.dialogRef.close();
  }
}
