import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/lp-services/auth.service';
import { UploadService } from '../../../services/lp-services/upload.service';
import { UserLoggedService } from '../../../services/lp-services/user-logged.service';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserLogged } from '../../../models/user-logged.model';
import { user, User } from '@angular/fire/auth';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarProfileComponent {
  profileImg: string | null = null 
  authService = inject(AuthService);
  userService = inject(UserLoggedService);
  dialogRef = inject(MatDialogRef)
  router = inject(Router)
  currentUser = this.authService.currentUserSig();

  avatars: boolean[] = [false, false, false, false, false, false];

  constructor( private imgUploadService: UploadService,) {
  }

  ngOnInit(): void {
    this.subscribeToUserData()
    
  }

  async subscribeToUserData(): Promise<void> {
    if (this.authService.uid) {
      await this.userService.subscribeUser(this.authService.uid).subscribe((data) => {
        this.profileImg = data?.photoURL!
      });
    }
  }

  choseAvatar(index: number) {
    this.avatars = this.avatars.map((_, i) => i === index);
    this.profileImg = `assets/img/landing-page/men${index}.svg`; 
  }

  backToProfile() {
    this.dialogRef.close(AvatarProfileComponent)
  }

  uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      const currentUser = this.authService.currentUserSig();
      if (currentUser) {
        this.imgUploadService.uploadImg(currentUser.userId,file).pipe(
        ).subscribe({
          next: (photoURL: string) => {
            this.profileImg = photoURL;
            console.log('Bild erfolgreich hochgeladen:', photoURL);
          },
          error: (err: any) => {
            console.error('Fehler beim Hochladen des Bildes:', err);
          }
        });
      }
    }
  }

  triggerFileUpload(inputElement: HTMLInputElement) {
    inputElement.click();
  }

  async saveProfileAndContinue() {
    if (this.profileImg && this.currentUser) {
      try {
        await this.userService.updateUserImg(this.authService.uid, this.profileImg);
        setTimeout(() => {
          this.backToProfile()
        }, 1500);
      } catch (err) {
        console.error('Error updating user image:', err);
      }
    } else {
      console.error('No profile image selected or user not found.');
    }
  }

 
}
