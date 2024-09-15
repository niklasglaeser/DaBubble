import { Injectable } from '@angular/core';
import { Storage, ref, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { uploadBytes } from '@firebase/storage';
import { from, Observable, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'application/pdf'];

  private maxFileSize = 500 * 1024; 

  constructor(private storage: Storage) { }

/**
 * Uploads a user profile image to the storage and returns the download URL of the uploaded image.
 * 
 * This method uploads an image to a specific storage path in the user's profile image folder using the user's ID and the image's name. 
 * After the upload is complete, it retrieves the download URL for the uploaded image.
 * 
 * @param {string} userId - The unique identifier of the user.
 * @param {File} image - The image file to be uploaded.
 * @returns {Observable<string>} - An observable that emits the download URL of the uploaded image.
 */
 uploadImg(userId: string, image: File): Observable<string> {
  const storagePath = `user-profile-images/${userId}/${image.name}`;
  const storageRef = ref(this.storage, storagePath);
  return from(uploadBytes(storageRef, image)).pipe(
    switchMap(result => getDownloadURL(result.ref))
  );
}

/**
 * Generates a random number within a specified range.
 * 
 * This method returns a random number between the provided `min` (inclusive) and `max` (exclusive) values.
 * 
 * @param {number} min - The minimum value of the range (inclusive).
 * @param {number} max - The maximum value of the range (exclusive).
 * @returns {number} - A random number between `min` and `max`.
 */
 getRandomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Uploads a chat image to the specified channel and returns the download URL of the uploaded image.
 * 
 * This method checks if the uploaded file type is valid (images and PDFs only) and if the file size is within the allowed limit (500KB).
 * If both validations pass, the image is uploaded to the storage path for the specific channel and user, using a random index to ensure 
 * unique file paths. After the upload is complete, the download URL for the uploaded image is returned.
 * 
 * @param {string} userId - The unique identifier of the user uploading the image.
 * @param {File} image - The image file to be uploaded.
 * @param {any} channelId - The ID of the chat channel where the image will be uploaded.
 * @returns {Observable<string>} - An observable that emits the download URL of the uploaded image.
 * @throws {Error} - Throws an error if the file type is invalid or the file size exceeds the limit.
 */
 uploadImgChat(userId: string, image: File, channelId: any): Observable<string> {
  if (!this.isValidFileType(image)) {
    return throwError(() => new Error('Invalid file type. Only images and PDFs are allowed.'));
  }
  if (!this.isValidFileSize(image)) {
    return throwError(() => new Error('File size exceeds the 500KB limit.'));
  }
  
  const index = this.getRandomInRange(0.00001, 9999999);
  const storagePath = `chat/${channelId}/${userId}/${index}/${image.name}`;
  const storageRef = ref(this.storage, storagePath);
  
  return from(uploadBytes(storageRef, image)).pipe(
    switchMap(result => getDownloadURL(result.ref))
  );
}

/**
 * Deletes an image from the chat storage at the specified path.
 * 
 * This method deletes the image from Firebase storage based on the provided storage path. It creates a reference
 * to the storage object and deletes the file at that location.
 * 
 * @param {string} path - The storage path of the image to be deleted.
 * @returns {Observable<void>} - An observable that completes when the image has been successfully deleted.
 */
 deleteImgChat(path: string): Observable<void> {
  const storagePath = path;
  const storageRef = ref(this.storage, storagePath);
  return from(deleteObject(storageRef));
}

  private isValidFileType(file: File): boolean {
    return this.allowedFileTypes.includes(file.type);
  }

  private isValidFileSize(file: File): boolean {
    return file.size <= this.maxFileSize;
  }
}
