import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LandingPageComponent } from '../landing-page.component';
import { UploadService } from '../../services/lp-services/upload.service';
import { HotToastService } from '@ngneat/hot-toast';
import { AuthService } from '../../services/lp-services/auth.service';
import { UserLoggedService } from '../../services/lp-services/user-logged.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserInterface } from '../../models/user.interface';

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

/**
 * The AvatarComponent class handles user avatar selection, profile image upload, and related user interactions.
 * 
 * This component is responsible for managing the user's profile image, detecting whether the application is being 
 * viewed on a mobile device, handling avatar selection, and interacting with authentication and user services.
 */
export class AvatarComponent {
  profileImg: string | null = null; 
  authService = inject(AuthService);
  userService = inject(UserLoggedService);
  router = inject(Router)
  currentUser: any
  mobileVersion: boolean = false
  name: string = ''

  avatars: boolean[] = [false, false, false, false, false, false];

  /**
   * Constructor for AvatarComponent.
   * 
   * @param {LandingPageComponent} lp - Instance of the landing page component to manage UI interactions.
   * @param {UploadService} imgUploadService - Service for handling image uploads.
   * @param {HotToastService} toast - Service for displaying toast notifications.
   */
  constructor(private lp: LandingPageComponent, private imgUploadService: UploadService, private toast: HotToastService) {
  }

  /**
 * Initializes the component when it is loaded.
 * 
 * This function checks if the mobile version is active and stores the status in the `mobileVersion` property.
 * Additionally, it awaits the user data provided by the `subscribeToUserData` function.
 * 
 * @async
 * @returns {Promise<void>} - This method returns a promise once initialization is complete.
 */

async ngOnInit() {
  this.lp.$mobileVersion.subscribe(isMobile => {
    this.mobileVersion = isMobile;
  });
  await this.subscribeToUserData();
}


  /**
 * Subscribes to user data if a user ID is available.
 * 
 * This asynchronous function checks if the user ID (uid) is available in the authentication service.
 * If present, it subscribes to the user via the user service and updates the current user's data.
 * The username and profile image are also set accordingly.
 * 
 * @async
 * @returns {Promise<void>} - This method returns a promise once the subscription process is completed.
 */
async subscribeToUserData(): Promise<void> {
  if (this.authService.uid) {
    await this.userService.subscribeUser(this.authService.uid).subscribe((data) => {
      this.currentUser = data;
      this.name = this.authService.userCredential?.user.displayName!
      if(data){
        this.name = this.currentUser.username ;
      if (this.profileImg === null) {
        this.setDefaultProfileImage();
      } 
    }
    });
  }
}


  /**
 * Sets the default profile image for the current user.
 * 
 * This function assigns a default profile image by using a placeholder image and updates the user's image 
 * in the user service with the user ID (uid) from the authentication service.
 * 
 * @returns {void} - Does not return anything.
 */
setDefaultProfileImage(): void {
  const defaultImage = 'assets/img/landing-page/unknown.svg';
  this.userService.updateUserImg(this.authService.uid, defaultImage);
}


 /**
 * Selects an avatar based on the provided index.
 * 
 * This function updates the avatars array, marking the selected avatar by its index. It also sets the profile image
 * to the corresponding avatar image based on the index.
 * 
 * @param {number} index - The index of the selected avatar.
 * @returns {void} - Does not return anything.
 */
choseAvatar(index: number): void {
  this.avatars = this.avatars.map((_, i) => i === index);
  this.profileImg = `assets/img/landing-page/men${index}.svg`; 
}


