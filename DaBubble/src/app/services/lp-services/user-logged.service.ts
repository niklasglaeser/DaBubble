import { Injectable, inject } from '@angular/core';
import { addDoc, collection, Firestore, updateDoc, doc, DocumentReference, setDoc } from '@angular/fire/firestore';
import { UserLogged } from '../../models/user-logged.model';



@Injectable({
  providedIn: 'root',
})
export class UserLoggedService {
  firestore = inject(Firestore);
  CRMcollection = collection(this.firestore, 'Users');
  id = '';

  constructor(){}

  async updateUserImg(id: string, photoURL: string) {
    const docRef: DocumentReference = doc(this.CRMcollection, id);
    try {
      await updateDoc(docRef,  { photoURL } ); 
      console.log("Document successfully updated.");
    } catch (error) {
      console.error("Error updating document:", error);
    }
  }

  // async addUser(user: UserLogged) {
  //   try {
  //     const docRef = await addDoc(this.CRMcollection, user.toJSON());
    
  //     user.uid = docRef.id;
  //     await updateDoc(docRef, user.toJSON());
  //   } catch (err) {
  //     console.error('Error adding document: ', err);
  //   }
  // }

  async addUser(user: UserLogged) {
    try {
      const userDocRef = doc(this.CRMcollection, user.uid); 
      await setDoc(userDocRef, user.toJSON()); 
      console.log("User document successfully created with UID:", user.uid);
    } catch (err) {
      console.error('Error adding document: ', err);
    }
  }
}
