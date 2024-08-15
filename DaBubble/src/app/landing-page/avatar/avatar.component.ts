import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import { LandingPageComponent } from '../landing-page.component';
import { User } from '@angular/fire/auth';
import { UploadService } from '../../services/lp-services/upload.service';
import { HotToastService } from '@ngneat/hot-toast';
import { concatMap, of } from 'rxjs';
import { AuthService } from '../../services/lp-services/auth.service';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    LandingPageComponent,
  ],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {
profileImg: any
authService = inject(AuthService)


 avatars: boolean [] = [
  false,
  false,
  false,
  false,
  false,
  false,
  ]

  constructor(private lp: LandingPageComponent, private imgUploadService: UploadService, private toast: HotToastService) {
    
  }
  choseAvatar(index: number){
    for(let i = 0 ; i < this.avatars.length ; i++){
      this.avatars[i]= false
    }
    this.avatars[index] = true
    this.profileImg = `assets/img/landing-page/men${index}.svg`;
  }

  backToSignUp(){
    this.lp.$avatar = false
    this.lp.$signUp = true
  }

  uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
        this.imgUploadService.uploadeImg(file, `assets/img/landing-page/user-profile`).pipe(
            this.toast.observe({
                success: 'Bild erfolgreich hochgeladen!',
                loading: 'Bild wird hochgeladen...',
                error: 'Fehler beim Hochladen des Bildes',
            })
        ).subscribe({
            next: (photoURL: string) => {
                this.profileImg = photoURL;
                console.log('Bild erfolgreich hochgeladen:', photoURL);
            },
            error: (err) => {
                console.error('Fehler beim Hochladen des Bildes:', err);
            }
        });
    }
  }

  // This function is called when the upload button is clicked
  triggerFileUpload(inputElement: HTMLInputElement) {
    inputElement.click();
  }

  saveProfileAndContinue() {
    const currentUser = this.authService.firebaseAuth.currentUser; 

    if (this.profileImg && currentUser) {
        this.authService.updateProfileData({ photoURL: this.profileImg }).subscribe({
            next: () => {
                this.lp.$avatar = false;
                this.lp.$login = true; 
                console.log(currentUser) 
            },
            error: (err) => console.error('Error updating profile:', err)
        });
    } else {
        console.error('No profile image selected or user not found.');
    }
}


}




