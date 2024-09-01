import { Component, inject, Input, ViewChild } from '@angular/core';
import { MessageService } from '../../../../services/message.service';
import { Message } from '../../../../models/message.model';
import { Channel } from '../../../../models/channel.class';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserLogged } from '../../../../models/user-logged.model';
import { AuthService } from '../../../../services/lp-services/auth.service';
import { UserLoggedService } from '../../../../services/lp-services/user-logged.service';
import { UploadService } from '../../../../services/lp-services/upload.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chat-footer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatAutocompleteModule, MatAutocompleteTrigger,MatIconModule],
  templateUrl: './chat-footer.component.html',
  styleUrls: ['./chat-footer.component.scss'],
})
export class ChatFooterComponent {
  @Input() channel: Channel | null = null;
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;
  userService = inject(UserLoggedService);
  imgUploadService = inject(UploadService);
  currentUserId: string = '';
  chatImg: string | null = null; 

  symbolSearch = new FormControl();
  filteredUserOptions$: Observable<UserLogged[]> | null = null;
  filteredChannelOptions$: Observable<Channel[]> | null = null;
  inputValue: string = '';
  isPanelOpen = false;

  constructor(private messageService: MessageService, private authService: AuthService) {
    this.currentUserId = this.authService.uid;
  }

  sendMessage(): void {
    const textarea = document.getElementById(
      'chat-message-input'
    ) as HTMLTextAreaElement;
    const messageText = textarea.value;

    if (messageText.trim() || this.chatImg) {
      const message: Message = {
        photoURL: '',
        message: messageText || '',
        senderId: '',
        // senderName: '',
        imagePath: this.chatImg! ,
        created_at: new Date(),
        updated_at: new Date(),
        
      };

      const channelId = this.channel?.id;

      if (channelId) {
        // Ensure channelId is a valid string
        this.messageService.addMessage(channelId, message).then(() => {
          textarea.value = '';
          this.chatImg = null
        });
      } else {
        console.error('Channel ID is undefined.');
      }
    }
  }

  onInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.inputValue = input;

    if (input.startsWith('@')) {
      this.filteredUserOptions$ = this.messageService.searchUsers(input.slice(1));
      this.filteredChannelOptions$ = null;
    } else if (input.startsWith('#')) {
      this.filteredChannelOptions$ = this.messageService.searchUserChannels(this.currentUserId, input.slice(1));
      this.filteredUserOptions$ = null;
    } else {
      this.filteredUserOptions$ = null;
      this.filteredChannelOptions$ = null;
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

  uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      const currentUser = this.authService.currentUserSig();
      if (currentUser) {
        this.imgUploadService.uploadImgChat(currentUser.userId,file,this.channel?.id).pipe(
        ).subscribe({
          next: (photoURL: string) => {
            this.chatImg = photoURL;
            console.log('Bild erfolgreich hochgeladen:', photoURL);
          },
          error: (err: any) => {
            console.error('Fehler beim Hochladen des Bildes:', err);
          }
        });
      }
    }
  }

  triggerFileUpload(inputElement: HTMLInputElement) {
    inputElement.click();
  }

  deleteImg(){
    this.imgUploadService.deleteImgChat(this.chatImg!)
    this.chatImg = null
  }

}