  /**
 * Navigates back to the sign-up process.
 * 
 * This function resets all states in the landing page service and sets the sign-up state to `true`, 
 * indicating that the user has returned to the sign-up process.
 * 
 * @returns {void} - Does not return anything.
 */
backToSignUp(): void {
  this.lp.resetAllStates();
  this.lp.$signUp = true;
  this.authService.avatar.next(false)
}


/**
 * Handles the image upload process.
 * 
 * This function retrieves the file from the provided event. If a file is selected, it checks if there is a currently authenticated user. 
 * If the user is authenticated, it proceeds to upload the user's image using the provided file.
 * 
 * @param {Event} event - The event triggered by the file input element.
 * @returns {void} - Does not return anything.
 */
 uploadImage(event: Event): void {
  const file = this.getFileFromEvent(event);
  
  if (file) {
    const currentUser = this.authService.currentUserSig();
    if (currentUser) {
      this.uploadUserImage(currentUser.userId, file);
    }
  }
}

/**
 * Extracts a file from the event object.
 * 
 * This function retrieves the file from the input event triggered by a file input element.
 * If a file is selected, it returns the first file from the file list, otherwise, it returns `undefined`.
 * 
 * @param {Event} event - The event triggered by the file input element.
 * @returns {File | undefined} - The selected file or `undefined` if no file is selected.
 */
 getFileFromEvent(event: Event): File | undefined {
  const input = event.target as HTMLInputElement;
  return input.files?.[0];
}

/**
 * Uploads the user's image to the server.
 * 
 * This function uploads a provided image file for the user with the specified user ID using the image upload service.
 * On successful upload, it handles the success by updating the user's profile image with the returned photo URL.
 * If the upload fails, it handles the error accordingly.
 * 
 * @param {string} userId - The unique identifier of the user.
 * @param {File} file - The image file to be uploaded.
 * @returns {void} - Does not return anything.
 */
 uploadUserImage(userId: string, file: File): void {
  this.imgUploadService.uploadImg(userId, file).subscribe({
    next: (photoURL: string) => this.handleUploadSuccess(photoURL),
    error: (err: any) => this.handleUploadError(err)
  });
}

  
/**
 * Handles the success of the image upload.
 * 
 * This function is called when the image upload is successful. It updates the profile image with the new photo URL
 * and logs a success message to the console.
 * 
 * @param {string} photoURL - The URL of the successfully uploaded image.
 * @returns {void} - Does not return anything.
 */
 handleUploadSuccess(photoURL: string): void {
  this.profileImg = photoURL;
}

  
/**
 * Handles errors that occur during the image upload process.
 * 
 * This function is called if the image upload fails. It logs the error message to the console for debugging purposes.
 * 
 * @param {any} err - The error object containing details of the upload failure.
 * @returns {void} - Does not return anything.
 */
 handleUploadError(err: any): void {
  console.error('Fehler beim Hochladen des Bildes:', err);
}

/**
 * Programmatically triggers the file upload dialog.
 * 
 * This function simulates a click on the provided file input element, prompting the user to select a file.
 * 
 * @param {HTMLInputElement} inputElement - The file input element to trigger.
 * @returns {void} - Does not return anything.
 */
 triggerFileUpload(inputElement: HTMLInputElement): void {
  inputElement.click();
}

/**
 * Saves the profile image and proceeds to the next step.
 * 
 * This asynchronous function checks if both the profile image and the current user are available. 
 * If they are, it attempts to update the user's profile image. Upon success, it displays a registration 
 * pop-up, logs out the user, and redirects them back to the login page after a delay. 
 * If an error occurs during the image update, it logs the error to the console.
 * 
 * @async
 * @returns {Promise<void>} - This method returns a promise once the process is complete.
 */
 async saveProfileAndContinue(): Promise<void> {
  if (this.profileImg && this.currentUser) {
    try {
      await this.userService.updateUserImg(this.authService.uid, this.profileImg);
      this.lp.showPopUp('regist');
      this.authService.logout();
      setTimeout(() => {
        this.backToLogin();
      }, 1500);
    } catch (err) {
      console.error('Error updating user image:', err);
    }
  } else {
    console.error('No profile image selected or user not found.');
  }
}


/**
 * Resets the application state and navigates back to the login screen.
 * 
 * This function clears the user's authentication ID, resets all states in the landing page service, 
 * and sets the login state to `true`, indicating that the login page should be displayed.
 * 
 * @returns {void} - Does not return anything.
 */
 backToLogin(): void {
  this.authService.uid = '';
  this.authService.avatar.next(false)
  this.lp.resetAllStates();
  this.lp.$login = true;
}

}
