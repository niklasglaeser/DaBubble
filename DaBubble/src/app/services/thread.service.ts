import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, doc, Firestore, getDoc, limit, onSnapshot, orderBy, query, Timestamp } from '@angular/fire/firestore';
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

  constructor(private firestore: Firestore, private messageService: MessageService) {}

  getThreadMessages(channelId: string, messageId: string): Observable<Message[]> {
    return new Observable<Message[]>((observer) => {
      const threadRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/thread`);
      const threadQuery = query(threadRef);

      // Hole die ursprüngliche Nachricht aus der Haupt-Collection
      const originMessageRef = doc(this.firestore, `channels/${channelId}/messages/${messageId}`);

      // Verwende onSnapshot, um Echtzeit-Updates zu erhalten
      onSnapshot(threadQuery, async (snapshot) => {
        const threadMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];

        try {
          // Hole die Originalnachricht
          const originMessageSnapshot = await getDoc(originMessageRef);
          if (originMessageSnapshot.exists()) {
            const originMessage = originMessageSnapshot.data() as Message;
            // Setze die Originalnachricht an die erste Stelle
            observer.next([originMessage, ...threadMessages]);
          } else {
            observer.next(threadMessages);
          }
        } catch (error) {
          console.error('Fehler beim Abrufen der Originalnachricht:', error);
          observer.next(threadMessages);
        }
      });
    });
  }

  async checkAndCreateThread(channelId: string, messageId: string, originMessage: Message) {
    try {
      // Überprüfe, ob bereits Thread-Nachrichten existieren
      const threadMessages$ = this.getThreadMessages(channelId, messageId);
      const threadMessages = await firstValueFrom(threadMessages$);

      if (threadMessages.length === 0) {
        console.log('Kein Thread vorhanden. Bereit für neue Antworten.');
        // Keine Aktion erforderlich, da die ursprüngliche Nachricht nicht in den Thread kopiert wird
      }

      // Setze die ausgewählte Nachricht als aktuell ausgewählte Nachricht
      this.setSelectedMessage(channelId, messageId, originMessage);
    } catch (error) {
      console.error('Fehler beim Überprüfen oder Erstellen des Threads:', error);
    }
  }

  setSelectedMessage(channelId: string, messageId: string, originMessage: Message) {
    this.selectedMessageSource.next({ channelId, messageId, originMessage });
  }

  getThreadMessageCount(channelId: string, messageId: string): Observable<number> {
    return new Observable<number>((observer) => {
      const threadRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/thread`);
      const threadQuery = query(threadRef);

      onSnapshot(threadQuery, (snapshot) => {
        const countWithoutOrigin = Math.max(snapshot.size, 0);
        observer.next(countWithoutOrigin);
      });
    });
  }
  getLastThreadMessageTime(channelId: string, messageId: string): Observable<Date | null> {
    return new Observable<Date | null>((observer) => {
      const threadRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/thread`);
      const lastMessageQuery = query(threadRef, orderBy('created_at', 'desc'), limit(1));

      onSnapshot(lastMessageQuery, (snapshot) => {
        if (snapshot.empty) {
          observer.next(null);
        } else {
          const lastMessage = snapshot.docs[0].data();
          let lastMessageTime: Date | null = null;

          if (lastMessage['created_at']) {
            const timestamp = lastMessage['created_at'];

            if (typeof timestamp === 'number') {
              lastMessageTime = new Date(timestamp);
            } else {
              console.error('Unexpected type for created_at:', typeof timestamp);
            }
          }

          observer.next(lastMessageTime);
        }
      });
    });
  }
}
