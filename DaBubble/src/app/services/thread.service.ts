import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, doc, Firestore, getDoc, limit, onSnapshot, orderBy, query, setDoc, Timestamp } from '@angular/fire/firestore';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { Message } from '../models/message.model';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  public selectedMessageSource = new BehaviorSubject<{ channelId: string; messageId: string; originMessage: Message } | null>(null);
  selectedMessage$ = this.selectedMessageSource.asObservable();
  selectedMessage: Message | null = null;

  constructor(private firestore: Firestore, private messageService: MessageService) { }


  /**
   * get thread messages for a given channel and message ID.
   * Includes the origin message at the beginning of the messages array.
   * @param channelId The ID of the channel.
   * @param messageId The ID of the message.
   * @returns An Observable emitting an array of Messages, including the origin message.
   */
  getThreadMessages(channelId: string, messageId: string): Observable<Message[]> {
    return new Observable<Message[]>((observer) => {
      let threadRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/thread`);
      let threadQuery = query(threadRef);
      let originMessageRef = doc(this.firestore, `channels/${channelId}/messages/${messageId}`);
      onSnapshot(threadQuery, async (snapshot) => {let threadMessages = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})) as Message[];
        try {
          let originMessageSnapshot = await getDoc(originMessageRef);
          if (originMessageSnapshot.exists()) { let originMessage = originMessageSnapshot.data() as Message; observer.next([originMessage, ...threadMessages]);}
          else {observer.next(threadMessages);}
        } catch (error) {console.error('Fehler beim Abrufen der Originalnachricht:', error); observer.next(threadMessages);}
      });
    });
  }

  /**
   * Checks for existing thread messages and sets the selected message.
   * If no thread exists, logs that it's ready for new replies.
   * @param channelId The ID of the channel.
   * @param messageId The ID of the message.
   * @param originMessage The original message object.
   * @returns A Promise that resolves when the operation is complete.
   */
  async checkAndCreateThread(channelId: string, messageId: string, originMessage: Message) {
    try {
      let threadMessages$ = this.getThreadMessages(channelId, messageId);
      let threadMessages = await firstValueFrom(threadMessages$);
      if (threadMessages.length === 0) {console.log('Kein Thread vorhanden. Bereit für neue Antworten.');}
      this.setSelectedMessage(channelId, messageId, originMessage);
    } catch (error) {console.error('Fehler beim Überprüfen oder Erstellen des Threads:', error);}
  }


  setSelectedMessage(channelId: string, messageId: string, originMessage: Message) {
    this.selectedMessageSource.next({ channelId, messageId, originMessage });
  }


  getThreadMessageCount(channelId: string, messageId: string): Observable<number> {
    return new Observable<number>((observer) => {
      let threadRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/thread`);
      let threadQuery = query(threadRef);
      onSnapshot(threadQuery, (snapshot) => {
        let countWithoutOrigin = Math.max(snapshot.size, 0);
        observer.next(countWithoutOrigin);
      });
    });
  }

   /**
   * Retrieves the timestamp of the last message in a thread.
   * @param channelId The ID of the channel.
   * @param messageId The ID of the message.
   * @returns An Observable emitting the date of the last message, or null if no messages exist.
   */
  getLastThreadMessageTime(channelId: string, messageId: string): Observable<Date | null> {
    return new Observable<Date | null>((observer) => {let threadRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/thread`); let lastMessageQuery = query(threadRef, orderBy('created_at', 'desc'), limit(1));
      onSnapshot(lastMessageQuery, (snapshot) => {
        if (snapshot.empty) {observer.next(null);}
        else {
          let lastMessage = snapshot.docs[0].data();
          let lastMessageTime: Date | null = null;
          if (lastMessage['created_at']) {let timestamp = lastMessage['created_at'];
          if (typeof timestamp === 'number') {lastMessageTime = new Date(timestamp);} else {console.error('Unexpected type for created_at:', typeof timestamp);}}
          observer.next(lastMessageTime);
        }
      });
    });
  }
}
