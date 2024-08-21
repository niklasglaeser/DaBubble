import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LandingPageComponent } from '../landing-page.component';
import { UploadService } from '../../services/lp-services/upload.service';
import { HotToastService } from '@ngneat/hot-toast';
import { AuthService } from '../../services/lp-services/auth.service';
import { UserLoggedService } from '../../services/lp-services/user-logged.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    LandingPageComponent,
  ],
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent {
  profileImg: string | null = null;  // TypeScript-typischer Ansatz
  authService = inject(AuthService);
  userService = inject(UserLoggedService);
  router = inject(Router)
  currentUser = this.authService.currentUserSig();

  avatars: boolean[] = [false, false, false, false, false, false];

  constructor(private lp: LandingPageComponent, private imgUploadService: UploadService, private toast: HotToastService) {
    this.authService.subscribeUser();
  }

  choseAvatar(index: number) {
    this.avatars = this.avatars.map((_, i) => i === index);
    this.profileImg = `assets/img/landing-page/men${index}.svg`; // Setze die Avatar-URL
  }

  backToSignUp() {
    this.router.navigate(['/landing-page/login']);
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
        await this.userService.updateUserImg(this.currentUser.userId!, this.profileImg);
        this.router.navigate(['/landing-page/login']);
        this.authService.logout()
      } catch (err) {
        console.error('Error updating user image:', err);
      }
    } else {
      console.error('No profile image selected or user not found.');
    }
  }
}
