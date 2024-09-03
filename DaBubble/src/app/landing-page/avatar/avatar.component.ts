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
  profileImg: string | null = null; 
  authService = inject(AuthService);
  userService = inject(UserLoggedService);
  router = inject(Router)
  currentUser = this.authService.currentUserSig();
  mobileVersion: boolean = false

  avatars: boolean[] = [false, false, false, false, false, false];

  constructor(private lp: LandingPageComponent, private imgUploadService: UploadService, private toast: HotToastService) {
  }

  ngOnInit() {
    this.lp.$mobileVersion.subscribe(isMobile => {
      this.mobileVersion = isMobile;
    });
  }

  choseAvatar(index: number) {
    this.avatars = this.avatars.map((_, i) => i === index);
    this.profileImg = `assets/img/landing-page/men${index}.svg`; 
  }

  backToSignUp() {
    this.lp.resetAllStates()
    this.lp.$signUp = true
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
        this.lp.showPopUp('regist')
        this.authService.logout()
        setTimeout(() => {
          this.backToLogin()
        }, 1500);
      } catch (err) {
        console.error('Error updating user image:', err);
      }
    } else {
      console.error('No profile image selected or user not found.');
    }
  }

  backToLogin(){
    this.authService.uid = ''
    this.lp.resetAllStates()
     this.lp.$login = true
   }
}
