import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDMeLK7a0WW3qi3-32WAt-21Hdz_4CvezQ",
  authDomain: "dabubble-9f5b5.firebaseapp.com",
  projectId: "dabubble-9f5b5",
  storageBucket: "dabubble-9f5b5.appspot.com",
  messagingSenderId: "444352507604",
  appId: "1:444352507604:web:6f7c377c02e29020279541"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideAnimationsAsync(), 
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(()=>getAuth())
    
  ]
};