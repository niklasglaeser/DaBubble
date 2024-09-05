import { CommonModule } from '@angular/common';

import { Component, EventEmitter, HostListener, Output, ViewChild , inject} from '@angular/core';
import { Message } from '../../../../models/message.model';
import { DirectMessagesService } from '../../../../services/direct-message.service';
import { Observable, Subscription } from 'rxjs';
import { UserLogged } from '../../../../models/user-logged.model';
import { UserLoggedService } from '../../../../services/lp-services/user-logged.service';
import { UploadService } from '../../../../services/lp-services/upload.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Channel } from '../../../../models/channel.class';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MessageService } from '../../../../services/message.service';
import { AuthService } from '../../../../services/lp-services/auth.service';


@Component({
  selector: 'app-dm-footer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatAutocompleteModule, MatAutocompleteTrigger, MatIconModule, PickerComponent, EmojiComponent],
  templateUrl: './dm-footer.component.html',
  styleUrl: './dm-footer.component.scss'
})
export class DmFooterComponent {
  userService = inject(UserLoggedService);
  imgUploadService = inject(UploadService);
  currentUserId: string = '';
  recipientUser$: Observable<UserLogged | null>;
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;


  chatImg: string | null = null; 
  uploadError: string | null = null;
  isPdf: boolean = false;
  safePath: string | null = null; 

  private userSubscription: Subscription | undefined;
  private conversationIdSubscription: Subscription | undefined;
  conversationId: string | undefined;

  @Output() messageSent = new EventEmitter<void>();

  symbolSearch = new FormControl();
  selectedNameToInsert: string = '';
  filteredUserOptions$: Observable<UserLogged[]> | null = null;
  filteredChannelOptions$: Observable<Channel[]> | null = null;
  inputValue: string = '';
  isPanelOpen = false;
  showEmojiPicker: boolean = false

  constructor(private dmService: DirectMessagesService, private authService: AuthService, private messageService: MessageService, private sanitizer: DomSanitizer,) {
    this.recipientUser$ = this.dmService.recipientUser$;
    this.currentUserId = this.authService.uid;

  }
  
  ngOnInit() {
    // Abonniere das Observable für conversationId
    this.conversationIdSubscription = this.dmService.conversationId$.subscribe(id => {
      if (id) {this.conversationId = id;}
    });

  }

  ngOnDestroy(): void {
    if (this.conversationIdSubscription) {
      this.conversationIdSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

  }

  

  sendMessage(): void {
    const textarea = document.getElementById('dm-message-input') as HTMLTextAreaElement;
    const messageText = textarea.value;


    if (messageText || this.chatImg) {

      const message: Message = {
        message: messageText,
        senderId: '',
        imagePath: this.chatImg!,
        created_at: new Date(),
      };

      this.dmService.addMessage(message).then(() => {
        textarea.value = '';
        this.chatImg = null
      });

      console.log('send');
    
      this.messageSent.emit();
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

  toggleEmojiPicker(event: MouseEvent) {
    event.stopPropagation();
    if (this.autocompleteTrigger && this.autocompleteTrigger.panelOpen) {
      this.autocompleteTrigger.closePanel();
    }

    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native;

    const textarea = document.getElementById('dm-message-input') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value += emoji;
      textarea.focus();
    }

    this.showEmojiPicker = false;

    if (this.autocompleteTrigger) {
      this.autocompleteTrigger.closePanel();
    }
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

  openUserAutocomplete(): void {
    this.symbolSearch.setValue('@');
    this.filteredUserOptions$ = this.messageService.searchUsers('');
    setTimeout(() => {
      this.autocompleteTrigger.openPanel();
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isClickInside = target.closest('.emoji-picker-dialog') || target.closest('.add-emojis');
    if (!isClickInside && this.showEmojiPicker) {
      this.showEmojiPicker = false;

    }
  }

  @HostListener('keyup.enter', ['$event'])
  onEnter(event: KeyboardEvent): void {
    this.sendMessage();
  }

  uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.isPdf = file.type === 'application/pdf';

      const currentUser = this.authService.currentUserSig();
      if (currentUser) {
        this.imgUploadService.uploadImgChat(currentUser.userId, file, this.conversationId).pipe(
        ).subscribe({
          next: (imagePath: string) => {
            this.chatImg = imagePath;
            this.safePath = this.isPdf ? this.sanitizer.bypassSecurityTrustResourceUrl(imagePath) as string : null
            this.uploadError = null;
          },
          error: (err: any) => {
            this.uploadError = err.message || 'Fehler beim Hochladen des Bildes.';
            this.chatImg = null;
            this.safePath = null;
            this.isPdf = false;

            setTimeout(() => {
              this.uploadError = null;
            }, 3000);
          }
        });
      }
    }
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

}
