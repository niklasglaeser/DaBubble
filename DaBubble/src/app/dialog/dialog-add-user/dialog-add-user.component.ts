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
  @Input() filteredUsers: UserLogged[] = [];
  @Output() removeUser = new EventEmitter<UserLogged>();

  userControl = new FormControl();
  isPanelOpen!: boolean;

  ngOnInit(): void {
    this.filteredUsers = this.users.slice();
  }

  handleUserSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value.toLowerCase();
    this.filterUsers(query);
  }

  filterUsers(query: string): void {
    this.filteredUsers = this.users.filter((user) =>
      user.username.toLowerCase().includes(query)
    );
  }

  addUserToSelection(user: UserLogged): void {
    if (!this.selectedUsers.some((u) => u.uid === user.uid)) {
      this.selectedUsers.push(user);
      this.filteredUsers = this.filteredUsers.filter((u) => u.uid !== user.uid);
      this.userControl.setValue('');
    }
  }
  removeSelectedUser(user: UserLogged): void {
    this.removeUser.emit(user);

    let alreadyInFilteredUsers = this.filteredUsers.some(
      (u) => u.uid === user.uid
    );

    if (!alreadyInFilteredUsers) {
      this.filteredUsers.push(user);
      this.filteredUsers.sort((a, b) => a.username.localeCompare(b.username));
    }
  }
  onAutocompleteClosed(): void {
    this.isPanelOpen = false;
  }
}
