import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dialog-overview-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-overview-users.component.html',
  styleUrl: './dialog-overview-users.component.scss',
})
export class DialogOverviewUsersComponent {
  isOpen = true;
  isOnline = true;

  Users = Array(5).fill(0);

  openProfil() {
    console.log('open profile');
  }
  addUser() {
    console.log('add user');
  }

  toggleDialog() {
    this.isOpen = !this.isOpen;
  }
}
