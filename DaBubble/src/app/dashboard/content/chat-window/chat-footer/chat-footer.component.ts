import { Component, EventEmitter, HostListener, inject, Input, ViewChild } from '@angular/core';
import { MessageService } from '../../../../services/message.service';
import { Message } from '../../../../models/message.model';
import { Channel } from '../../../../models/channel.class';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserLogged } from '../../../../models/user-logged.model';
import { AuthService } from '../../../../services/lp-services/auth.service';
import { UserLoggedService } from '../../../../services/lp-services/user-logged.service';
import { UploadService } from '../../../../services/lp-services/upload.service';
import { MatIconModule } from '@angular/material/icon';

import { DomSanitizer } from '@angular/platform-browser';

import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { Output } from '@angular/core';

@Component({
  selector: 'app-chat-footer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatAutocompleteModule, MatAutocompleteTrigger, MatIconModule, PickerComponent, EmojiComponent, FormsModule],
  templateUrl: './chat-footer.component.html',
  styleUrls: ['./chat-footer.component.scss']
})
export class ChatFooterComponent {
  @Output() messageSent = new EventEmitter<void>();
  @Input() channel: Channel | null = null;

  userService = inject(UserLoggedService);
  imgUploadService = inject(UploadService);
  currentUserId: string = '';

  chatImg: string | null = null;
  uploadError: string | null = null;
  isPdf: boolean = false;
  safePath: string | null = null;

  inputText: string = '';
  filteredUsers: UserLogged[] = [];
  filteredChannels: Channel[] = [];
  activeIndex: number = -1;
  dropdownOpen: boolean = false;
  hasSelectedUser: boolean = false;

  symbolSearch = new FormControl();
  selectedNameToInsert: string = '';
  filteredUserOptions$: Observable<UserLogged[]> | null = null;
  filteredChannelOptions$: Observable<Channel[]> | null = null;
  inputValue: string = '';
  isPanelOpen = false;
  showEmojiPicker: boolean = false;

  constructor(private messageService: MessageService, private authService: AuthService, private sanitizer: DomSanitizer) {
    this.currentUserId = this.authService.uid;
  }

  sendMessage(): void {
    let textarea = document.getElementById('chat-message-input') as HTMLTextAreaElement;
    let messageText = this.inputText;

    if (messageText.trim() || this.chatImg) {
      const message: Message = {
        photoURL: '',
        message: messageText || '',
        senderId: '',
        // senderName: '',
        imagePath: this.chatImg!,
        created_at: new Date(),
        updated_at: new Date()
      };
      let channelId = this.channel?.id;

      if (channelId) {
        // Ensure channelId is a valid string
        this.messageService.addMessage(channelId, message).then(() => {
          this.inputText = '';
          this.chatImg = null;
          textarea.value = '';
        });
      } else {
        console.error('Channel ID is undefined.');
      }
    }
    this.messageSent.emit();
  }

  openAutocomplete(): void {
    let textarea = document.getElementById('chat-message-input') as HTMLTextAreaElement;
    this.inputText += '@';
    textarea.focus();

    this.messageService.searchUsers('').subscribe((users) => {
      this.filteredUsers = users;
      this.dropdownOpen = true;
    });
  }

  onInput(event: any): void {
    const inputValue = this.inputText;

    if (this.hasSelectedUser) {
      this.hasSelectedUser = false;
      return;
    }

    if (inputValue.includes('@')) {
      const query = inputValue.split('@').pop()?.trim() || '';
      if (query === '' || this.dropdownOpen) {
        this.messageService.searchUsers(query).subscribe((users) => {
          this.filteredUsers = users;
          this.dropdownOpen = true;
          this.activeIndex = 0;
        });
      }
    } else if (inputValue.includes('#')) {
      const query = inputValue.split('#').pop()?.trim() || '';
      if (query === '' || this.dropdownOpen) {
        this.messageService.searchUserChannels(this.currentUserId, query).subscribe((channels) => {
          this.filteredChannels = channels;
          this.dropdownOpen = true;
          this.activeIndex = 0;
        });
      }
    } else {
      this.filteredUsers = [];
      this.filteredChannels = [];
      this.dropdownOpen = false;
      this.activeIndex = -1;
    }
  }

  selectUser(user: UserLogged): void {
    const atPosition = this.inputText.lastIndexOf('@');
    if (atPosition !== -1) {
      this.inputText = this.inputText.substring(0, atPosition) + `@${user.username}\n `;
    }
    this.filteredUsers = [];
    this.dropdownOpen = false;
    this.activeIndex = -1;
    this.hasSelectedUser = true;
  }

  selectChannel(channel: Channel): void {
    const hashPosition = this.inputText.lastIndexOf('#');
    if (hashPosition !== -1) {
      this.inputText = this.inputText.substring(0, hashPosition) + `#${channel.name}\n `;
    }
    this.filteredChannels = [];
    this.dropdownOpen = false;
    this.activeIndex = -1;
    this.hasSelectedUser = true;
  }

