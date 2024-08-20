import { inject, Injectable } from '@angular/core';
import {
  collection,
  Firestore,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  where,
  getDocs,
  QuerySnapshot,
  query,
  setDoc,
  getDoc,
} from '@angular/fire/firestore';
import { Channel } from '../models/channel.class';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private firestore = inject(Firestore);
  channels: Channel[] = [];

  /*onSnapshot variablen*/
  unsubList;

  constructor() {
    this.unsubList = this.channelsList();
  }

  ngOnDestroy(): void {
    this.unsubList(); // snapshot unsubscribe
  }

  channelsList() {
    return onSnapshot(this.getChannelsRef(), (list) => {
      this.channels = [];
      list.forEach((element) => {
        this.channels.push(this.setChannelObject(element.data(), element.id));
      });
    });
  }

  /*Observable*/

  loadChannelData(channelId: string): Observable<Channel | null> {
    const channelDocRef = doc(this.firestore, 'channels', channelId);
    return new Observable<Channel | null>((observer) => {
      const unsubscribe = onSnapshot(channelDocRef, (doc) => {
        if (doc.exists()) {
          const channelData = doc.data() as Channel;
          channelData.id = doc.id;
          observer.next(channelData);
        } else {
          observer.next(null);
        }
      });
      return () => unsubscribe();
    });
  }

  /*Observable*/

  /*TESTING*/
  /*
  loadChannelData(
    channelId: string,
    callback: (channel: Channel | null) => void
  ): () => void {
    const channelDocRef = doc(this.firestore, 'channels', channelId);
    return onSnapshot(channelDocRef, (doc) => {
      if (doc.exists()) {
        const channelData = doc.data() as Channel;
        channelData.id = doc.id;
        callback(channelData);
      } else {
        callback(null);
      }
    });
  }
    */
  /*TESTING*/

  async createChannel(channel: Channel) {
    try {
      const channelDocRef = doc(this.getChannelsRef());
      channel.id = channelDocRef.id;
      await setDoc(channelDocRef, { ...channel });
      // await this.createMessageSubcollection(channel.id);
      return channel.id;
    } catch (error) {
      console.error('error adding channel' + error);
      return null;
    }
  }

  async createMessageSubcollection(channelId: string) {
    try {
      const messagesRef = collection(
        this.firestore,
        `channels/${channelId}/messages`
      );
      await addDoc(messagesRef, { initial: true });
    } catch (e) {
      console.error('Error: ', e);
    }
  }

  async addUsersToChannel(channelId: string, userIds: string[]): Promise<void> {
    try {
      const channelDocRef = this.getSingleChannel(channelId);
      await updateDoc(channelDocRef, {
        members: userIds,
      });
    } catch (e) {
      console.error('Error adding users to channel: ', e);
    }
  }

  async updateChannel(channelId: string, channel: Channel) {
    try {
      const channelDocRef = this.getSingleChannel(channelId);
      await updateDoc(channelDocRef, {
        name: channel.name,
        description: channel.description,
        creator: channel.creator,
      });
      console.log('Channel updated with ID: ', channelId);
    } catch (e) {
      console.error('Error updating document: ', e);
    }
  }

  async deleteChannel(channelId: string) {
    try {
      const channelDocRef = this.getSingleChannel(channelId);
      await deleteDoc(channelDocRef);
      console.log('Channel deleted with ID: ', channelId);
    } catch (e) {
      console.error('Error deleting document: ', e);
    }
  }

  async checkChannelExists(name: string): Promise<boolean> {
    const q = query(this.getChannelsRef(), where('name', '==', name));
    const querySnapshot: QuerySnapshot = await getDocs(q);

    return !querySnapshot.empty; // Gibt true zurück, wenn der Name bereits existiert
  }

  setChannelObject(obj: any, id: string): Channel {
    return {
      id: id,
      name: obj.name,
      description: obj.description || '',
      creator: obj.creator,
    };
  }

  getSingleChannel(docId: string) {
    return doc(collection(this.firestore, 'channels'), docId);
  }

  getChannelsRef() {
    return collection(this.firestore, 'channels');
  }
}
