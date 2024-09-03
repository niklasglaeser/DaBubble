import { inject, Injectable } from '@angular/core';
import { collection, Firestore, doc, addDoc, updateDoc, onSnapshot, deleteDoc, where, getDocs, QuerySnapshot, query, setDoc, getDoc } from '@angular/fire/firestore';
import { Channel } from '../models/channel.class';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './lp-services/auth.service';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private firestore = inject(Firestore);
  channels: Channel[] = [];
  channels$ = new BehaviorSubject<Channel[]>([]);
  defaultChannelId: string = '2eELSnZJ5InLSZUJgmLC';
  currentUserId$ = new BehaviorSubject<string | null>(null);

  /*onSnapshot variablen*/
  unsubList: any;

  constructor(private auth: Auth = inject(Auth)) {
    this.initializeService();
  }

  initializeService() {
    this.getCurrentUserId();
    this.currentUserId$.subscribe((userId) => {
      if (userId) {
        this.loadChannelsForCurrentUser(userId);
      } else {
        this.channels$.next([]);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.unsubList) {
      this.unsubList();
    }
  }

  loadChannelsForCurrentUser(userId: string) {
    if (this.unsubList) {
      this.unsubList();
    }
    let filter = query(this.getChannelsRef(), where('members', 'array-contains', userId));
    this.unsubList = onSnapshot(
      filter,
      (snapshot) => {
        this.channels = [];
        snapshot.forEach((doc) => {
          this.channels.push(this.setChannelObject(doc.data(), doc.id));
        });
        this.channels$.next(this.channels);
      },
      (error) => {
        console.error('Fehler bei der Abfrage:', error);
      }
    );
  }

  /*TESTING*/
  loadChannelData(channelId: string, callback: (channel: Channel | null) => void): () => void {
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
  /*TESTING*/

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
      // Aktuelle Mitglieder des Channels abrufen
      const channelSnap = await getDoc(channelDocRef);
      if (channelSnap.exists()) {
        const currentMembers = channelSnap.data()['members'] || [];
        const updatedMembers = [...new Set([...currentMembers, ...userIds])];

        await updateDoc(channelDocRef, {
          members: updatedMembers
        });
      } else {
        console.error('Channel does not exist');
      }
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
        creator: channel.creator
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
      creator: obj.creator
    };
  }

  getSingleChannel(docId: string) {
    return doc(collection(this.firestore, 'channels'), docId);
  }

  getChannelsRef() {
    return collection(this.firestore, 'channels');
  }

  getCurrentUserId() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserId$.next(user ? user.uid : null);
    });
  }
}
