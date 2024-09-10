import { CommonModule } from '@angular/common';
import { Component, Inject, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserLogged } from '../../models/user-logged.model';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '../../services/user.service';
import { getDoc } from '@angular/fire/firestore';
import { DialogAddChannelComponent } from '../dialog-add-channel/dialog-add-channel.component';
import { SidebarComponent } from '../../dashboard/content/sidebar/sidebar.component';
import { ChannelStateService } from '../../services/channel-state.service';
import { AvatarComponent } from '../../landing-page/avatar/avatar.component';
import { AvatarProfileComponent } from './avatar/avatar.component';
import { AuthService } from '../../services/lp-services/auth.service';
import { UserLoggedService } from '../../services/lp-services/user-logged.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dialog-edit-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, MatIconModule],
  templateUrl: './dialog-edit-profil.component.html',
  styleUrl: './dialog-edit-profil.component.scss'
})
export class DialogEditProfilComponent implements OnInit {
  authService = inject(AuthService)
  UserService = inject(UserLoggedService)
  // isOpen = true;
  currentUserId$ = new BehaviorSubject<string | null>(null);
  user!: UserLogged;

  title: string = 'Profil';
  profilName: string = '';
  profilEmail: string = '';
  profileImg: string = ''
  edit: boolean = false


  editName: string = 'Bearbeiten';
  editNameClicked: boolean = false;

  inputNameDisabled: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { user: UserLogged }, private auth: Auth = inject(Auth), public dialogRef: MatDialogRef<DialogEditProfilComponent>, private userService: UserService, private channelStateService: ChannelStateService, private dialog: MatDialog) {
    this.getCurrentUserId();
  }

  ngOnInit() {
    this.loadProfile();
    // this.subscribeToUserData()
  }

  /* Bug DM Header -> open profile dialog -> falsches photo wenn alles gut, kann raus*/
  async subscribeToUserData(): Promise<void> {
    if (this.authService.uid) {
      await this.UserService.subscribeUser(this.authService.uid).subscribe((data) => {
        this.profileImg = data?.photoURL!
      });
    }
  }
  /* Bug DM Header -> open profile dialog -> falsches photo wenn alles gut, kann raus*/

  editProfilBtn(event: Event) {
    if (!this.editNameClicked) {
      this.editNameClicked = true;
      this.editName = 'Speichern';
      this.edit = true
    } else {
      try {
        this.editNameClicked = false;
        this.editName = 'Bearbeiten';
        this.edit = false
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

  openDirectMessage(userId: string) {
    this.channelStateService.openDirectMessage(userId);
    this.dialog.closeAll();

  }
  // toggleDialog() {
  //   this.isOpen = !this.isOpen;
  // }

  close() {
    this.dialogRef.close();
  }

  getCurrentUserId() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserId$.next(user ? user.uid : null);
    });
  }

  openProfilAvatar() {
    if (this.edit) {
      const dialogRef = this.dialog.open(AvatarProfileComponent, {
        width: '100vw', // Setze die Breite auf 80% des Viewports
        maxWidth: '550px', // Maximalbreite von 600px
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Aktualisieren Sie die Benutzerdaten, nachdem das Bild hochgeladen wurde
          this.loadProfile();
        }
      });
    }
    this.close()
  }
}
