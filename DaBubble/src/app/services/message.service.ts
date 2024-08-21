import { Injectable } from '@angular/core';
import {
  addDoc,
  arrayUnion,
  collection,
  collectionData,
  doc,
  Firestore,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from '../models/message.model';
import { Reaction } from '../models/reaction.model';
import { AuthService } from './lp-services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private firestore: Firestore, private authService: AuthService) {}

  async addMessage(channelId: string, message: Message) {
    const messagesRef = collection(
      this.firestore,
      'channels',
      channelId,
      'messages'
    );

    const currentUser = this.authService.currentUserSig();

    await addDoc(messagesRef, {
      ...message,
      created_at: Date.now(),
      updated_at: Date.now(),
      senderName: currentUser?.username || 'Unknown User',
    });
  }

  getMessages(channelId: string): Observable<Message[]> {
    const messagesRef = collection(
      this.firestore,
      `channels/${channelId}/messages`
    );
    const messagesQuery = query(messagesRef, orderBy('created_at', 'asc'));
    return collectionData(messagesQuery, { idField: 'id' }) as Observable<
      Message[]
    >;
  }

  async addReaction(channelId: string, messageId: string, reaction: Reaction) {
    const messageDocRef = doc(
      this.firestore,
      `channels/${channelId}/messages/${messageId}`
    );
    await updateDoc(messageDocRef, {
      reactions: arrayUnion(reaction),
    });
  }
}
