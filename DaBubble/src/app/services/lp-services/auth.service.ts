import { inject, Injectable, signal } from '@angular/core';
import { Auth, AuthProvider, browserLocalPersistence, confirmPasswordReset, createUserWithEmailAndPassword, getRedirectResult, GoogleAuthProvider, sendPasswordResetEmail, setPersistence, signInWithCredential, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut, updateProfile, user, UserCredential, verifyPasswordResetCode, User } from '@angular/fire/auth';
import { BehaviorSubject, catchError, concatMap, filter, from, Observable, of, switchMap, throwError } from 'rxjs';
import { UserInterface } from '../../models/user.interface';
import { UserLoggedService } from './user-logged.service';
import { doc, getDoc } from '@angular/fire/firestore';
import { UserLogged } from '../../models/user-logged.model';
import { ActivatedRoute, Router } from '@angular/router';
import { LandingPageComponent } from '../../landing-page/landing-page.component';
import { ChannelService } from '../channel.service';
import { CheckboxControlValueAccessor } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firebaseAuth = inject(Auth);
  router = inject(Router);
  user$ = user(this.firebaseAuth);
  userService = inject(UserLoggedService);
  channelService = inject(ChannelService);
  currentUserSig = signal<UserInterface | null | undefined>(undefined);
  uid: string = '';
  user: UserInterface | any ;
  avatar: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  provider = new GoogleAuthProvider();
  userCredential? : UserCredential 

  constructor() {
    this.restoreUid()
    this.subscribeUser()
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  /**
 * Restores the user ID (UID) from session storage if it exists.
 * 
 * This private method checks if a UID is stored in the session storage. If a UID is found, it assigns the value to 
 * the `uid` property and logs a confirmation message. This method is useful for persisting user sessions across page reloads.
 * 
 * @private
 * @returns {void} - Does not return anything.
 */
private restoreUid(): void {
  const storedUid = sessionStorage.getItem('uid');
  if (storedUid) {
    this.uid = storedUid;
  }
}


/**
 * Subscribes to the user observable to monitor authentication status and updates the user's session and status accordingly.
 * 
 * This method subscribes to the `user$` observable, which emits the current user's authentication status. If a user is logged in, 
 * their UID is stored in session storage, and their user details (email and display name) are saved. The user's online status 
 * is updated by calling `updateUserStatus`. If the user logs out or the session ends, the UID is removed from session storage, 
 * and the current user signal is reset.
 * 
 * @returns {void} - Does not return anything.
 */
 subscribeUser(): void {
  this.user$.subscribe(async (user) => {
    if (user) {
      this.uid = user.uid;
      sessionStorage.setItem('uid', this.uid);
      this.currentUserSig.set({
        email: user.email!,
        username: user.displayName!,
        userId: user.uid!
      });
      await this.updateUserStatus(this.uid, true);
    } else {
      this.currentUserSig.set(null);
      sessionStorage.removeItem('uid');
    }
  });
}


/**
 * Updates the user's online status in the user service.
 * 
 * This private asynchronous method updates the user's online status by calling the `updateUserStatus` method in the user service. 
 * It logs a message indicating whether the user is online or offline based on the provided status. If the update fails, it silently catches any errors.
 * 
 * @private
 * @param {string} userId - The unique identifier of the user whose status is being updated.
 * @param {boolean} status - The user's status, where `true` means online and `false` means offline.
 * @returns {Promise<void>} - Returns a promise that resolves once the status update is complete.
 */
 private async updateUserStatus(userId: string, status: boolean): Promise<void> {
  try {
    await this.userService.updateUserStatus(userId, status);
  } catch (error) {
    // Silently handle error if update fails
  }
}


/**
 * Registers a new user with the provided email, username, and password, then saves the user information and adds them to the welcome channel.
 * 
 * This method creates a new Firebase user, updates the user's profile with the provided username, saves the user information to the database,
 * and adds the user to the default welcome channel. It handles errors that may occur during the registration process.
 * 
 * @param {string} email - The email address of the new user.
 * @param {string} username - The username of the new user.
 * @param {string} password - The password chosen by the new user.
 * @returns {Observable<UserCredential>} - An observable that emits the UserCredential object upon successful registration.
 */
 register(email: string, username: string, password: string): Observable<UserCredential> {
  return from(this.createFirebaseUser(email, password)).pipe(
    switchMap((userCredential) => this.updateUserProfile(userCredential, username)),
    switchMap((userCredential) => this.saveUserToDatabase(userCredential, username, email)),
    switchMap((userCredential) => {
      const uid = userCredential.user.uid;
      const defaultChannelId = this.channelService.defaultChannelId;
      return from(this.channelService.addUsersToWelcomeChannel(defaultChannelId, [uid])).pipe(
        switchMap(() => of(userCredential))
      );
    }),
    catchError(this.handleRegistrationError)
  );
}


  private createFirebaseUser(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.firebaseAuth, email, password);
  }

  private updateUserProfile(userCredential: UserCredential, username: string): Observable<UserCredential> {
    if (!userCredential.user) {
      throw new Error('No user credentials received after registration.');
    }
    return from(updateProfile(userCredential.user, { displayName: username })).pipe(switchMap(() => of(userCredential)));
  }

