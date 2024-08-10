import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dialog-edit-profil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-edit-profil.component.html',
  styleUrl: './dialog-edit-profil.component.scss',
})
export class DialogEditProfilComponent {
  isOpen = true;

  title: string = 'Profil';
  profilName: string = 'Frederick Beck';
  profilEmail: string = 'fred.beck@gmail.com';

  editName: string = 'Bearbeiten';
  editNameClicked: boolean = false;

  inputNameDisabled: boolean = false; //testing

  constructor() {}

  editProfilBtn(event: Event) {
    if (!this.editNameClicked) {
      this.editNameClicked = true;
      this.editName = 'Speichern';
    } else {
      try {
        this.editNameClicked = false;
        this.editName = 'Bearbeiten';
        this.channelUpdate(event);
      } catch {
        console.log('error');
      }
    }
  }

  channelUpdate(event: Event) {
    console.log('Channel update' + event);
  }

  toggleDialog() {
    this.isOpen = !this.isOpen;
  }
}
