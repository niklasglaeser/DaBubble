import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Reaction } from '../models/reaction.model';
import { UserLogged } from '../models/user-logged.model';

@Injectable({
  providedIn: 'root',
})
export class EmojiService {
  constructor(private firestore: Firestore) { }

  async toggleReaction(channelId: string, messageId: string, emoji: string, userId: string, username: string) {
    let messageDocRef = doc(this.firestore, `channels/${channelId}/messages/${messageId}`);

    let messageDoc = await getDoc(messageDocRef);
    if (messageDoc.exists()) {
      let currentReactions: Reaction[] = messageDoc.data()['reactions'] || [];
      let existingReaction = currentReactions.find(r => r.emoji === emoji);

      if (existingReaction) {
        if (existingReaction.userIds.includes(userId)) {
          let index = existingReaction.userIds.indexOf(userId);
          if (index > -1) {existingReaction.userIds.splice(index, 1); existingReaction.usernames.splice(index, 1); existingReaction.count -= 1;}
          if (existingReaction.count === 0) {currentReactions.splice(currentReactions.indexOf(existingReaction), 1);}
        } else {existingReaction.userIds.push(userId); existingReaction.usernames.push(username); existingReaction.count += 1;}
      } else {
        currentReactions.push({emoji, count: 1, userIds: [userId], usernames: [username],});
      }
      await updateDoc(messageDocRef, { reactions: currentReactions });
    }
  }

  async toggleReactionDM(conversationId: string, messageId: string, emoji: string, userId: string, username: string) {
    let messageDocRef = doc(this.firestore, `directChats/${conversationId}/messages/${messageId}`);

    let messageDoc = await getDoc(messageDocRef);
    if (messageDoc.exists()) {
      let currentReactions: Reaction[] = messageDoc.data()['reactions'] || [];
      let existingReaction = currentReactions.find(r => r.emoji === emoji);

      if (existingReaction) {
        if (existingReaction.userIds.includes(userId)) {
          let index = existingReaction.userIds.indexOf(userId);
          if (index > -1) { existingReaction.userIds.splice(index, 1); existingReaction.usernames.splice(index, 1); existingReaction.count -= 1;}
          if (existingReaction.count === 0) {currentReactions.splice(currentReactions.indexOf(existingReaction), 1);}
        } else { existingReaction.userIds.push(userId); existingReaction.usernames.push(username); existingReaction.count += 1;}
      } else {currentReactions.push({emoji, count: 1, userIds: [userId], usernames: [username],});}

      await updateDoc(messageDocRef, { reactions: currentReactions });
    }
  }

  async toggleReactionThread(channelId: string, messageId: string, emoji: string, userId: string, username: string, threadId: string) {
    let messageDocRef = doc(this.firestore, `channels/${channelId}/messages/${messageId}/thread/${threadId}`);
    let messageDoc = await getDoc(messageDocRef);
    if (messageDoc.exists()) {
      let currentReactions: Reaction[] = messageDoc.data()['reactions'] || [];
      let existingReaction = currentReactions.find(r => r.emoji === emoji);

      if (existingReaction) {
        if (existingReaction.userIds.includes(userId)) {
          let index = existingReaction.userIds.indexOf(userId);
          if (index > -1) { existingReaction.userIds.splice(index, 1); existingReaction.usernames.splice(index, 1); existingReaction.count -= 1;}
          if (existingReaction.count === 0) {currentReactions.splice(currentReactions.indexOf(existingReaction), 1);}
        } else {existingReaction.userIds.push(userId); existingReaction.usernames.push(username); existingReaction.count += 1;}
      } else {currentReactions.push({emoji, count: 1, userIds: [userId], usernames: [username],});}

      await updateDoc(messageDocRef, { reactions: currentReactions });
    } else {console.log('Document does not exist');}
  }

  getReactionText(reaction: Reaction, currentUser: UserLogged | null): string {
    if (reaction.count === 1) {return reaction.usernames.includes(currentUser?.username ?? '') ? 'hast reagiert' : 'hat reagiert';}
    else if (reaction.count > 1) {return 'haben reagiert';}
    return '';
  }

}
