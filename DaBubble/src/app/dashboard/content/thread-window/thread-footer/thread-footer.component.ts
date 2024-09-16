import { Component, HostListener, inject, Input, ViewChild } from '@angular/core';
import { Message } from '../../../../models/message.model';
import { ThreadService } from '../../../../services/thread.service';
import { AuthService } from '../../../../services/lp-services/auth.service';
import { MessageService } from '../../../../services/message.service';
import { Channel } from '../../../../models/channel.class';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { UserLogged } from '../../../../models/user-logged.model';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UserLoggedService } from '../../../../services/lp-services/user-logged.service';
import { UploadService } from '../../../../services/lp-services/upload.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-thread-footer',
  standalone: true,
  imports: [PickerComponent, EmojiComponent, CommonModule, ReactiveFormsModule, MatAutocompleteModule, MatAutocompleteTrigger, MatIconModule, FormsModule],
  templateUrl: './thread-footer.component.html',
  styleUrl: './thread-footer.component.scss',
})
export class ThreadFooterComponent {
  @Input() channelId: string = '';
  @Input() messageId: string = '';
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;
  userService = inject(UserLoggedService);
  imgUploadService = inject(UploadService);
  channel: Channel | null = null;
  currentUserId: string = '';

  symbolSearch = new FormControl();
  selectedNameToInsert: string = '';
  filteredUserOptions$: Observable<UserLogged[]> | null = null;
  filteredChannelOptions$: Observable<Channel[]> | null = null;
  inputValue: string = '';
  isPanelOpen = false;

  inputText: string = '';
  filteredUsers: UserLogged[] = [];
  filteredChannels: Channel[] = [];
  activeIndex: number = -1;
  dropdownOpen: boolean = false;
  hasSelectedUser: boolean = false;

  showEmojiPicker: boolean = false

  chatImg: string | null = null;
  uploadError: string | null = null;
  isPdf: boolean = false;
  safePath: string | null = null;

  constructor(private threadService: ThreadService, private authService: AuthService, private messageService: MessageService, private sanitizer: DomSanitizer,) {this.currentUserId = this.authService.uid;}

  sendMessage(): void {
    let textarea = document.getElementById('thread-message-input') as HTMLTextAreaElement;
    let messageText = this.inputText;

    if (messageText.trim() || this.chatImg) {
      let message: Message = {message: messageText, senderId: '', imagePath: this.chatImg!, created_at: new Date(), updated_at: new Date(),};

      if (this.channelId) {
        this.messageService.addMessageThread(this.channelId, message, this.messageId)
        .then(() => {this.inputText = '';this.chatImg = null; textarea.value = '';});
      } else {console.error('Channel ID is undefined.');}
    }
  }

  openAutocomplete(): void {
    let textarea = document.getElementById('chat-message-input-thread') as HTMLTextAreaElement;
    this.inputText += '@';
    textarea.focus();
    this.messageService.searchUsers('').subscribe((users) => {this.filteredUsers = users; this.dropdownOpen = true;});
  }

  onInput(event: any): void {
    let inputValue = this.inputText;

    if (this.hasSelectedUser) {this.hasSelectedUser = false; return;}

    if (inputValue.includes('@')) {
      let query = inputValue.split('@').pop()?.trim() || '';
      if (query === '' || this.dropdownOpen) { this.messageService.searchUsers(query).subscribe((users) => {this.filteredUsers = users; this.dropdownOpen = true; this.activeIndex = 0;});}
    } else if (inputValue.includes('#')) {
      let query = inputValue.split('#').pop()?.trim() || '';
      if (query === '' || this.dropdownOpen) {this.messageService.searchUserChannels(this.currentUserId, query).subscribe((channels) => {this.filteredChannels = channels; this.dropdownOpen = true; this.activeIndex = 0;});}
    } else { this.filteredUsers = []; this.filteredChannels = []; this.dropdownOpen = false; this.activeIndex = -1;}
  }

  selectUser(user: UserLogged): void {
    let atPosition = this.inputText.lastIndexOf('@');
    if (atPosition !== -1) {this.inputText = this.inputText.substring(0, atPosition) + `@${user.username}\n `;}
    this.filteredUsers = [];
    this.dropdownOpen = false;
    this.activeIndex = -1;
    this.hasSelectedUser = true;
  }

  selectChannel(channel: Channel): void {
    let hashPosition = this.inputText.lastIndexOf('#');
    if (hashPosition !== -1) {this.inputText = this.inputText.substring(0, hashPosition) + `#${channel.name}\n `;}
    this.filteredChannels = [];
    this.dropdownOpen = false;
    this.activeIndex = -1;
    this.hasSelectedUser = true;
  }

