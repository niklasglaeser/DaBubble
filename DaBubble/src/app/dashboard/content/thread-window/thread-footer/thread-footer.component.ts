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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { UserLoggedService } from '../../../../services/lp-services/user-logged.service';
import { UploadService } from '../../../../services/lp-services/upload.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-thread-footer',
  standalone: true,
  imports: [PickerComponent, EmojiComponent, CommonModule, ReactiveFormsModule, MatAutocompleteModule, MatAutocompleteTrigger, MatIconModule],
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

  showEmojiPicker: boolean = false

  chatImg: string | null = null; 
  uploadError: string | null = null;
  isPdf: boolean = false;
  safePath: string | null = null; 

  constructor(
    private threadService: ThreadService,
    private authService: AuthService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer,
  ) { this.currentUserId = this.authService.uid; }

  sendMessage(): void {
    const textarea = document.getElementById(
      'chat-message-input-thread'
    ) as HTMLTextAreaElement;
    const messageText = textarea.value;

    if (messageText.trim() || this.chatImg ) {
      const message: Message = {
        message: messageText,
        senderId: '',
        // senderName: '',
        imagePath: this.chatImg!,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // const channelId = this.channel?.id;

      if (this.channelId) {
        // Ensure channelId is a valid string
        this.messageService
          .addMessageThread(this.channelId, message, this.messageId)
          .then(() => {
            textarea.value = '';
            this.chatImg = null
          });
      } else {
        console.error('Channel ID is undefined.');
      }
    }
  }

  onInput(event: Event): void {
    let input = (event.target as HTMLInputElement).value;
    this.inputValue = input;

    if (this.showEmojiPicker) {
      if (this.autocompleteTrigger) {
        this.autocompleteTrigger.closePanel();
      }
      return;
    }
    if (input.startsWith('@')) {
      this.filteredUserOptions$ = this.messageService.searchUsers(input.slice(1));
      this.filteredChannelOptions$ = null;
      if (this.autocompleteTrigger) {
        this.autocompleteTrigger.openPanel();
      }
    } else if (input.startsWith('#')) {
      this.filteredChannelOptions$ = this.messageService.searchUserChannels(this.currentUserId, input.slice(1));
      this.filteredUserOptions$ = null;

      if (this.autocompleteTrigger) {
        this.autocompleteTrigger.openPanel();
      }
    } else {
      this.filteredUserOptions$ = null;
      this.filteredChannelOptions$ = null;
      if (this.autocompleteTrigger) {
        this.autocompleteTrigger.closePanel();
      }
    }
  }

  openUserAutocomplete(): void {
    this.symbolSearch.setValue('@');
    this.filteredUserOptions$ = this.messageService.searchUsers('');
    setTimeout(() => {
      this.autocompleteTrigger.openPanel();
    });
  }

  showSelectedName(value: any): string {
    if (value && typeof value === 'object') {
      if (value.username) {
        return `@${value.username}\n`;
      } else if (value.name) {
        return `#${value.name}\n`;
      }
    }
    return '';
  }

  uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
  
    this.isPdf = file.type === 'application/pdf';
    const currentUser = this.authService.currentUserSig();
    if (!currentUser) return;
  
    this.imgUploadService.uploadImgChat(currentUser.userId, file, this.channel?.id)
      .subscribe({
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
    if (this.autocompleteTrigger && this.autocompleteTrigger.panelOpen) {
      this.autocompleteTrigger.closePanel();
    }

    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native;

    const textarea = document.getElementById('chat-message-input-thread') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value += emoji;
      textarea.focus();
    }

    this.showEmojiPicker = false;

    if (this.autocompleteTrigger) {
      this.autocompleteTrigger.closePanel();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isClickInside = target.closest('.emoji-picker-dialog') || target.closest('.add-emojis');
    if (!isClickInside && this.showEmojiPicker) {
      this.showEmojiPicker = false;
    }
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
