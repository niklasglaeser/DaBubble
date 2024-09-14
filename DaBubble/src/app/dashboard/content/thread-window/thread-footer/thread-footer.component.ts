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
    const textarea = document.getElementById('chat-message-input-thread') as HTMLTextAreaElement;
    const messageText = this.inputText;

    if (messageText.trim() || this.chatImg) {
      const message: Message = {message: messageText, senderId: '', imagePath: this.chatImg!, created_at: new Date(), updated_at: new Date(),};

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
    if (atPosition !== -1) {this.inputText = this.inputText.substring(0, atPosition) + `@${user.username}\n `;}
    this.filteredUsers = [];
    this.dropdownOpen = false;
    this.activeIndex = -1;
    this.hasSelectedUser = true;
  }

  selectChannel(channel: Channel): void {
    const hashPosition = this.inputText.lastIndexOf('#');
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
        const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
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
    const emoji = event.emoji.native;
    const textarea = document.getElementById('chat-message-input-thread') as HTMLTextAreaElement;
<<<<<<< HEAD
    if (textarea) {textarea.value += emoji;textarea.focus();}
=======
    if (textarea) {
      textarea.value += emoji + " ";
      textarea.focus();
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);
    }
>>>>>>> main
    this.showEmojiPicker = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;

    const isClickInsideEmojiPicker = targetElement.closest('.emoji-picker-dialog');
    const isClickInsideEmojiButton = targetElement.closest('.add-emojis');

    const isClickInsideAutocomplete = targetElement.closest('.autocomplete-list');
    const isClickInsideTextarea = targetElement.closest('#chat-message-input');

    if (!isClickInsideEmojiPicker && !isClickInsideEmojiButton) {this.showEmojiPicker = false;}
    if (!isClickInsideAutocomplete && !isClickInsideTextarea) {this.dropdownOpen = false;}
  }
}

// sendMessage(): void {
//   console.log('Sende Nachricht'); // Überprüfung, ob Methode aufgerufen wird

//   const textarea = document.getElementById(
//     'chat-message-input-thread'
//   ) as HTMLTextAreaElement;

//   if (!textarea) {
//     console.error('Textarea nicht gefunden');
//     return;
//   }

//   const messageText = textarea.value;
//   console.log('Textarea-Inhalt:', messageText); // Logge den Inhalt des Textareas

//   const currentUser = this.authService.currentUserSig();

//   if (messageText.trim()) {
//     const newMessage: Message = {
//       message: messageText,
//       senderId: currentUser?.userId || 'Unknown User',
//       created_at: new Date(),
//       updated_at: new Date(),
//     };

//     console.log('threadmessage ' + messageText); // Überprüfung, ob Nachricht erstellt wird

//     // Hole die aktuelle ausgewählte Nachricht und Thread-Informationen aus dem Service
//     const selectedThread =
//       this.threadService.selectedMessageSource.getValue();

//     if (selectedThread) {
//       this.threadService
//         .addThreadMessage(
//           selectedThread.channelId,
//           selectedThread.messageId,
//           newMessage
//         )
//         .then(() => {
//           console.log('Nachricht erfolgreich zum Thread hinzugefügt.');
//           textarea.value = '';
//         })
//         .catch((error) => {
//           console.error(
//             'Fehler beim Senden der Nachricht zum Thread:',
//             error
//           );
//         });
//     } else {
//       console.error('Kein Thread ausgewählt.');
//     }
//   } else {
//     console.log('Leere Nachricht, wird nicht gesendet.');
//   }
// }
