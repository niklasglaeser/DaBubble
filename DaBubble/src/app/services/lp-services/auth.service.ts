import { inject, Injectable, signal } from '@angular/core';
import { Auth, AuthProvider, browserLocalPersistence, confirmPasswordReset, createUserWithEmailAndPassword, getRedirectResult, GoogleAuthProvider, sendPasswordResetEmail, setPersistence, signInWithCredential, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut, updateProfile, user, UserCredential, verifyPasswordResetCode } from '@angular/fire/auth';
import { catchError, concatMap, from, Observable, of, switchMap, throwError } from 'rxjs';
import { UserInterface } from '../../models/user.interface';
import { UserLoggedService } from './user-logged.service';
import { doc, getDoc } from '@angular/fire/firestore';
import { UserLogged } from '../../models/user-logged.model';
import { ActivatedRoute, Router } from '@angular/router';
import { LandingPageComponent } from '../../landing-page/landing-page.component';
import { ChannelService } from '../channel.service';

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

  constructor() {
    this.restoreUid()
    this.subscribeUser()
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  private restoreUid() {
    const storedUid = sessionStorage.getItem('uid');
    if (storedUid) {
      this.uid = storedUid;
      console.log('UID restored from localStorage:', this.uid);
    }
  }

  subscribeUser() {
    this.user$.subscribe(async (user) => {
      if (user) {
        this.uid = user.uid
        sessionStorage.setItem('uid', this.uid);
        this.currentUserSig.set({
          email: user.email!,
          username: user.displayName!,
          userId: user.uid!
        });
        await this.updateUserStatus(this.uid, true);
        console.log('UserId is subscribed:', this.uid, 'Username:', user.displayName)
      } else {
        this.currentUserSig.set(null);
        sessionStorage.removeItem('uid');
      }
    });
  }

  private async updateUserStatus(userId: string, status: boolean) {
    try {
      await this.userService.updateUserStatus(userId, status);
      console.log(`User ${status ? 'online' : 'offline'} status set for userId: ${userId}`);
    } catch (error) { }
  }

  register(email: string, username: string, password: string): Observable<UserCredential> {
    return from(this.createFirebaseUser(email, password)).pipe(
      switchMap((userCredential) => this.updateUserProfile(userCredential, username)),
      switchMap((userCredential) => this.saveUserToDatabase(userCredential, username, email)),
      switchMap((userCredential) => {
        const uid = userCredential.user.uid;
        const defaultChannelId = this.channelService.defaultChannelId;;
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

  private saveUserToDatabase(userCredential: UserCredential, username: string, email: string): Observable<UserCredential> {
    const uid = userCredential.user.uid;
    const userObject = this.createUserObject(uid, username, email);

    return from(this.userService.addUser(userObject)).pipe(
      switchMap(() => {
        this.uid = uid;
        console.log('User ID:', this.uid);
        return of(userCredential);
      })
    );
  }

  private handleRegistrationError(error: any): Observable<never> {
    // console.error('Registration error:', error);
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

  login(email: string, password: string): Observable<UserCredential> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(async (userCredential) => {
        this.uid = userCredential.user.uid;
        console.log('Logged UserID:', this.uid);
        await this.updateUserStatus(this.uid, true);
        return userCredential;
      })
      .catch((error) => {
        throw error;
      });

    return from(promise);
  }

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

  googleLogin(): Observable<void> {
    const provider = new GoogleAuthProvider();
    const promise = signInWithPopup(this.firebaseAuth, provider)
      .then(async (userCredential: UserCredential) => {
        const user: UserInterface | any = userCredential.user;
        this.uid = user.uid;

        return this.handleUserLogin(user);
      })
      .catch(this.handleLoginError);

    return from(promise);
  }

  private async handleUserLogin(user: UserInterface): Promise<void> {
    const emailExists = await this.userService.isEmailTaken(user.email!);

    if (emailExists) {
      await this.updateExistingUser(user.uid!);
      this.navigateToDashboard();
    } else {
      await this.createNewUser(user);
    }
  }

  private async createNewUser(user: UserInterface): Promise<void> {
    const newUser = new UserLogged({
      username: user.displayName!,
      email: user.email!,
      uid: user.uid,
      photoURL: user.photoURL || '',
      joinedChannels: [],
      directMessage: [],
      onlineStatus: true
    });

    await this.userService.addUser(newUser);
  }

  private async updateExistingUser(userId: string): Promise<void> {
    await this.userService.updateUserStatus(userId, true);
  }

  private navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  private handleLoginError(error: any): void {
    console.error('Error during Google login:', error);
    throw error;
  }

  private handleStorageChange(event: StorageEvent) {
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