  moveDown(event: KeyboardEvent): void {
    if (this.dropdownOpen) {
      if (this.filteredUsers.length > 0 && this.activeIndex < this.filteredUsers.length - 1) {this.activeIndex++;}
      else if (this.filteredChannels.length > 0 && this.activeIndex < this.filteredChannels.length - 1) {this.activeIndex++;}
      event.preventDefault();
      this.scrollToActiveItem();
    }
  }

  moveUp(event: KeyboardEvent): void {
    if (this.dropdownOpen) {
      if (this.filteredUsers.length > 0 && this.activeIndex > 0) {this.activeIndex--;} 
      else if (this.filteredChannels.length > 0 && this.activeIndex > 0) {this.activeIndex--;}
      event.preventDefault();
      this.scrollToActiveItem();
    }
  }

  selectSuggestion(): void {
    if (this.filteredUsers.length > 0 && this.activeIndex >= 0) {this.selectUser(this.filteredUsers[this.activeIndex]);}
    else if (this.filteredChannels.length > 0 && this.activeIndex >= 0) {this.selectChannel(this.filteredChannels[this.activeIndex]);}
    this.dropdownOpen = false;
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (this.dropdownOpen) {this.selectSuggestion(); event.preventDefault();} 
      else {this.sendMessage();}
    }
    if (event.key === 'ArrowDown') {this.moveDown(event);}
    if (event.key === 'ArrowUp') {this.moveUp(event);}
  }

  handleEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.dropdownOpen) {this.selectSuggestion(); event.preventDefault();}
  }

  scrollToActiveItem(): void {
    let activeElement = document.querySelector('.autocomplete-list li.active') as HTMLElement;
    let container = document.querySelector('.autocomplete-list') as HTMLElement;

    if (activeElement && container) {
      let containerRect = container.getBoundingClientRect();
      let activeElementRect = activeElement.getBoundingClientRect();
      let containerBottom = container.scrollTop + container.clientHeight;
      if (activeElementRect.bottom > containerBottom) {const scrollAmount = activeElementRect.bottom - containerRect.bottom; container.scrollTop += scrollAmount + 60;}
      if (activeElementRect.top < containerRect.top) {const scrollAmount = containerRect.top - activeElementRect.top; container.scrollTop -= scrollAmount + 0;}
      if (container.scrollTop < 0) {container.scrollTop = 0;}
      let isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight;
      if (isAtBottom) {container.scrollTop = container.scrollHeight - container.clientHeight;}
    }
  }

  uploadImage(event: Event) {
    let input = event.target as HTMLInputElement;
    let file = input.files?.[0];
    if (!file) return;

    this.isPdf = file.type === 'application/pdf';
    let currentUser = this.authService.currentUserSig();
    if (!currentUser) return;

    this.imgUploadService.uploadImgChat(currentUser.userId, file, this.channel?.id).subscribe({
        next: (imagePath: string) => this.handleUploadSuccess(imagePath),
        error: (err: any) => this.handleUploadError(err)
      });
    input.value = '';
  }

  handleUploadSuccess(imagePath: string) {
    this.chatImg = imagePath;
    this.safePath = this.isPdf ? this.sanitizer.bypassSecurityTrustResourceUrl(imagePath) as string : null;
  }

  handleUploadError(err: any) {
    this.uploadError = err.message || 'Fehler beim Hochladen des Bildes.';
    this.chatImg = this.safePath = null;
    this.isPdf = false;
    setTimeout(() => this.uploadError = null, 3000);
  }


  triggerFileUpload(inputElement: HTMLInputElement) {inputElement.click();}

  deleteImg() {
    if (this.chatImg) {
      this.imgUploadService.deleteImgChat(this.chatImg).subscribe({next: () => {this.chatImg = null; this.safePath = null; this.isPdf = false;
        let fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
        if (fileInput) {fileInput.value = '';}},
        error: (err: any) => {console.error('Fehler beim Löschen der Datei:', err);}
      });
    }
  }

  toggleEmojiPicker(event: MouseEvent) {
    event.stopPropagation();
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    let emoji = event.emoji.native;
    let textarea = document.getElementById('chat-message-input-thread') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value += emoji + " ";
      textarea.focus();
      let event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);
    }
    this.showEmojiPicker = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    let targetElement = event.target as HTMLElement;

    let isClickInsideEmojiPicker = targetElement.closest('.emoji-picker-dialog');
    let isClickInsideEmojiButton = targetElement.closest('.add-emojis');

    let isClickInsideAutocomplete = targetElement.closest('.autocomplete-list');
    let isClickInsideTextarea = targetElement.closest('#chat-message-input');

    if (!isClickInsideEmojiPicker && !isClickInsideEmojiButton) {this.showEmojiPicker = false;}
    if (!isClickInsideAutocomplete && !isClickInsideTextarea) {this.dropdownOpen = false;}
  }
}
