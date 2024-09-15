import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/lp-services/auth.service';
import { UploadService } from '../../../services/lp-services/upload.service';
import { UserLoggedService } from '../../../services/lp-services/user-logged.service';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

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
  name: string = ''
  mobileVersion = new BehaviorSubject<boolean>(window.innerWidth <= 650);

  avatars: boolean[] = [false, false, false, false, false, false];

  constructor(private imgUploadService: UploadService,) {
  }

  /**
   * HostListener for the window resize event. Calls checkMobileVersion on resize.
   * @param {Event} event - The resize event.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkMobileVersion();
  }

  /**
   * Checks if the window width is less than or equal to 650px and updates the mobileVersion observable.
   */
  checkMobileVersion() {
    this.mobileVersion.next(window.innerWidth <= 650);
  }

  /**
   * Angular lifecycle hook called on component initialization.
   * Checks the mobile version and subscribes to user data.
   */
  ngOnInit(): void {
    this.checkMobileVersion();
    this.subscribeToUserData();
  }

  /**
   * Subscribes to user data based on the authenticated user's ID.
   * Updates the profile image and username upon receiving the user data.
   * @returns {Promise<void>} A promise that resolves when the subscription is set up.
   */
  async subscribeToUserData(): Promise<void> {
    if (this.authService.uid) {
      await this.userService.subscribeUser(this.authService.uid).subscribe((data) => {
        this.profileImg = data?.photoURL!;
        this.name = data?.username!;
      });
    }
  }

  /**
   * Selects an avatar by index and updates the profile image accordingly.
   * @param {number} index - The index of the avatar to select.
   */
  choseAvatar(index: number) {
    this.avatars = this.avatars.map((_, i) => i === index);
    this.profileImg = `assets/img/landing-page/men${index}.svg`;
  }

  /**
   * Closes the dialog and returns to the AvatarProfileComponent.
   */
  backToProfile() {
    this.dialogRef.close(AvatarProfileComponent);
  }

  /**
   * Handles image upload from the user's input.
   * @param {Event} event - The file input change event containing the selected image.
   */
  uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const currentUser = this.authService.currentUserSig();
      if (currentUser) {
        this.imgUploadService.uploadImg(currentUser.userId, file).pipe(
        ).subscribe({
          next: (photoURL: string) => {
            this.profileImg = photoURL;
          },
          error: (err: any) => {
            console.error('Fehler beim Hochladen des Bildes:', err);
          }
        });
      }
    }
  }

  /**
   * Triggers the file upload by programmatically clicking the file input element.
   * @param {HTMLInputElement} inputElement - The input element to trigger the click event.
   */
  triggerFileUpload(inputElement: HTMLInputElement) {
    inputElement.click();
  }

  /**
   * Saves the profile image and closes the dialog with the updated profile image.
   * If an image is not selected or the user is not found, logs an error.
   * @returns {Promise<void>} A promise that resolves when the profile image is updated.
   */
  async saveProfileAndContinue() {
    if (this.profileImg && this.currentUser) {
      try {
        await this.userService.updateUserImg(this.authService.uid, this.profileImg);
        setTimeout(() => {
          this.dialogRef.close(this.profileImg);
        }, 1500);
      } catch (err) {
        console.error('Error updating user image:', err);
      }
    } else {
      console.error('No profile image selected or user not found.');
    }
  }
}
