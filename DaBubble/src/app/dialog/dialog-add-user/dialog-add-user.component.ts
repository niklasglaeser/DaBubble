import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UserLogged } from '../../models/user-logged.model';

@Component({
  selector: 'app-dialog-add-user',
  standalone: true,
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
  templateUrl: './dialog-add-user.component.html',
  styleUrl: './dialog-add-user.component.scss',
})
export class DialogAddUserComponent implements OnInit {
  @Input() users: UserLogged[] = [];
  @Input() selectedUsers: UserLogged[] = [];
  @Output() removeUser = new EventEmitter<UserLogged>();
  @Output() updatedUsers = new EventEmitter<UserLogged[]>();

  userControl = new FormControl();
  filteredUsers: UserLogged[] = [];
  isPanelOpen!: boolean;

  ngOnInit(): void {
    this.updateFilteredUsers('');
  }

  handleUserSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value.toLowerCase();
    this.updateFilteredUsers(query);
  }

  updateFilteredUsers(query: string): void {
    // Filter users to exclude selected users and match the search query
    this.filteredUsers = this.users.filter(
      (user) =>
        !this.selectedUsers.some((selected) => selected.uid === user.uid) && // Exclude selected users
        user.username.toLowerCase().includes(query) // Match the search query
    );
  }

  addUserToSelection(user: UserLogged): void {
    if (!this.selectedUsers.some((u) => u.uid === user.uid)) {
      this.selectedUsers.push(user);
      this.updateFilteredUsers(''); // Update filtered list after selection
      this.userControl.setValue('');
      this.emitUpdatedUsers();
    }
  }

  removeSelectedUser(user: UserLogged): void {
    this.selectedUsers = this.selectedUsers.filter((u) => u.uid !== user.uid);
    this.updateFilteredUsers(''); // Update filtered list after removal
    this.emitUpdatedUsers();
  }

  emitUpdatedUsers(): void {
    this.updatedUsers.emit(this.selectedUsers);
  }

  onAutocompleteClosed(): void {
    this.isPanelOpen = false;
  }
}
