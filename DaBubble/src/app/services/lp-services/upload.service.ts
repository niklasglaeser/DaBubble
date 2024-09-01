import { Injectable } from '@angular/core';
import { Storage, ref, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { uploadBytes } from '@firebase/storage';
import { from, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

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
    const index = this.getRandomInRange(0.00001,9999999)
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

  
}
