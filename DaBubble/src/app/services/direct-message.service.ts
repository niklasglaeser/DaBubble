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
  setDoc
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

  currentUserId!: string;
  recipientId!: string;
  conversationId!: string;

  constructor(private firestore: Firestore, private authService: AuthService) {}

  async setConversationMembers(currentUserId: string, recipientId: string) {
    this.currentUserId = currentUserId;
    this.recipientId = recipientId;
    await this.createConversation();
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
      console.log('Neue Konversation erstellt:', this.conversationId);
    } else {
      console.log('Konversation existiert bereits:', this.conversationId);
    }
  }

  loadConversation(): Observable<Message[]> {
    const messagesRef = collection(this.firestore, 'directChats', this.conversationId, 'messages');
    
    const messagesQuery = query(messagesRef, orderBy('created_at', 'asc'));
    
    return collectionData(messagesQuery, { idField: 'id' }) as Observable<Message[]>;
  }
  

  async addMessage(message: Message) {
    const messagesRef = collection(this.firestore, 'directChats', this.conversationId, 'messages');

    await addDoc(messagesRef, {
      ...message,
      created_at: Date.now(),
      senderId: this.currentUserId,
      senderName: 'TEST',
      photoURL: '',
      recipientId: this.recipientId
    })
    console.log('Nachricht added');
  }
}