/**
 * Saves the newly registered user to the database.
 * 
 * This private method creates a user object using the provided `UserCredential`, `username`, and `email`, then saves the user to the database
 * using the `userService`. Once the user is successfully added, it updates the local `uid` and logs the user ID. It then returns the original
 * `UserCredential` wrapped in an observable.
 * 
 * @private
 * @param {UserCredential} userCredential - The user credential object returned from Firebase upon registration.
 * @param {string} username - The username of the newly registered user.
 * @param {string} email - The email address of the newly registered user.
 * @returns {Observable<UserCredential>} - An observable that emits the original `UserCredential` after saving the user to the database.
 */
 private saveUserToDatabase(userCredential: UserCredential, username: string, email: string): Observable<UserCredential> {
  const uid = userCredential.user.uid;
  const userObject = this.createUserObject(uid, username, email);

  return from(this.userService.addUser(userObject)).pipe(
    switchMap(() => {
      this.uid = uid;
      return of(userCredential);
    })
  );
}


  private handleRegistrationError(error: any): Observable<never> {
    return throwError(() => new Error(error.message));
  }

  private createUserObject(uid: string, username: string, email: string): any {
    return new UserLogged({
      username: username,
      email: email,
      uid: uid,
      photoURL: '',
      joinedChannels: [],
      directMessage: [],
      onlineStatus: true
    });
  }

/**
 * Logs in a user with the provided email and password, updates the user's online status, and returns the user credentials.
 * 
 * This method attempts to sign in the user using Firebase's `signInWithEmailAndPassword` function. Upon successful login, it updates the user's
 * online status to `true` using the `updateUserStatus` method. If the login is successful, it returns the `UserCredential`. In case of an error,
 * the method throws the error, which is then handled by the caller.
 * 
 * @param {string} email - The email address of the user trying to log in.
 * @param {string} password - The password of the user trying to log in.
 * @returns {Observable<UserCredential>} - An observable that emits the `UserCredential` upon successful login.
 */
 login(email: string, password: string): Observable<UserCredential> {
  const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
    .then(async (userCredential) => {
      this.uid = userCredential.user.uid;
      await this.updateUserStatus(this.uid, true);
      return userCredential;
    })
    .catch((error) => {
      throw error;
    });
  return from(promise);
}

/**
 * Logs out the current user, updates their online status to offline, and clears the stored user ID.
 * 
 * This method signs out the user using Firebase's `signOut` function. After a successful sign-out, it updates the user's
 * status to `false` (offline) by calling the `updateUserStatus` method. It then clears the `uid` property. In case of an error
 * during the logout process, the method throws the error, which can be handled by the caller.
 * 
 * @returns {Observable<void>} - An observable that completes once the logout process is finished.
 */
 logout(): Observable<void> {
  const promise = signOut(this.firebaseAuth)
    .then(async () => {
      await this.updateUserStatus(this.uid, false);
      this.uid = '';
    })
    .catch((error) => {
      throw error;
    });
  return from(promise);
}

  resetPassword(email: string): Observable<void> {
    const promise = sendPasswordResetEmail(this.firebaseAuth, email).catch((error) => {
      throw error;
    });
    return from(promise);
  }

  verifyResetCode(oobCode: string): Observable<void> {
    const promise = verifyPasswordResetCode(this.firebaseAuth, oobCode)
      .then(() => undefined)
      .catch((error) => {
        throw error;
      });
    return from(promise);
  }

  confirmPassword(oobCode: string, newPassword: string): Observable<void> {
    const promise = confirmPasswordReset(this.firebaseAuth, oobCode, newPassword)
      .then(() => undefined)
      .catch((error) => {
        throw error;
      });
    return from(promise);
  }

