import { inject, Injectable, signal } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, user, UserInfo } from "@angular/fire/auth";
import { concatMap, from, Observable, of,} from 'rxjs';
import { UserInterface } from '../../models/user.interface';

@Injectable({
    providedIn: 'root'
})

export class AuthService{
    firebaseAuth = inject(Auth)
    user$ = user(this.firebaseAuth)
    currentUserSig = signal<UserInterface | null | undefined >(undefined)

    subscribeUser() {
        this.user$.subscribe(user => {
            if (user) {
                this.currentUserSig.set({
                    email: user.email!,
                    username: user.displayName!,
                });
            } else {
                this.currentUserSig.set(null);
            }
        });
    }
    

    register(email:string,username:string,password:string,):Observable <void>{
        const promise = createUserWithEmailAndPassword(this.firebaseAuth,email,password)
        .then(response => updateProfile(response.user,{displayName: username}))

        return from(promise)
    }

    login( email:string, password:string): Observable<void>{
        const promise = signInWithEmailAndPassword(this.firebaseAuth,email,password)
        .then(()=>{})

        return from(promise)
    }

    updateProfileData(profileData: Partial<UserInfo>): Observable<any> {
        const user = this.firebaseAuth.currentUser; 
        return of(user).pipe(
            concatMap(user => {
                if (!user) throw Error('No Authenticated User');
                
                return from(updateProfile(user, profileData)); 
            })
        );
    }
}


