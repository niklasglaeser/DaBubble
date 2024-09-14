import { inject, Injectable } from '@angular/core';
import { collection, Firestore, doc, addDoc, updateDoc, onSnapshot, deleteDoc, where, getDocs, QuerySnapshot, query, setDoc, getDoc } from '@angular/fire/firestore';
import { Channel } from '../models/channel.class';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './lp-services/auth.service';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { UserLogged } from '../models/user-logged.model';
import { arrayRemove } from '@angular/fire/firestore';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private firestore = inject(Firestore);
  channels: Channel[] = [];
  channels$ = new BehaviorSubject<Channel[]>([]);
  defaultChannelId: string = 'IiKdwSHaVmXdf2JiliaU';
  currentUserId$ = new BehaviorSubject<string | null>(null);
  currentUserId: string = '';
  unsubList: any;

  constructor(private auth: Auth = inject(Auth), private globalService: GlobalService) {
    this.initializeService();
  }

  initializeService() {
    this.getCurrentUserId();
    this.currentUserId$.subscribe((userId) => {
      if (userId) {this.loadChannelsForCurrentUser(userId); this.currentUserId = userId;}
      else {this.channels$.next([]);}
    });
  }

  ngOnDestroy(): void {
    if (this.unsubList) {this.unsubList();}
  }

  loadChannelsForCurrentUser(userId: string) {
    if (this.unsubList) {this.unsubList();}
    let filter = query(this.getChannelsRef(), where('members', 'array-contains', userId));
    this.unsubList = onSnapshot(
      filter,
      (snapshot) => {
        this.channels = [];
        snapshot.forEach((doc) => {this.channels.push(this.setChannelObject(doc.data(), doc.id));});
        this.channels$.next(this.channels);
      },
      (error) => {console.error('Fehler bei der Abfrage:', error);}
    );
  }


  loadChannelData(channelId: string, callback: (channel: Channel | null) => void): () => void {
    let channelDocRef = doc(this.firestore, 'channels', channelId);
    return onSnapshot(channelDocRef, (doc) => {
      if (doc.exists()) {
        let channelData = doc.data() as Channel;
        channelData.id = doc.id;
        callback(channelData);
      } else {callback(null);}
    });
  }

  async createChannel(channel: Channel) {
    try {
      let channelDocRef = doc(this.getChannelsRef());
      channel.id = channelDocRef.id;
      await setDoc(channelDocRef, { ...channel });
      return channel.id;
    } catch (error) {console.error('error adding channel' + error); return null;}
  }

  async editUserlistInChannel(channelId: string, userIds: string[]): Promise<void> {
    try {
      let channelDocRef = this.getSingleChannel(channelId);
      let channelSnap = await getDoc(channelDocRef);
      if (channelSnap.exists()) {
        let currentMembers = channelSnap.data()['members'] || [];
        let updatedMembers = [...new Set([...currentMembers.filter((member: string) => userIds.includes(member)), ...userIds])];
        await updateDoc(channelDocRef, {members: updatedMembers});
      } else {console.error('Channel does not exist');}
    } catch (e) {console.error('Error adding users to channel: ', e);}
  }

  async addUsersToWelcomeChannel(channelId: string, userIds: string[]): Promise<void> {
    try {
      let channelDocRef = this.getSingleChannel(channelId);
      let channelSnap = await getDoc(channelDocRef);

      if (channelSnap.exists()) {
        let currentMembers = channelSnap.data()['members'] || [];
        let updatedMembers = [...new Set([...currentMembers, ...userIds])];
        await updateDoc(channelDocRef, {members: updatedMembers});
      } else {console.error('Channel does not exist');}
    } catch (e) {console.error('Error adding users to channel: ', e);}
  }

  async updateChannel(channelId: string, channel: Channel) {
    try {
      let channelDocRef = this.getSingleChannel(channelId);
      await updateDoc(channelDocRef, {name: channel.name, description: channel.description, creator: channel.creator});
    } catch (e) {console.error('Error updating document: ', e);}
  }

  async deleteChannel(channelId: string) {
    try {
      let channelDocRef = this.getSingleChannel(channelId);
      await deleteDoc(channelDocRef);
      console.log('Channel deleted with ID: ', channelId);
    } catch (e) {console.error('Error deleting document: ', e);}
  }

  async removeUserFromChannel(channelId: string) {
    try {
      let userId = this.currentUserId;
      if (!userId) {console.error('Kein Benutzer angemeldet'); return;}
      let usersRef = collection(this.firestore, 'Users');
      let userDoc = doc(usersRef, userId);
      await updateDoc(userDoc, {joinedChannels: arrayRemove(channelId)});

      let channelsRef = collection(this.firestore, 'channels');
      let channelDoc = doc(channelsRef, channelId);
      await updateDoc(channelDoc, {members: arrayRemove(userId)});
      this.globalService.switchChannel(this.defaultChannelId);
    } catch (e) {console.error('Fehler beim Entfernen des Benutzers aus dem Channel', e);}
  }

  async checkChannelExists(name: string): Promise<boolean> {
    const q = query(this.getChannelsRef(), where('name', '==', name));
    const querySnapshot: QuerySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  }

  setChannelObject(obj: any, id: string): Channel {
    return {id: id, name: obj.name, description: obj.description || '', creator: obj.creator};
  }

  getSingleChannel(docId: string) {
    return doc(collection(this.firestore, 'channels'), docId);
  }

  getChannelsRef() {
    return collection(this.firestore, 'channels');
  }

  getCurrentUserId() {
    onAuthStateChanged(this.auth, (user) => {this.currentUserId$.next(user ? user.uid : null);});
  }
}
