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

  uploadImg(userId: string, image: File): Observable<string> {
    const storagePath = `user-profile-images/${userId}/${image.name}`;
    const storageRef = ref(this.storage, storagePath);
    
    return from(uploadBytes(storageRef, image)).pipe(
      switchMap(result => getDownloadURL(result.ref))
    );
  }

  getRandomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

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

  deleteImgChat(path:string): Observable<void> {
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
