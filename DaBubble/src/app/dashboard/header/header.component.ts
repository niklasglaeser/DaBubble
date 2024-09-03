import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UserLoggedService } from '../../services/lp-services/user-logged.service';
import { AuthService } from '../../services/lp-services/auth.service';
import { UserLogged } from '../../models/user-logged.model';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { DialogMenuComponent } from './dialog-menu/dialog-menu.component';
import { DialogEditProfilComponent } from '../../dialog/dialog-edit-profil/dialog-edit-profil.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { addDoc, collection, Firestore, getDocs } from '@angular/fire/firestore';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';
import { ChannelStateService } from '../../services/channel-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatFormFieldModule,
    DialogMenuComponent,
    ReactiveFormsModule,
    DialogEditProfilComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('arrowButton') arrowButton!: ElementRef;
  @ViewChild('auto') matAutocomplete!: MatAutocomplete;
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;

  private subscription: Subscription = new Subscription();

  dialog = inject(MatDialog);
  userLogged = inject(UserLoggedService);
  authService = inject(AuthService);
  user?: UserLogged;

  searchControl = new FormControl();
  isPanelOpen: boolean = false;
  searchResults: any[] = [];
  userEventService = inject(UserService);

  placeholderText: string = 'Durchsuche DevSpace';


  constructor(private firestore: Firestore, private channelStateService: ChannelStateService) { }

  ngOnInit(): void {
    this.subscribeToUserData();

    this.subscription.add(
      this.channelStateService.emitOpenSearchBar.subscribe(() => {
        this.openSearchPanel();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleContentSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value.toLowerCase();
    this.updateFilteredContent(query);
  }

  updateFilteredContent(query: string): void {
    if (query) {
      this.searchCollections(query);
    } else {
      this.searchResults = [];
    }
  }

  async searchCollections(searchTerm: string): Promise<void> {
    try {
      const channelsSnapshot = await getDocs(collection(this.firestore, 'channels'));
      const usersSnapshot = await getDocs(collection(this.firestore, 'Users'));
      this.searchResults = [];
      const currentUserId = this.authService.uid;

      channelsSnapshot.forEach(doc => {
        const channelData = doc.data();
        const channelName = (channelData["name"] || '').toLowerCase();
        const members = channelData["members"] || [];

        if (channelName.includes(searchTerm.toLowerCase()) && members.includes(currentUserId)) {
          this.searchResults.push({ id: doc.id, ...channelData, type: 'channel' });
        }
        // this.searchChannelMessages(doc.id, searchTerm);
      });
      usersSnapshot.forEach(doc => {
        const userName = (doc.data()["username"] || '').toLowerCase();
        if (userName.includes(searchTerm.toLowerCase())) {
          this.searchResults.push({ id: doc.id, ...doc.data(), type: 'user' });
        }
      });
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  }

  async searchChannelMessages(channelId: string, searchTerm: string): Promise<void> {
    try {
      const messagesSnapshot = await getDocs(collection(this.firestore, `channels/${channelId}/messages`));
      messagesSnapshot.forEach(doc => {
        const messageData = doc.data();
        const messageContent = (messageData["message"] || '').toLowerCase();
        if (messageContent.includes(searchTerm.toLowerCase())) {
          this.searchResults.push({
            id: doc.id,
            ...messageData,
            type: 'message',
            channelId: channelId
          });
        }
      });
    } catch (error) {
      console.error('Error searching messages in channel:', error);
    }
  }

  async openSearchPanel(): Promise<void> {
    await this.loadAllData();
    this.placeholderText = 'Suche nach Channels und Mitgliedern...';

    if (this.autocompleteTrigger) {
      this.autocompleteTrigger.openPanel();
    }
  }

  async loadAllData(): Promise<void> {
    try {
      const channelsSnapshot = await getDocs(collection(this.firestore, 'channels'));
      const usersSnapshot = await getDocs(collection(this.firestore, 'Users'));
      this.searchResults = [];
      const currentUserId = this.authService.uid;

      channelsSnapshot.forEach(doc => {
        const channelData = doc.data();
        const members = channelData["members"] || [];

        if (members.includes(currentUserId)) {
          this.searchResults.push({ id: doc.id, ...channelData, type: 'channel' });
        }
      });

      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        this.searchResults.push({ id: doc.id, ...userData, type: 'user' });
      });

    } catch (error) {
      console.error('Error fetching all data:', error);
    }
  }

  onOptionSelected(selectedItem: any): void {
    if (selectedItem.type === 'user') {
      this.userEventService.emitUserId(selectedItem.id);
    } else if (selectedItem.type === 'channel') {
      this.userEventService.emitChannelId(selectedItem.id);
    } else if (selectedItem.type === 'message') {
      this.navigateToMessage(selectedItem.channelId, selectedItem.id);
    }
    this.searchControl.setValue('');
    this.searchResults = [];
  }

  navigateToMessage(channelId: string, messageId: string): void {
    this.userEventService.emitChannelId(channelId);
    setTimeout(() => {
      const messageElement = document.getElementById(messageId);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        messageElement.classList.add('highlight');
        setTimeout(() => {
          messageElement.classList.remove('highlight');
        }, 2000);
      } else {
        console.warn('Nachricht nicht gefunden: ', messageId);
      }
    }, 500);
  }

  get channelResults() {
    return this.searchResults.filter(result => result.type === 'channel');
  }

  get userResults() {
    return this.searchResults.filter(result => result.type === 'user');
  }

  get messageResults() {
    return this.searchResults.filter(result => result.type === 'message');
  }

  async getUsername(senderId: string): Promise<string> {
    try {
      const user = await this.userEventService.getSingleUserObj(senderId); // Warten auf die Auflösung des Promises
      return user ? user.username : 'Unbekannt';
    } catch (error) {
      console.error('Error fetching user:', error);
      return 'Unbekannt';
    }
  }




  async subscribeToUserData(): Promise<void> {
    if (this.authService.uid) {
      await this.userLogged.subscribeUser(this.authService.uid).subscribe((data) => {
        this.user = data;
      });
    }
  }

  openDialog(): void {
    const arrowButton = this.arrowButton.nativeElement;

    this.dialog.open(DialogMenuComponent, {
      position: {
        top: `${25 + arrowButton.offsetTop + arrowButton.offsetHeight}px`,
        left: `${arrowButton.offsetLeft - 250}px`
      },
      panelClass: 'dialog-header-profile',
    });
  }

  openProfilDialog() {
    this.dialog.open(DialogEditProfilComponent, {});
  }

  displayFn(value: any): string {
    return '';
  }
}
