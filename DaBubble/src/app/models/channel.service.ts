import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  Firestore,
  doc,
  addDoc,
} from '@angular/fire/firestore';
import { Channel } from './channel.class';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private firestore = inject(Firestore);
  channels$;

  constructor() {
    this.channels$ = collectionData(this.getChannelsRef());
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
}
