import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  isChannelsDropdownOpen = true;
  isMessagesDropdownOpen = true;
  isActive = true;
  isOnline = true;

  channels = Array(5).fill(0);
  directUser = Array(5).fill(0);

  addChannel() {
    console.log('add channel');
  }

  openChannel() {
    console.log('open channel');
  }
  openDirectmessage() {
    console.log('open Directmessage');
  }

  toggleDropdown(menu: string) {
    if (menu === 'channels') {
      this.isChannelsDropdownOpen = !this.isChannelsDropdownOpen;
    } else if (menu === 'messages') {
      this.isMessagesDropdownOpen = !this.isMessagesDropdownOpen;
    }
  }
}
