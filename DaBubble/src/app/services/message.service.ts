import { Injectable } from '@angular/core'
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
} from '@angular/fire/firestore'
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
    const messagesRef = collection(this.firestore, 'channels', channelId, 'messages');
    const currentUser = this.authService.currentUserSig()

    await addDoc(messagesRef, {
      ...message,
      created_at: Date.now(),
      updated_at: Date.now(),
      senderId: currentUser?.userId || 'Unknown User',
    })
  }

  async updateMessage(
    channelId: string,
    messageId: string,
    newMessageText: string
  ) {
    try {
      const messageDocRef = this.getSingleMessage(channelId, messageId)
      await updateDoc(messageDocRef, {
        message: newMessageText,
        updated_at: Date.now(),
      })
    } catch (e) {
      console.error('Error updating document:', e)
    }
  }

  async addMessageThread(
    channelId: string,
    message: Message,
    messageId: string
  ) {
    const messagesRef = collection(this.firestore, 'channels', channelId, 'messages', messageId, 'thread')
    const currentUser = this.authService.currentUserSig()

    await addDoc(messagesRef, {
      ...message,
      created_at: Date.now(),
      updated_at: Date.now(),
      senderId: currentUser?.userId || 'Unknown User',
    })
  }

  async updateThreadMessage(
    channelId: string,
    messageId: string,
    threadId: string,
    newMessageText: string
  ) {
    try {
      const messageDocRef = this.getSingleThreadMessage(
        channelId,
        messageId,
        threadId
      )
      await updateDoc(messageDocRef, {
        message: newMessageText,
        updated_at: Date.now(),
      })
      console.log('Thread Message updated with ID:', threadId)
    } catch (e) {
      console.error('Error updating document:', e)
    }
  }

  searchUsers(searchText: string): Observable<UserLogged[]> {
    return new Observable(observer => {
      const userCollection = collection(this.firestore, 'Users');
      const q = query(userCollection, orderBy('username'));

      const unsubscribe = onSnapshot(q, snapshot => {
        const users = snapshot.docs
          .map(doc => {
            const data = doc.data() as UserLogged;
            return data;
          })
          .filter(user => user.username.toLowerCase().includes(searchText.toLowerCase()));

        observer.next(users);
      }, error => observer.error(error));

      return () => unsubscribe();
    });
  }

  searchUserChannels(userId: string, searchText: string): Observable<Channel[]> {
    return new Observable(observer => {
      const channelCollection = collection(this.firestore, 'channels');
      const q = query(channelCollection, orderBy('name'));

      const unsubscribe = onSnapshot(q, snapshot => {
        const channels = snapshot.docs
          .map(doc => {
            const data = doc.data() as Channel;
            return data;
          })
          .filter(channel =>
            channel.name.toLowerCase().includes(searchText.toLowerCase()) &&
            channel.members?.includes(userId)
          );

        observer.next(channels);
      }, error => observer.error(error));

      return () => unsubscribe();
    });
  }



  getMessagesWithUsers(channelId: string): Observable<Message[]> {
    return new Observable((observer) => {
      let messagesRef = collection(
        this.firestore,
        `channels/${channelId}/messages`
      )
      let messagesQuery = query(messagesRef, orderBy('created_at', 'asc'))

      onSnapshot(messagesQuery, async (message) => {
        let messages = message.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[]

        let addUser = messages.map(async (message) => {
          let userDocRef = doc(this.firestore, `Users/${message.senderId}`)
          let userDoc = await getDoc(userDocRef)

          let userData: UserLogged | null = null
          if (userDoc.exists()) {
            let userObj = userDoc.data()
            userData = new UserLogged(userObj as UserLogged)
          }

          return {
            ...message,
            senderName: userData!.username,
            photoURL: userData!.photoURL,
          }
        })

        let messagesWithUserData = await Promise.all(addUser)

        observer.next(messagesWithUserData)
      })
    })
  }

  getThreadMessagesWithUsers(
    channelId: string,
    messageId: string
  ): Observable<Message[]> {
    return new Observable((observer) => {
      let threadRef = collection(
        this.firestore,
        `channels/${channelId}/messages/${messageId}/thread`
      )
      let threadQuery = query(threadRef, orderBy('created_at', 'asc'))

      onSnapshot(threadQuery, async (snapshot) => {
        let messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[]
        let addUser = messages.map(async (message) => {
          let userDocRef = doc(this.firestore, `Users/${message.senderId}`)
          let userDoc = await getDoc(userDocRef)
          let userData: UserLogged | null = null
          if (userDoc.exists()) {
            let userObj = userDoc.data()
            userData = new UserLogged(userObj as UserLogged)
          }
          return {
            ...message,
            senderName: userData!.username,
            photoURL: userData!.photoURL,
          }
        })

        let messagesWithUserData = await Promise.all(addUser)

        observer.next(messagesWithUserData)
      })
    })
  }

  async addReaction(channelId: string, messageId: string, reaction: Reaction) {
    const messageDocRef = doc(
      this.firestore,
      `channels/${channelId}/messages/${messageId}`
    )
    await updateDoc(messageDocRef, {
      reactions: arrayUnion(reaction),
    })
  }

  getSingleMessage(channelId: string, messageId: string) {
    return doc(this.firestore, `channels/${channelId}/messages/${messageId}`)
  }
  getSingleThreadMessage(
    channelId: string,
    messageId: string,
    threadId: string
  ) {
    return doc(
      this.firestore,
      `channels/${channelId}/messages/${messageId}/thread/${threadId}`
    )
  }
}
