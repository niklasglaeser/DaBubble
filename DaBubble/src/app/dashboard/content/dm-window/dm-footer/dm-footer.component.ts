import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Output, ViewChild, inject } from '@angular/core';
import { Message } from '../../../../models/message.model';
import { DirectMessagesService } from '../../../../services/direct-message.service';
import { Observable, Subscription } from 'rxjs';
import { UserLogged } from '../../../../models/user-logged.model';
import { UserLoggedService } from '../../../../services/lp-services/user-logged.service';
import { UploadService } from '../../../../services/lp-services/upload.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiCategory, EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Channel } from '../../../../models/channel.class';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MessageService } from '../../../../services/message.service';
import { AuthService } from '../../../../services/lp-services/auth.service';


@Component({
  selector: 'app-dm-footer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatAutocompleteModule, MatAutocompleteTrigger, MatIconModule, PickerComponent, EmojiComponent, FormsModule],
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
  showEmojiPicker: boolean = false

  constructor(private dmService: DirectMessagesService, private authService: AuthService, private messageService: MessageService, private sanitizer: DomSanitizer,) {
    this.recipientUser$ = this.dmService.recipientUser$;
    this.currentUserId = this.authService.uid;
  }

  ngOnInit() {
    this.conversationIdSubscription = this.dmService.conversationId$.subscribe(id => {if (id) { this.conversationId = id; }});
  }

  ngOnDestroy(): void {
    if (this.conversationIdSubscription) {this.conversationIdSubscription.unsubscribe();}
    if (this.userSubscription) {this.userSubscription.unsubscribe();}
  }

  sendMessage(): void {
    let textarea = document.getElementById('dm-message-input') as HTMLTextAreaElement;
    let messageText = this.inputText;

    if (messageText || this.chatImg) {
      let message: Message = {message: messageText, senderId: '', imagePath: this.chatImg!, created_at: new Date(),};
      this.dmService.addMessage(message).then(() => { this.inputText = ''; this.chatImg = null; textarea.value = ''; });
      this.messageSent.emit();
    }
  }

  openAutocomplete(): void {
    let textarea = document.getElementById('dm-message-input') as HTMLTextAreaElement;
    this.inputText += '@';
    textarea.focus();
    this.messageService.searchUsers('').subscribe((users) => { this.filteredUsers = users; this.dropdownOpen = true; this.activeIndex = 0;});
  }

  onInput(event: any): void {
    let inputValue = this.inputText;

    if (this.hasSelectedUser) {this.hasSelectedUser = false; return;}
    if (inputValue.includes('@')) {
      let query = inputValue.split('@').pop()?.trim() || '';
      if (query === '' || this.dropdownOpen) { this.messageService.searchUsers(query).subscribe((users) => { this.filteredUsers = users; this.dropdownOpen = true; this.activeIndex = 0;});}
    } else if (inputValue.includes('#')) {
      let query = inputValue.split('#').pop()?.trim() || '';
      if (query === '' || this.dropdownOpen) { this.messageService.searchUserChannels(this.currentUserId, query).subscribe((channels) => { this.filteredChannels = channels; this.dropdownOpen = true; this.activeIndex = 0;});}
    } else { this.filteredUsers = []; this.filteredChannels = []; this.dropdownOpen = false; this.activeIndex = -1; }
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
      if (this.dropdownOpen) { this.selectSuggestion(); event.preventDefault();} 
      else {this.sendMessage();}
    }
    if (event.key === 'ArrowDown') {this.moveDown(event);}
    if (event.key === 'ArrowUp') {this.moveUp(event);}
  }

  handleEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.dropdownOpen) { this.selectSuggestion(); event.preventDefault();}
  }

  scrollToActiveItem(): void {
    let activeElement = document.querySelector('.autocomplete-list li.active') as HTMLElement;
    let container = document.querySelector('.autocomplete-list') as HTMLElement;

    if (activeElement && container) {
      let containerRect = container.getBoundingClientRect();
      let activeElementRect = activeElement.getBoundingClientRect();
      const containerBottom = container.scrollTop + container.clientHeight;
      if (activeElementRect.bottom > containerBottom) { const scrollAmount = activeElementRect.bottom - containerRect.bottom; container.scrollTop += scrollAmount + 60;}
      if (activeElementRect.top < containerRect.top) {const scrollAmount = containerRect.top - activeElementRect.top; container.scrollTop -= scrollAmount + 0;}
      if (container.scrollTop < 0) {container.scrollTop = 0;}
      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight;
      if (isAtBottom) { container.scrollTop = container.scrollHeight - container.clientHeight;}
    }
  }

  toggleEmojiPicker(event: MouseEvent) {
    event.stopPropagation();
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    let emoji = event.emoji.native;
    let textarea = document.getElementById('dm-message-input') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value += emoji + " ";
      textarea.focus();
      const event = new Event('input', { bubbles: true });
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


  uploadImage(event: Event) {
    let input = event.target as HTMLInputElement;
    let file = input.files?.[0];
    if (!file) return;

    this.isPdf = file.type === 'application/pdf';
    let currentUser = this.authService.currentUserSig();
    if (!currentUser) return;

    this.imgUploadService.uploadImgChat(currentUser.userId, file, this.conversationId).subscribe({next: (imagePath: string) => this.handleUploadSuccess(imagePath), error: (err: any) => this.handleUploadError(err)});
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
        next: () => { this.chatImg = null; this.safePath = null; this.isPdf = false;
          let fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
          if (fileInput) {fileInput.value = '';}
        },
        error: (err: any) => {console.error('Fehler beim Löschen der Datei:', err);}
      });
    }
  }

}
