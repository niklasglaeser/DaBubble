import { inject, Injectable, signal } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, user, UserInfo } from "@angular/fire/auth";
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
                    userId: user.uid!
                });
            } else {
                this.currentUserSig.set(null);
            }
            console.log(this.currentUserSig());
            return this.currentUserSig()
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

    logout():Observable<void>{
        const promise = signOut(this.firebaseAuth)
        return from(promise)
    }
}


