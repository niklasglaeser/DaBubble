// src/app/dialog-add-channel/dialog-add-channel.component.ts
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
import { arrayUnion, doc, Firestore, updateDoc } from '@angular/fire/firestore';
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

  userControl = new FormControl();
  users: UserLogged[] = [];
  filteredUsers: UserLogged[] = [];
  selectedUsers: UserLogged[] = [];

  currentUser: UserLogged | null = null;

  unsubscribe: any;
  createdChannel: any;

  allowDuplicateNames: boolean = true;

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

  ngOnInit(): void {
    this.userService.users$.subscribe((users) => {
      this.users = users;
    });
  }

  async submit() {
    if (this.addChannelForm.valid) {
      let formData = this.addChannelForm.value;
      let newChannelName = formData.name;

      try {
        if (!this.allowDuplicateNames) {
          const nameExists = await this.channelService.checkChannelExists(newChannelName);
          if (nameExists) {
            console.log('Channel name already exists.');
            return;
          }
        }
        const currentUser = this.authService.currentUserSig();
        let newChannel = new Channel({
          name: formData.name,
          description: formData.description,
          creator: currentUser?.username
        });
        let channelId = await this.channelService.createChannel(newChannel);
        if (channelId) {
          this.channelName = formData.name;
          this.createdChannel = channelId;
          this.currentStep = 'user';
        }
      } catch (e) {
        console.error('Error creating channel:', e);
      }
    }
  }

  async submitUser() {
    if (this.addUserForm.valid && this.createdChannel) {
      let userIds: string[];
      if (this.addUserForm.get('selection')?.value === 'all') {
        userIds = this.users.map((user) => user.uid);
      } else {
        userIds = this.selectedUsers.map((user) => user.uid);
      }
      try {
        await this.channelService.addUsersToChannel(this.createdChannel, userIds);
        await this.updateUserProfilesWithChannel(userIds, this.createdChannel);
        this.dialogRef.close();
      } catch (e) {
        console.error('Error adding users to channel:', e);
      }
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
    } catch (e) {
      console.error('Error updating user profiles with channel:', e);
      throw e;
    }
  }

  removeUser(user: UserLogged): void {
    // Stelle sicher, dass 'user' den Typ 'UserLogged' hat
    this.selectedUsers = this.selectedUsers.filter((u) => u.uid !== user.uid);

    let alreadyInFilteredUsers = this.filteredUsers.some((u) => u.uid === user.uid);

    if (!alreadyInFilteredUsers) {
      this.filteredUsers.push(user);
      this.filteredUsers.sort((a, b) => a.username.localeCompare(b.username));
    }
  }

  close() {
    this.dialogRef.close();
  }
}
