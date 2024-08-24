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
      // senderName: currentUser?.username || 'Unknown User',
      senderId: currentUser?.userId || 'Unknown User',
    });
  }

  getMessagesWithUsers(channelId: string): Observable<Message[]> {
    return new Observable((observer) => {
      let messagesRef = collection(
        this.firestore,
        `channels/${channelId}/messages`
      );
      let messagesQuery = query(messagesRef, orderBy('created_at', 'asc'));

      onSnapshot(messagesQuery, async (message) => {
        let messages = message.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];

        let addUser = messages.map(async (message) => {
          let userDocRef = doc(this.firestore, `Users/${message.senderId}`);
          let userDoc = await getDoc(userDocRef);

          let userData: UserLogged | null = null;
          if (userDoc.exists()) {
            let userObj = userDoc.data();
            userData = new UserLogged(userObj as UserLogged);
          }

          return {
            ...message,
            senderName: userData!.username,
            photoURL: userData!.photoURL,
          };
        });

        let messagesWithUserData = await Promise.all(addUser);

        observer.next(messagesWithUserData);
      });
    });
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
