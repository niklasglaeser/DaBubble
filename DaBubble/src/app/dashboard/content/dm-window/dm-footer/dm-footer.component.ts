import { CommonModule } from '@angular/common';
import { Component, HostListener, ViewChild } from '@angular/core';
import { Message } from '../../../../models/message.model';
import { DirectMessagesService } from '../../../../services/direct-message.service';
import { Observable } from 'rxjs';
import { UserLogged } from '../../../../models/user-logged.model';
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
  recipientUser$: Observable<UserLogged | null>;
  currentUserId: string = '';
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;


  symbolSearch = new FormControl();
  selectedNameToInsert: string = '';
  filteredUserOptions$: Observable<UserLogged[]> | null = null;
  filteredChannelOptions$: Observable<Channel[]> | null = null;
  inputValue: string = '';
  isPanelOpen = false;
  showEmojiPicker: boolean = false

  constructor(private dmService: DirectMessagesService, private authService: AuthService, private messageService: MessageService) {
    this.recipientUser$ = this.dmService.recipientUser$;
    this.currentUserId = this.authService.uid;
  }

  sendMessage(): void {
    const textarea = document.getElementById('dm-message-input') as HTMLTextAreaElement;
    const messageText = textarea.value;

    if (messageText) {
      const message: Message = {
        message: messageText,
        senderId: '',
        created_at: new Date(),
      };

      this.dmService.addMessage(message).then(() => {
        textarea.value = '';
      });
      console.log('send');
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

}
