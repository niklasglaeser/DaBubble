import { Injectable, OnDestroy } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, getDoc, onSnapshot, orderBy, query, setDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, combineLatest, map, Observable, Subject } from 'rxjs';
import { Message } from '../models/message.model';
import { AuthService } from './lp-services/auth.service';
import { UserLogged } from '../models/user-logged.model';

@Injectable({ providedIn: 'root', })
export class DirectMessagesService implements OnDestroy {

  currentUserId!: string;
  recipientId!: string;
  conversationId!: string;

  private recipientIdSource = new BehaviorSubject<string | null>(null);
  recipientId$ = this.recipientIdSource.asObservable();

  private recipientUserSource = new BehaviorSubject<UserLogged | null>(null);
  recipientUser$ = this.recipientUserSource.asObservable();

  private currentUserSource = new BehaviorSubject<UserLogged | null>(null);
  currentUser$ = this.currentUserSource.asObservable();

  private conversationsSource = new BehaviorSubject<UserLogged[]>([]);
  conversations$ = this.conversationsSource.asObservable();

  private hasMessagesSource = new BehaviorSubject<boolean>(false);
  hasMessages$ = this.hasMessagesSource.asObservable();

  private conversationIdSource = new BehaviorSubject<string | null>(null);
  conversationId$ = this.conversationIdSource.asObservable();

  private loadMessagesSource = new Subject<void>();
  loadMessages$ = this.loadMessagesSource.asObservable();

  private unsubscribeRecipientSnapshot: (() => void) | null = null;
  private unsubscribeCurrentUserSnapshot: (() => void) | null = null;
  private unsubscribeConversationsSnapshot: (() => void) | null = null;

  constructor(private firestore: Firestore, private authService: AuthService) {
  }

  ngOnDestroy() {
    this.unsubscribeListener(this.unsubscribeRecipientSnapshot);
    this.unsubscribeListener(this.unsubscribeCurrentUserSnapshot);
    this.unsubscribeListener(this.unsubscribeConversationsSnapshot);
  }

  async setConversationMembers(currentUserId: string, recipientId: string) {
    this.currentUserId = currentUserId;
    this.recipientId = recipientId;
    this.setRecipientId(recipientId);
    this.setCurrentUserId(currentUserId);
    await this.createConversation();
  }

  setRecipientId(id: string) {
    this.recipientIdSource.next(id);
    this.setupRecipientUserListener(id);
  }

  setCurrentUserId(id: string) {
    this.setupCurrentUserListener(id);
    this.setupConversationsListener(id);
  }

