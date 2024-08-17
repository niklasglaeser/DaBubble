import { inject, Injectable } from '@angular/core';
import {
  collection,
  Firestore,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
} from '@angular/fire/firestore';
import { Channel } from './channel.class';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private firestore = inject(Firestore);
  channels: Channel[] = [];

  /*onSnapshot variablen*/
  unsubList;
  unsubSingle;

  constructor() {
    this.unsubList = this.channelsList();

    this.unsubSingle = onSnapshot(
      this.getSingleChannel('channels', 'dfsdf'),
      (element) => {}
    );
  }

  ngOnDestroy(): void {
    this.unsubList(); // snapshot unsubscribe
    this.unsubSingle(); // snapshot unsubscribe
  }

  channelsList() {
    return onSnapshot(this.getChannelsRef(), (list) => {
      this.channels = [];
      list.forEach((element) => {
        this.channels.push(this.setChannelObject(element.data(), element.id));
      });
    });
  }

  setChannelObject(obj: any, id: string): Channel {
    return {
      id: id,
      name: obj.name,
      description: obj.description || '',
      creator: obj.creator,
    };
  }

  getSingleChannel(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }

  getChannelsRef() {
    return collection(this.firestore, 'channels');
  }

  async createChannel(channel: Channel) {
    try {
      const docRef = await addDoc(this.getChannelsRef(), {
        name: channel.name,
        description: channel.description,
        creator: channel.creator,
      });
      console.log('Channel created with ID:' + docRef.id);
    } catch (error) {
      console.error('error adding channel' + error);
    }
  }

  async updateChannel(channelId: string, channel: Channel) {
    try {
      const channelDocRef = this.getSingleChannel('channels', channelId);
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
      const channelDocRef = this.getSingleChannel('channels', channelId);
      await deleteDoc(channelDocRef);
      console.log('Channel deleted with ID: ', channelId);
    } catch (e) {
      console.error('Error deleting document: ', e);
    }
  }
}