/**
 * Logs in the user via Google authentication using a popup, updates the user's status, and handles user creation in Firestore.
 * 
 * This method triggers the Google login process through a popup using Firebase's `signInWithPopup` method. Once the login is successful, 
 * it checks if the user already exists in Firestore by calling `isUserInFirestore`. Depending on whether the user exists, it handles
 * the creation of the user. If the login is successful, it updates the `uid` and returns the `UserCredential`. In case of an error, 
 * the method throws the error, which can be handled by the caller.
 * 
 * @returns {Observable<UserCredential>} - An observable that emits the `UserCredential` upon successful login.
 */
 googleLogin(): Observable<UserCredential> {
  const promise = signInWithPopup(this.firebaseAuth, this.provider)
    .then(async (result) => {
      this.userCredential = result;
      this.uid = this.userCredential.user.uid;
      this.avatar.next(false);
      const exists = await this.userService.isUserInFirestore(result.user.uid);
      this.createUser(exists);
      return result;
    })
    .catch((error) => {
      throw error;
    });
  return from(promise); 
}


  createUser(exists: boolean){
    if (exists === false) {
      this.avatar.next(true); 
      this.newGoogleUser();   
    } else {
      this.avatar.next(false); 
    }
  }
  
/**
 * Handles the creation of a new Google user, updates the profile, saves the user to the database, and adds the user to the welcome channel.
 * 
 * This method is designed for new Google users who have logged in. It performs the following steps:
 * 1. Updates the user's profile with their display name.
 * 2. Saves the user information (UID, display name, email) to the database.
 * 3. Adds the user to the default welcome channel.
 * 
 * Each of these steps is executed in sequence, and once all steps are completed, the method returns the `UserCredential` of the user.
 * 
 * @returns {Observable<UserCredential>} - An observable that emits the `UserCredential` after the profile update, database save, and welcome channel addition.
 */
 newGoogleUser(): Observable<UserCredential> {
  const defaultChannelId = this.channelService.defaultChannelId;
  const displayName = this.userCredential!.user.displayName!;
  const email = this.userCredential!.user.email!;
  const uid = this.userCredential!.user.uid!;
  
  const profileUpdate$ = from(this.updateUserProfile(this.userCredential!, displayName));
  const saveUserToDatabase$ = from(this.saveUserToDatabase(this.userCredential!, displayName, email));
  const addToWelcomeChannel$ = from(this.channelService.addUsersToWelcomeChannel(defaultChannelId!, [uid]));
  
  return profileUpdate$.pipe(
    switchMap(() => saveUserToDatabase$),
    switchMap(() => addToWelcomeChannel$),
    switchMap(() => of(this.userCredential!))
  );
}

  saveUserToFirestore(user: UserInterface): Observable<void> {
    const currentUser = this.createUserObject(user.uid!, user.displayName!, user.email)
    return from(this.userService.addUser(currentUser));
  }

  private async updateExistingUser(userId: string): Promise<void> {
    await this.userService.updateUserStatus(userId, true);
  }

/**
 * Handles changes to session storage, specifically when the `uid` is removed, and updates the application's state accordingly.
 * 
 * This private method listens for changes to session storage, and when the `uid` key is removed (i.e., the user is logged out or session is cleared), 
 * it sets the current user signal (`currentUserSig`) to `null`, removes the `uid` from session storage, and navigates the user back to the home or login page.
 * 
 * @private
 * @param {StorageEvent} event - The storage event that contains details about the change in session storage.
 * @returns {void} - Does not return anything.
 */
 private handleStorageChange(event: StorageEvent): void {
  if (event.key === 'uid' && event.newValue === null) {
    this.currentUserSig.set(null);
    sessionStorage.removeItem('uid');
    this.router.navigate(['']);
  }
}

  ngOnDestroy() {
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
  }

}