  moveDown(event: KeyboardEvent): void {
    if (this.dropdownOpen) {
      if (this.filteredUsers.length > 0 && this.activeIndex < this.filteredUsers.length - 1) {
        this.activeIndex++;
      } else if (this.filteredChannels.length > 0 && this.activeIndex < this.filteredChannels.length - 1) {
        this.activeIndex++;
      }
      event.preventDefault();
      this.scrollToActiveItem();
    }
  }

  moveUp(event: KeyboardEvent): void {
    if (this.dropdownOpen) {
      if (this.filteredUsers.length > 0 && this.activeIndex > 0) {
        this.activeIndex--;
      } else if (this.filteredChannels.length > 0 && this.activeIndex > 0) {
        this.activeIndex--;
      }
      event.preventDefault();
      this.scrollToActiveItem();
    }
  }

  selectSuggestion(): void {
    if (this.filteredUsers.length > 0 && this.activeIndex >= 0) {
      this.selectUser(this.filteredUsers[this.activeIndex]);
    } else if (this.filteredChannels.length > 0 && this.activeIndex >= 0) {
      this.selectChannel(this.filteredChannels[this.activeIndex]);
    }
    this.dropdownOpen = false;
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (this.dropdownOpen) {
        this.selectSuggestion();
        event.preventDefault();
      } else {
        this.sendMessage();
      }
    }

    if (event.key === 'ArrowDown') {
      this.moveDown(event);
    }

    if (event.key === 'ArrowUp') {
      this.moveUp(event);
    }
  }

  handleEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.dropdownOpen) {
      this.selectSuggestion();
      event.preventDefault();
    }
  }

  scrollToActiveItem(): void {
    const activeElement = document.querySelector('.autocomplete-list li.active') as HTMLElement;
    const container = document.querySelector('.autocomplete-list') as HTMLElement;

    if (activeElement && container) {
      const containerRect = container.getBoundingClientRect();
      const activeElementRect = activeElement.getBoundingClientRect();

      const containerTop = container.scrollTop;
      const containerBottom = container.scrollTop + container.clientHeight;

      if (activeElementRect.bottom > containerBottom) {
        const scrollAmount = activeElementRect.bottom - containerRect.bottom;
        container.scrollTop += scrollAmount + 60;
      }

      if (activeElementRect.top < containerRect.top) {
        const scrollAmount = containerRect.top - activeElementRect.top;
        container.scrollTop -= scrollAmount + 0;
      }

      if (container.scrollTop < 0) {
        container.scrollTop = 0;
      }

      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight;
      if (isAtBottom) {
        container.scrollTop = container.scrollHeight - container.clientHeight;
      }
    }
  }

  uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isPdf = file.type === 'application/pdf';
    const currentUser = this.authService.currentUserSig();
    if (!currentUser) return;

    this.imgUploadService.uploadImgChat(currentUser.userId, file, this.channel?.id).subscribe({
      next: (imagePath: string) => this.handleUploadSuccess(imagePath),
      error: (err: any) => this.handleUploadError(err)
    });

    input.value = '';
  }

  handleUploadSuccess(imagePath: string) {
    this.chatImg = imagePath;
    this.safePath = this.isPdf ? (this.sanitizer.bypassSecurityTrustResourceUrl(imagePath) as string) : null;
  }

  handleUploadError(err: any) {
    this.uploadError = err.message || 'Fehler beim Hochladen des Bildes.';
    this.chatImg = this.safePath = null;
    this.isPdf = false;
    setTimeout(() => (this.uploadError = null), 3000);
  }

  triggerFileUpload(inputElement: HTMLInputElement) {
    inputElement.click();
  }

  deleteImg() {
    if (this.chatImg) {
      this.imgUploadService.deleteImgChat(this.chatImg).subscribe({
        next: () => {
          this.chatImg = null;
          this.safePath = null;
          this.isPdf = false;

          const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
        },
        error: (err: any) => {
          console.error('Fehler beim Löschen der Datei:', err);
        }
      });
    }
  }

  toggleEmojiPicker(event: MouseEvent) {
    event.stopPropagation();
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native;
    const textarea = document.getElementById('chat-message-input') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value += emoji;
      textarea.focus();
    }
    this.showEmojiPicker = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;

    const isClickInsideEmojiPicker = targetElement.closest('.emoji-picker-dialog');
    const isClickInsideEmojiButton = targetElement.closest('.add-emojis');

    const isClickInsideAutocomplete = targetElement.closest('.autocomplete-list');
    const isClickInsideTextarea = targetElement.closest('#chat-message-input');

    if (!isClickInsideEmojiPicker && !isClickInsideEmojiButton) {
      this.showEmojiPicker = false;
    }

    if (!isClickInsideAutocomplete && !isClickInsideTextarea) {
      this.dropdownOpen = false;
    }
  }

  // @HostListener('keyup.enter', ['$event'])
  // onEnter(event: KeyboardEvent): void {
  //   this.sendMessage();
  // }
}
