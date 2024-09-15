import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UserLogged } from '../../models/user-logged.model';

@Component({
  selector: 'app-dialog-add-user',
  standalone: true,
  imports: [CommonModule, MatAutocompleteModule, MatChipsModule, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './dialog-add-user.component.html',
  styleUrl: './dialog-add-user.component.scss'
})
export class DialogAddUserComponent implements OnInit {
  @Input() allUsers: UserLogged[] = [];
  @Input() selectedUsers: UserLogged[] = [];
  @Output() removeUser = new EventEmitter<UserLogged>();
  @Output() updatedUsers = new EventEmitter<UserLogged[]>();

  @ViewChild('auto') matAutocomplete!: MatAutocomplete;

  userControl = new FormControl();
  filteredUsers: UserLogged[] = [];
  isPanelOpen!: boolean;

  /**
   * Initializes the component by updating the filtered users with an empty query.
   */
  ngOnInit(): void {
    this.updateFilteredUsers('');
  }

  /**
   * Handles the user input in the search field and updates the filtered users list.
   * @param {Event} event - The input event from the search field.
   */
  handleUserSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value.toLowerCase();
    this.updateFilteredUsers(query);
  }

  /**
   * Updates the list of filtered users based on the search query.
   * Excludes users who are already selected.
   * @param {string} query - The search query entered by the user.
   */
  updateFilteredUsers(query: string): void {
    this.filteredUsers = this.allUsers.filter((user) =>
      !this.selectedUsers.some((selected) => selected.uid === user.uid) &&
      user.username.toLowerCase().includes(query)
    );
  }

  /**
   * Adds a user to the selected users list if they are not already selected.
   * Clears the user control and updates the filtered users.
   * @param {UserLogged} user - The user to add to the selection.
   */
  addUserToSelection(user: UserLogged): void {
    if (!this.selectedUsers.some((u) => u.uid === user.uid)) {
      this.selectedUsers.push(user);
      this.updateFilteredUsers('');
      this.userControl.setValue('');
      this.emitUpdatedUsers();
    }
  }

  /**
   * Removes a user from the selected users list.
   * Updates the filtered users and emits the updated users list.
   * @param {UserLogged} user - The user to remove from the selection.
   */
  removeSelectedUser(user: UserLogged): void {
    this.selectedUsers = this.selectedUsers.filter((u) => u.uid !== user.uid);
    this.updateFilteredUsers('');
    this.emitUpdatedUsers();
  }

  /**
   * Emits an event with the updated list of selected users.
   */
  emitUpdatedUsers(): void {
    this.updatedUsers.emit(this.selectedUsers);
  }

  /**
   * Handles the event when the autocomplete panel is closed.
   * Sets the isPanelOpen flag to false.
   */
  onAutocompleteClosed(): void {
    this.isPanelOpen = false;
  }

}
