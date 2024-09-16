import { Injectable } from '@angular/core'
import { addDoc, arrayUnion, collection, collectionData, deleteDoc, doc, Firestore, getDoc, onSnapshot, orderBy, query, Timestamp, updateDoc, } from '@angular/fire/firestore'
import { Observable } from 'rxjs'
import { Message } from '../models/message.model'
import { Reaction } from '../models/reaction.model'
import { AuthService } from './lp-services/auth.service'
import { UserLogged } from '../models/user-logged.model'
import { Channel } from '../models/channel.class'

@Injectable({
  providedIn: 'root',
})

export class MessageService {
  constructor(private firestore: Firestore, private authService: AuthService) { }

  async addMessage(channelId: string, message: Message) {
    let messagesRef = collection(this.firestore, 'channels', channelId, 'messages');
    let currentUser = this.authService.currentUserSig()
    await addDoc(messagesRef, { ...message, created_at: Date.now(), updated_at: Date.now(), senderId: currentUser?.userId || 'Unknown User', })
  }

  async updateMessage(channelId: string, messageId: string, newMessageText: string) {
    try {
      let messageDocRef = this.getSingleMessage(channelId, messageId)
      await updateDoc(messageDocRef, { message: newMessageText, updated_at: Date.now(), })
    } catch (e) { console.error('Error updating document:', e) }
  }

  async deleteMessage(channelId: string, messageId: string): Promise<void> {
    try {
      let messageDocRef = this.getSingleMessage(channelId, messageId);
      await deleteDoc(messageDocRef);
    } catch (e) { console.error('Error deleting message:', e); }
  }

  async addMessageThread(channelId: string, message: Message, messageId: string) {
    let messagesRef = collection(this.firestore, 'channels', channelId, 'messages', messageId, 'thread')
    let currentUser = this.authService.currentUserSig()

    await addDoc(messagesRef, { ...message, created_at: Date.now(), updated_at: Date.now(), senderId: currentUser?.userId || 'Unknown User', })
  }

  async updateThreadMessage(channelId: string, messageId: string, threadId: string, newMessageText: string) {
    try {
      let messageDocRef = this.getSingleThreadMessage(channelId, messageId, threadId)
      await updateDoc(messageDocRef, { message: newMessageText, updated_at: Date.now(), })
    } catch (e) { console.error('Error updating document:', e) }
  }

  async deleteMessageThread(channelId: string, messageId: string, threadId: string): Promise<void> {
    try {
      let messageDocRef = this.getSingleThreadMessage(channelId, messageId, threadId);
      await deleteDoc(messageDocRef);
    } catch (e) { console.error('Error deleting message:', e); }
  }

  /**
   * Searches for users whose usernames match the search text.
   * @param searchText The text to search for in usernames.
   * @returns An Observable emitting an array of UserLogged objects.
   */
  searchUsers(searchText: string): Observable<UserLogged[]> {
    return new Observable(observer => {
      let userCollection = collection(this.firestore, 'Users');
      let q = query(userCollection, orderBy('username'));

      let unsubscribe = onSnapshot(q, snapshot => {
        let users = snapshot.docs.map(doc => { let data = doc.data() as UserLogged; return data; }).filter(user => user.username.toLowerCase().includes(searchText.toLowerCase()));
        observer.next(users);
      }, error => observer.error(error));
      return () => unsubscribe();
    });
  }

  /**
   * Searches for channels that a user is a member of and whose names match the search text.
   * @param userId The ID of the user.
   * @param searchText The text to search for in channel names.
   * @returns An Observable emitting an array of Channel objects.
   */
  searchUserChannels(userId: string, searchText: string): Observable<Channel[]> {
    return new Observable(observer => {
      let channelCollection = collection(this.firestore, 'channels');
      let q = query(channelCollection, orderBy('name'));
      const unsubscribe = onSnapshot(q, snapshot => {
        const channels = snapshot.docs
          .map(doc => { let data = doc.data() as Channel; return data; })
          .filter(channel => channel.name.toLowerCase().includes(searchText.toLowerCase()) && channel.members?.includes(userId));
        observer.next(channels);
      }, error => observer.error(error));
      return () => unsubscribe();
    });
  }


