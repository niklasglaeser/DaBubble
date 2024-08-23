
import { inject, Injectable, signal } from "@angular/core";
import { Auth, AuthProvider, confirmPasswordReset, createUserWithEmailAndPassword, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, user, UserCredential, verifyPasswordResetCode } from "@angular/fire/auth";
import { concatMap, from, Observable, of } from 'rxjs';
import { UserInterface } from '../../models/user.interface';
import { UserLoggedService } from "./user-logged.service";
import { doc, getDoc } from '@angular/fire/firestore';
import { UserLogged } from "../../models/user-logged.model";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    firebaseAuth = inject(Auth);
    user$ = user(this.firebaseAuth);
    userService = inject(UserLoggedService);
    currentUserSig = signal<UserInterface | null | undefined>(undefined);
    uid: string = ''

    subscribeUser() {
        this.user$.subscribe(async (user) => {
            if (user) {
                this.currentUserSig.set({
                    email: user.email!,
                    username: user.displayName!,
                    userId: user.uid!
                });
                
            } else {
                this.currentUserSig.set(null);
            }
        });
    }

    private async updateUserStatus(userId: string, status: boolean) {
        try {
            await this.userService.updateUserStatus(userId, status);
            console.log(`User ${status ? 'online' : 'offline'} status set for userId: ${userId}`);
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    }

    register(email: string, username: string, password: string): Observable<UserCredential> {
        const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
          .then(response => {
            return updateProfile(response.user, { displayName: username }).then(() => response);
          })
          .catch(error => {
            console.error('Error during registration or profile update:', error);
            throw error;
          });
    
        return from(promise);
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
            console.error('Error during login:', error);
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
            console.error('Error during logout:', error);
            throw error;
          });
    
        return from(promise);
    }
    

    resetPassword(email: string): Observable<void> {
        const promise = sendPasswordResetEmail(this.firebaseAuth, email)
            .catch(error => {
                console.error('Error sending password reset email:', error);
                throw error;
            });
    
        return from(promise);
    }

    verifyResetCode(oobCode: string): Observable<void> {
        const promise = verifyPasswordResetCode(this.firebaseAuth, oobCode)
            .then(() => undefined) 
            .catch(error => {
                console.error('Error verifying reset code:', error);
                throw error;
            });
        return from(promise);
    }

    confirmPassword(oobCode: string, newPassword: string): Observable<void> {
        const promise = confirmPasswordReset(this.firebaseAuth, oobCode, newPassword)
            .then(() => undefined) 
            .catch(error => {
                console.error('Error confirming new password:', error);
                throw error;
            });
        return from(promise);
    }

    googleLogin(): Observable<UserCredential> {
      const provider: AuthProvider = new GoogleAuthProvider();
      const promise = signInWithPopup(this.firebaseAuth, provider)
          .then(async (userCredential) => {
              const user = userCredential.user;
              this.uid = user.uid;
              console.log('Logged in with Google. UserID:', this.uid);

              const emailExists = await this.userService.isEmailTaken(user.email!);
              if (!emailExists) {
                  
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
                  
              } else {
                  await this.userService.updateUserStatus(user.uid, true);
              }

              return userCredential;
          })
          .catch((error) => {
              console.error('Error during Google login:', error);
              throw error;
          });

      return from(promise);
  }

}


