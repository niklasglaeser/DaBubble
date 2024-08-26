import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserLogged } from '../../models/user-logged.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '../../services/user.service';
import { getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-dialog-edit-profil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-edit-profil.component.html',
  styleUrl: './dialog-edit-profil.component.scss'
})
export class DialogEditProfilComponent implements OnInit {
  isOpen = true;
  currentUserId$ = new BehaviorSubject<string | null>(null);
  user!: UserLogged;

  title: string = 'Profil';
  profilName: string = '';
  profilEmail: string = '';

  editName: string = 'Bearbeiten';
  editNameClicked: boolean = false;

  inputNameDisabled: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { user: UserLogged }, private auth: Auth = inject(Auth), public dialogRef: MatDialogRef<DialogEditProfilComponent>, private userService: UserService) {
    this.getCurrentUserId();
  }

  ngOnInit() {
    this.loadProfile();
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

  async loadProfile() {
    if (this.data.user.uid) {
      const userDoc = this.userService.getSingleUser(this.data.user.uid);
      const userData = (await getDoc(userDoc)).data();

      if (userData) {
        this.user = new UserLogged({
          uid: this.data.user.uid,
          ...userData
        });
        this.profilName = this.user.username;
        this.profilEmail = this.user.email;
      }
    }
  }

  async updateUser() {
    if (!this.profilName || !this.profilEmail) {
      console.error('Name und E-Mail dürfen nicht leer sein.');
      return;
    }

    const nameParts = this.profilName.trim().split(' ');
    if (nameParts.length < 2) {
      return;
    }

    if (this.user) {
      try {
        this.user.username = this.profilName;
        this.user.email = this.profilEmail;

        await this.userService.updateUser(this.user.uid, this.user);
        this.dialogRef.close(this.user);
      } catch (e) {
        console.error('Error updating user', e);
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