  /**
   * get messages from a channel along with user data for each message.
   * @param channelId The ID of the channel.
   * @returns An Observable emitting an array of Message objects with user data.
   */
  getMessagesWithUsers(channelId: string): Observable<Message[]> {
    return new Observable((observer) => {let messagesRef = collection(this.firestore, `channels/${channelId}/messages`); let messagesQuery = query(messagesRef, orderBy('created_at', 'asc'));
      onSnapshot(messagesQuery, async (message) => {let messages = message.docs.map((doc) => ({ id: doc.id, ...doc.data(), })) as Message[]
        let addUser = messages.map(async (message) => {
          let userDocRef = doc(this.firestore, `Users/${message.senderId}`);
          let userDoc = await getDoc(userDocRef);
          let userData: UserLogged | null = null;
          if (userDoc.exists()) { let userObj = userDoc.data(); userData = new UserLogged(userObj as UserLogged); }
          return { ...message, senderName: userData!.username, photoURL: userData!.photoURL, };
        })
        let messagesWithUserData = await Promise.all(addUser)
        observer.next(messagesWithUserData)
      })
    })
  }

  /**
   * get messages from a thread along with user data for each message.
   * @param channelId The ID of the channel.
   * @param messageId The ID of the parent message in the thread.
   * @returns An Observable emitting an array of Message objects with user data.
   */
  getThreadMessagesWithUsers(channelId: string, messageId: string): Observable<Message[]> {
    return new Observable((observer) => {let threadRef = collection(this.firestore, `channels/${channelId}/messages/${messageId}/thread`); let threadQuery = query(threadRef, orderBy('created_at', 'asc'))
      onSnapshot(threadQuery, async (snapshot) => {
        let messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), })) as Message[];
        let addUser = messages.map(async (message) => {
          let userDocRef = doc(this.firestore, `Users/${message.senderId}`)
          let userDoc = await getDoc(userDocRef)
          let userData: UserLogged | null = null
          if (userDoc.exists()) { let userObj = userDoc.data(); userData = new UserLogged(userObj as UserLogged) }
          return { ...message, senderName: userData!.username, photoURL: userData!.photoURL, }
        })
        let messagesWithUserData = await Promise.all(addUser)
        observer.next(messagesWithUserData)
      })
    })
  }

  getSingleMessage(channelId: string, messageId: string) {
    return doc(this.firestore, `channels/${channelId}/messages/${messageId}`)
  }
  getSingleThreadMessage(channelId: string, messageId: string, threadId: string) {
    return doc(this.firestore, `channels/${channelId}/messages/${messageId}/thread/${threadId}`)
  }

   /**
   * get a single message with reactions and user data.
   * @param channelId The ID of the channel.
   * @param messageId The ID of the message.
   * @returns An Observable emitting the Message object with user data, or null if not found.
   */
  getSingleMessageWithReactions(channelId: string, messageId: string): Observable<Message | null> {
    return new Observable<Message | null>((observer) => { let messageDocRef = doc(this.firestore, `channels/${channelId}/messages/${messageId}`);
      onSnapshot(messageDocRef, async (docSnapshot) => {
        if (docSnapshot.exists()) {
          let data = docSnapshot.data() as Message;
          let userDocRef = doc(this.firestore, `Users/${data.senderId}`);
          let userDoc = await getDoc(userDocRef);
          let userData: UserLogged | null = null;
          if (userDoc.exists()) { let userObj = userDoc.data(); userData = new UserLogged(userObj as UserLogged); }
          let messageWithUserData = { id: docSnapshot.id, ...data, senderName: userData?.username || 'Unknown User', photoURL: userData?.photoURL || '', };
          observer.next(messageWithUserData);
        } else {observer.next(null);}
      }, (error) => { observer.error(error); });
    });
  }

}
