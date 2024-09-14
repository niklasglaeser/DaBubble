import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatAutocomplete, MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { DialogMenuComponent } from '../header/dialog-menu/dialog-menu.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DialogEditProfilComponent } from '../../dialog/dialog-edit-profil/dialog-edit-profil.component';
import { UserService } from '../../services/user.service';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import { AuthService } from '../../services/lp-services/auth.service';
import { Subscription } from 'rxjs';
import { ChannelStateService } from '../../services/channel-state.service';

@Component({
  selector: 'app-search',
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
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})

export class SearchComponent implements OnInit {

  @ViewChild('auto') matAutocomplete!: MatAutocomplete;
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;
  private subscription: Subscription = new Subscription();
  authService = inject(AuthService);

  searchControl = new FormControl();
  searchResults: any[] = [];
  userEventService = inject(UserService);

  placeholderText: string = 'Durchsuche DevSpace';

  constructor(private firestore: Firestore, private channelStateService: ChannelStateService) {

  }
  ngOnInit(): void {
    this.subscription.add(
      this.channelStateService.emitOpenSearchBar.subscribe(() => {this.openSearchPanel();})
    );
  }
  handleContentSearch(event: Event): void {
    let inputElement = event.target as HTMLInputElement;
    let query = inputElement.value.toLowerCase();
    this.updateFilteredContent(query);
  }

  updateFilteredContent(query: string): void {
    if (query) {this.searchCollections(query);} 
    else {this.searchResults = [];}
  }

  async searchCollections(searchTerm: string): Promise<void> {
    try {
      let channelsSnapshot = await getDocs(collection(this.firestore, 'channels'));
      let usersSnapshot = await getDocs(collection(this.firestore, 'Users'));
      this.searchResults = [];
      let currentUserId = this.authService.uid;

      channelsSnapshot.forEach(doc => {let channelData = doc.data(); let channelName = (channelData["name"] || '').toLowerCase(); let members = channelData["members"] || [];
        if (channelName.includes(searchTerm.toLowerCase()) && members.includes(currentUserId)) {this.searchResults.push({ id: doc.id, ...channelData, type: 'channel' });}
        // this.searchChannelMessages(doc.id, searchTerm);
      });
      usersSnapshot.forEach(doc => {
        let userName = (doc.data()["username"] || '').toLowerCase();
        if (userName.includes(searchTerm.toLowerCase())) {this.searchResults.push({ id: doc.id, ...doc.data(), type: 'user' });}
      });
    } catch (error) {console.error('Error fetching search results:', error);}
  }

  async searchChannelMessages(channelId: string, searchTerm: string): Promise<void> {
    try {
      const messagesSnapshot = await getDocs(collection(this.firestore, `channels/${channelId}/messages`));
      messagesSnapshot.forEach(doc => {
        let messageData = doc.data();
        let messageContent = (messageData["message"] || '').toLowerCase();
        if (messageContent.includes(searchTerm.toLowerCase())) {this.searchResults.push({id: doc.id, ...messageData, type: 'message', channelId: channelId});}
      });
    } catch (error) {console.error('Error searching messages in channel:', error);}
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
      let channelsSnapshot = await getDocs(collection(this.firestore, 'channels'));
      let usersSnapshot = await getDocs(collection(this.firestore, 'Users'));
      this.searchResults = [];
      let currentUserId = this.authService.uid;

      channelsSnapshot.forEach(doc => { let channelData = doc.data(); let members = channelData["members"] || [];
        if (members.includes(currentUserId)) {this.searchResults.push({ id: doc.id, ...channelData, type: 'channel' });}
      });

      usersSnapshot.forEach(doc => { const userData = doc.data(); this.searchResults.push({ id: doc.id, ...userData, type: 'user' });});

    } catch (error) {console.error('Error fetching all data:', error);}
  }

  onOptionSelected(selectedItem: any): void {
    if (selectedItem.type === 'user') {this.userEventService.emitUserId(selectedItem.id);} 
    else if (selectedItem.type === 'channel') {this.userEventService.emitChannelId(selectedItem.id);}
    else if (selectedItem.type === 'message') {this.navigateToMessage(selectedItem.channelId, selectedItem.id);}
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

  onPanelOpened(): void {
    this.placeholderText = 'Suche nach Channels und Mitgliedern...';
  }

  onPanelClosed(): void {
    this.placeholderText = 'Durchsuche DevSpace';
  }

  displayFn(value: any): string {
    return '';
  }
}
