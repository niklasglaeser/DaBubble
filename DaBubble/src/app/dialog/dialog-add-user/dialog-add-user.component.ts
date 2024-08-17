import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  HostListener,
} from '@angular/core';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

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
export class DialogAddUserComponent {
  @Input() allUsers: User[] = [];
  @Input() selectedUsers: User[] = [];
  @Input() filteredUsers: User[] = [];
  @Output() removeUser = new EventEmitter<User>();

  userControl = new FormControl();
  isPanelOpen!: boolean;

  handleUserSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value.toLowerCase();
    this.filterUsers(query);
  }

  filterUsers(query: string): void {
    this.filteredUsers = this.allUsers.filter((user) =>
      user.name.toLowerCase().includes(query)
    );
  }

  addUserToSelection(user: User): void {
    if (!this.selectedUsers.includes(user)) {
      this.selectedUsers.push(user);
      this.filteredUsers = this.filteredUsers.filter((u) => u.id !== user.id);
      this.userControl.setValue('');
    }
  }

  removeSelectedUser(user: User): void {
    this.removeUser.emit(user);
    this.filteredUsers.push(user);
    this.filteredUsers.sort((a, b) => a.name.localeCompare(b.name));
  }

  onAutocompleteClosed(): void {
    this.isPanelOpen = false;
  }
}
