
import { inject, Injectable, signal } from "@angular/core";
import { Auth, confirmPasswordReset, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile, user, verifyPasswordResetCode } from "@angular/fire/auth";
import { concatMap, from, Observable, of } from 'rxjs';
import { UserInterface } from '../../models/user.interface';
import { UserLoggedService } from "./user-logged.service";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    firebaseAuth = inject(Auth);
    user$ = user(this.firebaseAuth);
    userService = inject(UserLoggedService);
    currentUserSig = signal<UserInterface | null | undefined>(undefined);

    subscribeUser() {
        this.user$.subscribe(async (user) => {
            if (user) {
                this.currentUserSig.set({
                    email: user.email!,
                    username: user.displayName!,
                    userId: user.uid!
                });

                await this.updateUserStatus(user.uid, true);
            } else {
                if (this.currentUserSig()) {
                    await this.updateUserStatus(this.currentUserSig()!.userId, false);
                }
                this.currentUserSig.set(null);
            }
            console.log(this.currentUserSig());
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

    register(email: string, username: string, password: string): Observable<void> {
        const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
            .then(response => updateProfile(response.user, { displayName: username }))
            .catch(error => {
                console.error('Error verifying signUp code:', error);
                throw error;
            });

        return from(promise);
    }

    login(email: string, password: string): Observable<void> {
        const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
        .then(() => {})
        .catch(error => {
            console.error('Error verifying login code:', error);
            throw error;
        });
        return from(promise);
    }

    logout(): Observable<void> {
        const promise = signOut(this.firebaseAuth);
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
}


