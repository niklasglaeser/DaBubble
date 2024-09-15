import { Injectable, inject } from '@angular/core';
import { addDoc, collection, Firestore, updateDoc, doc, DocumentReference, setDoc, query, where, getDocs, getDoc, onSnapshot, DocumentData, DocumentSnapshot, QuerySnapshot } from '@angular/fire/firestore';
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

/**
 * Subscribes to real-time updates of a user's data in the Firestore database.
 * 
 * This method listens to changes in the user's document in Firestore by creating a subscription to the document snapshot.
 * When the document is updated, it emits the user's data as a `UserLogged` object. If the document does not exist, it emits `undefined`.
 * If an error occurs during the subscription, it propagates the error to the observer. The subscription can be unsubscribed by calling the returned function.
 * 
 * @param {string} id - The unique identifier of the user in Firestore.
 * @returns {Observable<UserLogged | undefined>} - An observable that emits the `UserLogged` data or `undefined` if the user does not exist.
 */
 subscribeUser(id: string): Observable<UserLogged | undefined> {
  return new Observable((observer) => {
    const docRef = doc(this.userCollection, id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        observer.next(docSnap.data() as UserLogged);
      } else {
        observer.next(undefined);
      }
    }, (error) => {
      observer.error(error);
    });
    return () => unsubscribe();
  });
}

/**
 * Checks if a user with the given UID exists in Firestore.
 * 
 * This asynchronous method retrieves a user's document from the Firestore collection based on their UID. 
 * It returns `true` if the document exists and the UID matches, otherwise it returns `false`.
 * 
 * @param {string} uid - The unique identifier of the user in Firestore.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the user exists in Firestore, otherwise `false`.
 */
 async isUserInFirestore(uid: string): Promise<boolean> {
  const docRef = doc(this.userCollection, uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists() && docSnap.id === uid) {
    return true;
  } else {
    return false;
  }
}

/**
 * Updates the user's profile image URL in Firestore.
 * 
 * This asynchronous method updates the `photoURL` field of the user's document in Firestore with the provided `photoURL`. 
 * If the update is successful, it logs a success message. In case of an error during the update, it logs the error message.
 * 
 * @param {string} id - The unique identifier of the user whose profile image is being updated.
 * @param {string} photoURL - The new profile image URL to update in Firestore.
 * @returns {Promise<void>} - A promise that resolves once the document is updated.
 */
 async updateUserImg(id: string, photoURL: string): Promise<void> {
  const docRef: DocumentReference = doc(this.userCollection, id);
  try {
    await updateDoc(docRef, { photoURL });
  } catch (error) {
    console.error("Error updating document:", error);
  }
}

/**
 * Updates the user's online status in Firestore.
 * 
 * This asynchronous method updates the `onlineStatus` field of the user's document in Firestore with the provided status. 
 * It first checks if the document exists before attempting to update it. If the update is successful, it logs a success message. 
 * In case of an error, it logs the error message.
 * 
 * @param {string} id - The unique identifier of the user whose online status is being updated.
 * @param {boolean} status - The new online status (`true` for online, `false` for offline).
 * @returns {Promise<void>} - A promise that resolves once the document is updated.
 */
 async updateUserStatus(id: string, status: boolean): Promise<void> {
  if (id) {
    const docRef: DocumentReference = doc(this.userCollection, id);

    try {
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        await updateDoc(docRef, { onlineStatus: status });
        console.log('Document successfully updated.');
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  }
}

/**
 * Adds a new user to Firestore by creating a user document with the provided user data.
 * 
 * This asynchronous method creates a new document in the Firestore user collection using the `uid` as the document ID. 
 * The user data is passed in the form of a `UserLogged` object and is stored in Firestore by converting the object to JSON. 
 * If the operation is successful, it logs a success message with the user's UID. If an error occurs, it silently handles it.
 * 
 * @param {UserLogged} user - The user object containing the data to be saved to Firestore.
 * @returns {Promise<void>} - A promise that resolves once the user document is successfully created.
 */
 async addUser(user: UserLogged): Promise<void> {
  try {
    const userDocRef = doc(this.userCollection, user.uid); 
    await setDoc(userDocRef, user.toJSON()); 
    console.log("User document successfully created with UID:", user.uid);
  } catch (err) {
    // Silently handle the error
  }
}

}
