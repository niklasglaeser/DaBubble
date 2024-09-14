import { EventEmitter, inject, Injectable } from '@angular/core';
import { collection, Firestore, query, where, collectionData, onSnapshot, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserLogged } from '../models/user-logged.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public firestore = inject(Firestore);
  private usersSubject = new BehaviorSubject<UserLogged[]>([]);

  userSearchSelected: EventEmitter<string> = new EventEmitter<string>();
  channelSearchSelect: EventEmitter<string> = new EventEmitter<string>();

  users$ = this.usersSubject.asObservable();
  guestUser: string = 'ErI3ozOnpNOKM6dvrKqlXbORQm12'
  unsubList: () => void;;

  constructor() {
    this.unsubList = this.getUsersList();
  }

  ngOnDestroy(): void {
    if (this.unsubList) {
      this.unsubList();
    }
  }

  getUsersList() {
    return onSnapshot(this.getUsersRef(), (snapshot) => {
      const users: UserLogged[] = [];
      snapshot.forEach((doc) => {
        users.push(doc.data() as UserLogged);
      });
      this.usersSubject.next(users);
    });
  }

  async updateUser(userId: string, user: UserLogged) {
    try {
      const userDocRef = this.getSingleUser(userId);
      await updateDoc(userDocRef, {
        username: user.username,
        email: user.email
      });
    } catch (e) {
      console.error('Error updating user: ', e);
    }
  }

  async getSingleUserObj(docId: string): Promise<UserLogged | null> {
    if (!docId) {
      console.error('Invalid document ID!');
      return null;
    }

    try {
      const userDocRef = doc(this.firestore, `Users/${docId}`);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        return { uid: docSnap.id, ...docSnap.data() } as UserLogged;
      } else {
        console.error('No such user!');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user document:', error);
      return null;
    }
  }

  getSingleUser(docId: string) {
    return doc(collection(this.firestore, 'Users'), docId);
  }

  getUsersRef() {
    return collection(this.firestore, 'Users');
  }

  searchUsers(queryText: string): Observable<UserLogged[]> {
    const usersCollection = this.getUsersRef();
    const endText = queryText + '\uf8ff';
    const usersQuery = query(usersCollection, where('username', '>=', queryText), where('username', '<=', endText));

    return collectionData(usersQuery) as Observable<UserLogged[]>;
  }

  emitUserId(userId: string) {
    this.userSearchSelected.emit(userId);
  }

  emitChannelId(channelId: string) {
    this.channelSearchSelect.emit(channelId);
  }
}
