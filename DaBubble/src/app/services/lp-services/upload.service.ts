import { Injectable } from '@angular/core';
import { Storage, ref, getDownloadURL } from '@angular/fire/storage';
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

}
