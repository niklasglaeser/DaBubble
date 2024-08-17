// src/app/dialog-add-channel/dialog-add-channel.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Channel } from '../../../app/models/channel.class';
import { ChannelService } from '../../models/channel.service';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-dialog-add-channel',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    DialogAddUserComponent,
    MatAutocompleteModule,
    MatChipsModule,
    MatFormFieldModule,
  ],
  templateUrl: './dialog-add-channel.component.html',
  styleUrls: ['./dialog-add-channel.component.scss'],
})
export class DialogAddChannelComponent implements OnInit {
  addChannelForm: FormGroup;
  addUserForm: FormGroup;
  showInputField = false;
  addChannel: boolean = true;
  currentStep: 'channel' | 'user' = 'channel';
  channelName: string = '';

  isPanelOpen!: boolean;
  userControl = new FormControl();
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  selectedUsers: User[] = [];

  unsubscribe: any;

  constructor(
    private fbChannel: FormBuilder,
    private fbUser: FormBuilder,
    public dialogRef: MatDialogRef<DialogAddChannelComponent>,
    private channelService: ChannelService,
    private userService: UserService
  ) {
    this.addChannelForm = this.fbChannel.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
    });
    this.addUserForm = this.fbUser.group({
      selection: ['', Validators.required],
      specificMembers: [''],
    });
  }

  get selectedUsersDisplay(): string {
    return this.selectedUsers.map((user) => user.name).join(', ');
  }

  ngOnInit(): void {
    this.unsubscribe = this.loadAllUsers();
  }

  loadAllUsers(): void {
    this.userService.getUsersList().subscribe((users) => {
      this.allUsers = users;
      this.filteredUsers = users;
    });
  }

  async submit() {
    if (this.addChannelForm.valid) {
      let formData = this.addChannelForm.value;
      let newChannel = new Channel({
        name: formData.name,
        description: formData.description,
      });
      try {
        await this.channelService.createChannel(newChannel);
        console.log('Channel created successfully:', newChannel);
        this.channelName = formData.name;
        this.currentStep = 'user';
      } catch (e) {
        console.error('Error creating channel:', e);
      }
    }
  }

  submitUser() {
    if (this.addUserForm.valid) {
      let formData = this.addUserForm.value;
      console.log('Users added to channel:', formData);
      this.dialogRef.close();
    }
  }

  onSearchUsers(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value.toLowerCase();
    this.searchUsers(query);
  }

  searchUsers(query: string): void {
    this.filteredUsers = this.allUsers.filter((user) =>
      user.name.toLowerCase().includes(query)
    );
  }

  selectUser(user: User): void {
    if (!this.selectedUsers.includes(user)) {
      this.selectedUsers.push(user);
      console.log(this.selectedUsers);
      this.filteredUsers = this.filteredUsers.filter((u) => u.id !== user.id);
      this.userControl.setValue('');
    }
  }

  removeUser(user: User): void {
    this.selectedUsers = this.selectedUsers.filter((u) => u !== user);
    this.filteredUsers.push(user);
  }
  close() {
    this.dialogRef.close();
  }
}
