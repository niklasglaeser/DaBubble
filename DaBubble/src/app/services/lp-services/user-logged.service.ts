import { Injectable, inject } from '@angular/core';
import { addDoc, collection, Firestore, updateDoc, doc, DocumentReference, setDoc, query, where, getDocs, getDoc, onSnapshot, DocumentData, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UserLogged } from '../../models/user-logged.model';



@Injectable({
  providedIn: 'root',
})
export class UserLoggedService {
  firestore = inject(Firestore);
  userCollection = collection(this.firestore, 'Users');
  id = '';
  userData?: UserLogged

  constructor(){}

  subscribeUser(id: string): Observable<UserLogged | undefined> {
    return new Observable((observer) => {
      const docRef = doc(this.userCollection, id);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          observer.next(docSnap.data() as UserLogged);
        } else {
          console.log('No such document!');
          observer.next(undefined);
        }
      }, (error) => {
        console.error('Error getting document:', error);
        observer.error(error);
      });
      return () => unsubscribe();
    });
  }

  async isEmailTaken(email: string): Promise<boolean> {
    const q = query(this.userCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; 
  }

  async updateUserImg(id: string, photoURL: string) {
    const docRef: DocumentReference = doc(this.userCollection, id);
    try {
      await updateDoc(docRef,  { photoURL } ); 
      console.log("Document successfully updated.");
    } catch (error) {
      console.error("Error updating document:", error);
    }
  }

  async updateUserStatus(id: string, status: boolean) {
    if(id){
    const docRef: DocumentReference = doc(this.userCollection, id);
    
    try {
      const docSnapshot = await getDoc(docRef);
      if(docSnapshot.exists()){
        await updateDoc(docRef, { onlineStatus: status });
        console.log('Document successfully updated.');
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  
    }
  }

  async addUser(user: UserLogged) {
    try {
      const userDocRef = doc(this.userCollection, user.uid); 
      await setDoc(userDocRef, user.toJSON()); 
      console.log("User document successfully created with UID:", user.uid);
    } catch (err) {
      // console.error('Error adding document: ', err);
    }
  }
}
