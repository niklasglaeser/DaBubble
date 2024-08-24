import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  Firestore,
  onSnapshot,
  query,
  Timestamp,
} from '@angular/fire/firestore';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root',
})
export class ThreadService {
  public selectedMessageSource = new BehaviorSubject<{
    channelId: string;
    messageId: string;
    originMessage: Message;
  } | null>(null);
  selectedMessage$ = this.selectedMessageSource.asObservable();
  selectedMessage: Message | null = null;

  constructor(private firestore: Firestore) {}

  async addThreadMessage(
    channelId: string,
    messageId: string,
    threadMessage: Message
  ): Promise<void> {
    try {
      const threadRef = collection(
        this.firestore,
        `channels/${channelId}/messages/${messageId}/thread`
      );
      await addDoc(threadRef, {
        ...threadMessage,
        created_at: Timestamp.now(),
      });
      console.log('Thread-Nachricht erfolgreich hinzugefügt.');
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Nachricht zum Thread:', error);
    }
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

  async checkAndCreateThread(
    channelId: string,
    messageId: string,
    originMessage: Message
  ) {
    // Überprüfe, ob bereits Thread-Nachrichten existieren
    const threadMessages$ = this.getThreadMessages(channelId, messageId);
    const threadMessages = await firstValueFrom(threadMessages$);

    if (!threadMessages || threadMessages.length === 0) {
      console.log(
        'Kein Thread vorhanden. Erstelle neuen Thread mit originMessage.'
      );

      // Die ursprüngliche Nachricht als erste Nachricht im neuen Thread hinzufügen
      await this.addThreadMessage(channelId, messageId, originMessage);
    } else {
      console.log(
        'Thread existiert bereits oder es wurden Nachrichten gefunden:',
        threadMessages
      );
    }

    // Setze die ausgewählte Nachricht als aktuell ausgewählte Nachricht
    this.setSelectedMessage(channelId, messageId, originMessage);
  }

  setSelectedMessage(
    channelId: string,
    messageId: string,
    originMessage: Message
  ) {
    this.selectedMessageSource.next({ channelId, messageId, originMessage });
  }

  getThreadMessageCount(
    channelId: string,
    messageId: string
  ): Observable<number> {
    return new Observable<number>((observer) => {
      const threadRef = collection(
        this.firestore,
        `channels/${channelId}/messages/${messageId}/thread`
      );
      const threadQuery = query(threadRef);

      // Verwende onSnapshot, um die Anzahl der Dokumente in der Subcollection zu überwachen
      onSnapshot(threadQuery, (snapshot) => {
        const countWithoutOrigin = Math.max(snapshot.size - 1, 0);
        observer.next(countWithoutOrigin);
      });
    });
  }
}
