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
  async loadChannelData(channelId: string): Promise<Channel> {
    const channelDocRef = this.getSingleChannel(channelId);
    const docSnap = await getDoc(channelDocRef);

    if (docSnap.exists()) {
      return new Channel({ ...docSnap.data(), id: docSnap.id });
    } else {
      console.error('No such document!');
      return new Channel({});
    }
  }

  async createChannel(channel: Channel) {
    try {
      const channelDocRef = doc(this.getChannelsRef());
      channel.id = channelDocRef.id;
      await setDoc(channelDocRef, { ...channel });
      return channel.id;
    } catch (error) {
      console.error('error adding channel' + error);
      return null;
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
