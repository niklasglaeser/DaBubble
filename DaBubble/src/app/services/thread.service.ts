import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  Firestore,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root',
})
export class ThreadService {
  selectedMessage: Message | null = null;

  constructor(private firestore: Firestore) {}

  async addThreadMessage(
    channelId: string,
    messageId: string,
    threadMessage: Message
  ) {
    const threadRef = collection(
      this.firestore,
      `channels/${channelId}/messages/${messageId}/thread`
    );
    await addDoc(threadRef, {
      ...threadMessage,
      created_at: Timestamp.now(),
    });
  }

  getThreadMessages(
    channelId: string,
    messageId: string
  ): Observable<Message[]> {
    const threadRef = collection(
      this.firestore,
      `channels/${channelId}/messages/${messageId}/thread`
    );
    return collectionData(threadRef, { idField: 'id' }) as Observable<
      Message[]
    >;
  }

  checkAndCreateThread(
    channelId: string,
    messageId: string,
    originMessage: Message
  ) {
    console.log('channelId: ' + channelId);
    console.log('message ID: ' + messageId);
    console.log('originMessage ID: ' + originMessage);
  }
}
