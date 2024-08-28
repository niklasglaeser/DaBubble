import { Injectable, OnDestroy } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  Firestore,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc
} from '@angular/fire/firestore';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { Message } from '../models/message.model';
import { AuthService } from './lp-services/auth.service';
import { UserLogged } from '../models/user-logged.model';

@Injectable({
  providedIn: 'root',
})
export class DirectMessagesService implements OnDestroy {

  currentUserId!: string;
  recipientId!: string;
  conversationId!: string;

  private recipientIdSource = new BehaviorSubject<string | null>(null);
  recipientId$ = this.recipientIdSource.asObservable();

  private recipientUserSource = new BehaviorSubject<UserLogged | null>(null);
  recipientUser$ = this.recipientUserSource.asObservable();

  private currentUserSource = new BehaviorSubject<UserLogged | null>(null);
  currentUser$ = this.currentUserSource.asObservable();

  private unsubscribeRecipientSnapshot: (() => void) | null = null;
  private unsubscribeCurrentUserSnapshot: (() => void) | null = null;

  constructor(private firestore: Firestore, private authService: AuthService) {}

  ngOnDestroy() {
    this.unsubscribeListener(this.unsubscribeRecipientSnapshot);
    this.unsubscribeListener(this.unsubscribeCurrentUserSnapshot);
  }

  async setConversationMembers(currentUserId: string, recipientId: string) {
    this.currentUserId = currentUserId;
    this.recipientId = recipientId;
    this.setRecipientId(recipientId);
    this.setCurrentUserId(currentUserId);
    await this.createConversation();
  }

  setRecipientId(id: string) {
    this.recipientIdSource.next(id);
    this.setupRecipientUserListener(id);
  }

  setCurrentUserId(id: string) {
    this.setupCurrentUserListener(id);
  }

  private setupRecipientUserListener(recipientId: string) {
    this.unsubscribeListener(this.unsubscribeRecipientSnapshot);

    const userDocRef = doc(this.firestore, `Users/${recipientId}`);
    this.unsubscribeRecipientSnapshot = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const user = { uid: docSnapshot.id, ...docSnapshot.data() } as UserLogged;
        this.recipientUserSource.next(user);
      } else {
        this.recipientUserSource.next(null);
      }
    });
  }

  private setupCurrentUserListener(currentUserId: string) {
    this.unsubscribeListener(this.unsubscribeCurrentUserSnapshot);

    const userDocRef = doc(this.firestore, `Users/${currentUserId}`);
    this.unsubscribeCurrentUserSnapshot = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const user = { uid: docSnapshot.id, ...docSnapshot.data() } as UserLogged;
        this.currentUserSource.next(user);
      } else {
        this.currentUserSource.next(null);
      }
    });
  }

  private unsubscribeListener(unsubscribe: (() => void) | null) {
    if (unsubscribe) {
      unsubscribe();
    }
  }

  async createConversation() {
    this.conversationId = this.currentUserId < this.recipientId ? `${this.currentUserId}_${this.recipientId}` : `${this.recipientId}_${this.currentUserId}`;
      
    const conversationRef = doc(this.firestore, 'directChats', this.conversationId);
    const conversationDoc = await getDoc(conversationRef);
  
    if (!conversationDoc.exists()) {
      await setDoc(conversationRef, {
        members: [this.currentUserId, this.recipientId],
        created_at: Date.now(),
      });
    }
  }

  loadConversation(): Observable<Message[]> {
    const messagesRef = collection(this.firestore, 'directChats', this.conversationId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('created_at', 'asc'));
  
    return combineLatest([ collectionData(messagesQuery, { idField: 'id' }) as Observable<Message[]>, this.currentUser$, this.recipientUser$])
    .pipe(map(([messages, currentUser, recipientUser]) => {
        return messages.map(message => {
          if (message.senderId === this.currentUserId) {
            message.senderName = currentUser?.username || message.senderName;
            message.photoURL = currentUser?.photoURL || message.photoURL;
          } else if (message.senderId === this.recipientId) {
            message.senderName = recipientUser?.username || message.senderName;
            message.photoURL = recipientUser?.photoURL || message.photoURL;
          }
          return message;
        });
      })
    );
  }
  
  async addMessage(message: Message) {
    const messagesRef = collection(this.firestore, 'directChats', this.conversationId, 'messages');
    
    await addDoc(messagesRef, {
      ...message,
      created_at: Date.now(),
      senderId: this.currentUserId,
      recipientId: this.recipientId
    });
  }
  
}
