import { Injectable } from '@angular/core';
import {
  addDoc,
  arrayUnion,
  collection,
  collectionData,
  doc,
  Firestore,
  Timestamp,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from '../models/message.model';
import { Reaction } from '../models/reaction.model';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private firestore: Firestore) {}

  async addMessage(channelId: string, message: Message) {
    const messagesRef = collection(
      this.firestore,
      `channels/${channelId}/messages`
    );
    await addDoc(messagesRef, {
      ...message,
      created_at: Timestamp.now(),
    });
  }

  getMessages(channelId: string) {
    const messagesRef = collection(
      this.firestore,
      `channels/${channelId}/messages`
    );
    return collectionData(messagesRef, { idField: 'id' }) as Observable<
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