  /**
  * Listens to changes in the recipient's Firestore document and updates the recipient user observable.
  * Unsubscribes from previous listeners if needed.
  *
  * @private
  * @param {string} recipientId - ID of the recipient user.
  */
  private setupRecipientUserListener(recipientId: string) {
    this.unsubscribeListener(this.unsubscribeRecipientSnapshot);

    let userDocRef = doc(this.firestore, `Users/${recipientId}`);
    this.unsubscribeRecipientSnapshot = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const user = { uid: docSnapshot.id, ...docSnapshot.data() } as UserLogged;
        this.recipientUserSource.next(user);
      } else {this.recipientUserSource.next(null);}
    });
  }

  
  /**
  * Listens to changes in the current user's Firestore document and updates the current user observable.
  * Unsubscribes from previous listeners if needed.
  *
  * @private
  * @param {string} currentUserId - ID of the current user.
  */
  private setupCurrentUserListener(currentUserId: string) {
    this.unsubscribeListener(this.unsubscribeCurrentUserSnapshot);

    let userDocRef = doc(this.firestore, `Users/${currentUserId}`);
    this.unsubscribeCurrentUserSnapshot = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        let user = { uid: docSnapshot.id, ...docSnapshot.data() } as UserLogged;
        this.currentUserSource.next(user);
      } else {this.currentUserSource.next(null);}
    });
  }

  private unsubscribeListener(unsubscribe: (() => void) | null) {
    if (unsubscribe) {unsubscribe();}
  }

  /**
  * Creates a conversation if it doesn't exist, using user IDs to generate a unique ID.
  * Adds members and a timestamp, and updates the conversation ID observable.
  */
  async createConversation() {
    this.conversationId = this.currentUserId < this.recipientId ? `${this.currentUserId}_${this.recipientId}` : `${this.recipientId}_${this.currentUserId}`;
    let conversationRef = doc(this.firestore, 'directChats', this.conversationId);
    let conversationDoc = await getDoc(conversationRef);
    if (!conversationDoc.exists()) {await setDoc(conversationRef, {members: [this.currentUserId, this.recipientId], created_at: Date.now(),});}
    this.conversationIdSource.next(this.conversationId);
  }

  /**
  * Loads and returns the conversation messages between the current user and the recipient.
  * Messages are fetched from Firestore, sorted by creation time, and the latest user data (username, photoURL) of the sender gets added.
  * @returns {Observable<Message[]>} An Observable that emits an array of updated messages.
  */
  loadConversation(): Observable<Message[]> {
    let messagesRef = collection(this.firestore, 'directChats', this.conversationId, 'messages');
    let messagesQuery = query(messagesRef, orderBy('created_at', 'asc'));
    return combineLatest([ collectionData(messagesQuery, { idField: 'id' }) as Observable<Message[]>, this.currentUser$, this.recipientUser$])
    .pipe(map(([messages, currentUser, recipientUser]) => {
        let hasMessages = messages.length > 0;
        this.hasMessagesSource.next(hasMessages);

        return messages.map(message => {
          if (message.senderId === this.currentUserId) {message.senderName = currentUser?.username || message.senderName; message.photoURL = currentUser?.photoURL || message.photoURL;}
          else if (message.senderId === this.recipientId) { message.senderName = recipientUser?.username || message.senderName; message.photoURL = recipientUser?.photoURL || message.photoURL;} return message;
        });
      })
    );
  }

  async addMessage(message: Message) {
    let messagesRef = collection(this.firestore, 'directChats', this.conversationId, 'messages');
    await addDoc(messagesRef, {...message, created_at: Date.now(), senderId: this.currentUserId, recipientId: this.recipientId});
  }

  async updateMessage(conversationId: string, messageId: string, newMessageText: string) {
    try {
      let messageDocRef = this.getSingleMessage(conversationId, messageId)
      await updateDoc(messageDocRef, { message: newMessageText, updated_at: Date.now(), })
    } catch (e) {console.error('Error updating document:', e)}
  }

  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    try {
      const messageDocRef = this.getSingleMessage(conversationId, messageId);
      await deleteDoc(messageDocRef);
    } catch (e) {console.error('Error deleting message:', e);}
  }

  getSingleMessage(conversationId: string, messageId: string) {
    return doc(this.firestore, `directChats/${conversationId}/messages/${messageId}`)
  }

  /**
  * Listens to conversations involving the current user and gets the other user IDs.
  * Updates listeners for these users and unsubscribes from previous listeners if necessary.
  *
  * @private
  * @param {string} currentUserId - ID of the current user.
  */
  private setupConversationsListener(currentUserId: string) {
    this.unsubscribeListener(this.unsubscribeConversationsSnapshot);
    let conversationsRef = collection(this.firestore, 'directChats');
    let conversationsQuery = query(conversationsRef, orderBy('created_at', 'desc'));

    this.unsubscribeConversationsSnapshot = onSnapshot(conversationsQuery, (querySnapshot) => { let userIds: string[] = [];
      querySnapshot.forEach(docSnapshot => { let members = docSnapshot.data()['members'] as string[];
        if (members.includes(currentUserId)) {
          const otherUserId = members.find(id => id !== currentUserId);
          if (otherUserId) { userIds.push(otherUserId); }
        }
      });
      this.setupUsersListeners(userIds);
    });
  }

  /**
  * Sets up Firestore listeners for the given user IDs and updates the user list.
  * Unsubscribes from previous listeners before subscribing to new ones.
  * 
  * @private
  * @param {string[]} userIds - Array of user IDs to listen for changes.
  * @returns {void}
  */
  private setupUsersListeners(userIds: string[]): void {
    this.unsubscribeUserListeners();
    let users: UserLogged[] = [];
    let unsubscribes: (() => void)[] = [];

    userIds.forEach(userId => {let userDocRef = doc(this.firestore, `Users/${userId}`); let unsubscribe = onSnapshot(userDocRef, (userDoc) => {
        if (userDoc.exists()) {let user = { uid: userDoc.id, ...userDoc.data() } as UserLogged; let existingIndex = users.findIndex(u => u.uid === user.uid);
          if (existingIndex >= 0) { users[existingIndex] = user; } else { users.push(user);}
          this.conversationsSource.next([...users]);
        }
      });
      unsubscribes.push(unsubscribe);
    });
    this.currentUsersUnsubscribes = unsubscribes;
  }

  private currentUsersUnsubscribes: (() => void)[] = [];

  private unsubscribeUserListeners() {
    if (this.currentUsersUnsubscribes.length) {
      this.currentUsersUnsubscribes.forEach(unsubscribe => unsubscribe());
      this.currentUsersUnsubscribes = [];
    }
  }

  triggerLoadMessages() {
    this.loadMessagesSource.next();
  }

}
