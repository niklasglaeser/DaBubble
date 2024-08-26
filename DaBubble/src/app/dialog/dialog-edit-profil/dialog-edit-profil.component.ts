import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserLogged } from '../../models/user-logged.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-dialog-edit-profil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-edit-profil.component.html',
  styleUrl: './dialog-edit-profil.component.scss',
})
export class DialogEditProfilComponent {
  isOpen = true;
  currentUserId$ = new BehaviorSubject<string | null>(null);

  title: string = 'Profil';
  profilName: string = 'Frederick Beck';
  profilEmail: string = 'fred.beck@gmail.com';

  editName: string = 'Bearbeiten';
  editNameClicked: boolean = false;

  inputNameDisabled: boolean = false; //testing

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { user: UserLogged },
    private auth: Auth = inject(Auth),
    public dialogRef: MatDialogRef<DialogEditProfilComponent>
  ) {
    this.getCurrentUserId();
    console.log('Received user data:', data); // Füge dies hinzu
  }

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

  close() {
    this.dialogRef.close();
  }

  getCurrentUserId() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserId$.next(user ? user.uid : null);
    });
  }
}
