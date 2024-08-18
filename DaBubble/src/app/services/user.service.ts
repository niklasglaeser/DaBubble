import { inject, Injectable } from '@angular/core';
import {
  collection,
  Firestore,
  query,
  where,
  collectionData,
  onSnapshot,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserLogged } from '../models/user-logged.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);
  private usersSubject = new BehaviorSubject<UserLogged[]>([]);

  users$ = this.usersSubject.asObservable();
  unsubList: () => void;

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

  getUsersRef() {
    return collection(this.firestore, 'Users');
  }

  searchUsers(queryText: string): Observable<UserLogged[]> {
    const usersCollection = this.getUsersRef();
    const endText = queryText + '\uf8ff';
    const usersQuery = query(
      usersCollection,
      where('username', '>=', queryText),
      where('username', '<=', endText)
    );

    return collectionData(usersQuery) as Observable<UserLogged[]>;
  }
}
