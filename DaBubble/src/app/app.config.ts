import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { HashLocationStrategy } from '@angular/common';
import { LocationStrategy } from '@angular/common';

const firebaseConfig = {
  apiKey: 'AIzaSyDMeLK7a0WW3qi3-32WAt-21Hdz_4CvezQ',
  authDomain: 'dabubble-9f5b5.firebaseapp.com',
  projectId: 'dabubble-9f5b5',
  storageBucket: 'dabubble-9f5b5.appspot.com',
  messagingSenderId: '444352507604',
  appId: '1:444352507604:web:6f7c377c02e29020279541',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    { provide: LocationStrategy, useClass: HashLocationStrategy },  
  ],
};


