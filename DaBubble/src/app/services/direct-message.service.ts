import { Injectable } from '@angular/core';
import {
  addDoc,
  arrayUnion,
  collection,
  collectionData,
  doc,
  Firestore,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from '../models/message.model';
import { Reaction } from '../models/reaction.model';
import { AuthService } from './lp-services/auth.service';
import { UserLogged } from '../models/user-logged.model';

@Injectable({
  providedIn: 'root',
})
export class DirectMessagesService {
  constructor(private firestore: Firestore, private authService: AuthService) {}


}
