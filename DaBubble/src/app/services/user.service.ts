import { inject, Injectable } from '@angular/core';
import { User } from '../models/user.model';
import {
  collection,
  Firestore,
  query,
  where,
  collectionData,
  onSnapshot,
} from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);

  users: User[] = [];
  unsubList;
  constructor() {
    this.unsubList = this.getUsersList();
  }

  getUsersList(): Observable<User[]> {
    const usersCollection = collection(this.firestore, 'usersMarco');

    return collectionData(usersCollection, { idField: 'id' }) as Observable<
      User[]
    >;
  }

  setUsersObject(obj: any, id: string): User {
    return {
      id: id,
      name: obj.name,
    };
  }

  getUsersRef() {
    return collection(this.firestore, 'usersMarco');
  }

  ngOnDestroy(): void {}

  searchUsers(queryText: string): Observable<User[]> {
    const usersCollection = collection(this.firestore, 'usersMarco');
    const endText = queryText + '\uf8ff';
    const usersQuery = query(
      usersCollection,
      where('name', '>=', queryText),
      where('name', '<=', endText)
    );

    return collectionData(usersQuery, { idField: 'id' }) as Observable<User[]>;
  }

  // searchUsers(queryText: string): Observable<User[]> {
  //   const usersCollection = collection(this.firestore, 'usersMarco');
  //   const usersQuery = query(
  //     usersCollection,
  //     where('name', '>=', queryText),
  //     where('name', '<=', queryText + '\uf8ff')
  //   );

  //   return collectionData(usersQuery, { idField: 'id' }) as Observable<User[]>;
  // }
}
