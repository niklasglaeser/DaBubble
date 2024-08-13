import { inject, Injectable } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, updateProfile } from "@angular/fire/auth";
import { from, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class AuthService{
    firebasAuth = inject(Auth)

    register(email:string,username:string,password:string,):Observable <void>{
        const promise = createUserWithEmailAndPassword(this.firebasAuth,email,password)
        .then(response => updateProfile(response.user,{displayName: username}))

        return from(promise)
    }
}