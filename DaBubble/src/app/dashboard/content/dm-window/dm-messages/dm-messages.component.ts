import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, inject, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DirectMessagesService } from '../../../../services/direct-message.service';
import { Message } from '../../../../models/message.model';
import { AuthService } from '../../../../services/lp-services/auth.service';
import { Observable, Subscription } from 'rxjs';
import { UserLogged } from '../../../../models/user-logged.model';
import { EmojiService } from '../../../../services/emoji.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { Reaction } from '../../../../models/reaction.model';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { DialogChatImgComponent } from '../../../../dialog/dialog-chat-img/dialog-chat-img.component';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-dm-messages',
  standalone: true,
  imports: [CommonModule, EmojiComponent, PickerComponent, FormsModule],
  templateUrl: './dm-messages.component.html',
  styleUrl: './dm-messages.component.scss',
  providers: [DatePipe],
})
export class DmMessagesComponent implements OnInit, OnDestroy {
  @Input() messages: Message[] | null = null;
  @ViewChild('descriptionTextarea') descriptionTextarea!: ElementRef<HTMLTextAreaElement>;

  hasMessages$!: Observable<boolean>;
  recipientUser$!: Observable<UserLogged | null>;
  conversationId: string | undefined;

  currentUser: UserLogged | null = null;

  @ViewChild('tooltip') tooltip!: MatTooltip;

  dialog = inject(MatDialog);

  selectedMessage: Message | null = null;
  editMessageClicked: boolean = false;
  editMessageText: string = '';
  isMessageEmpty: boolean = false;

  emojiPickerMessageId: string | undefined = undefined;
  showTooltip: boolean = false;

  private userSubscription: Subscription | undefined;
  private conversationIdSubscription: Subscription | undefined;

  constructor(private dmService: DirectMessagesService, private authService: AuthService, private datePipe: DatePipe, private emojiService: EmojiService) {}

  get currentUserId(): string | undefined {
    return this.authService.currentUserSig()?.userId;
  }

  ngOnInit() {
    // Abonniere das Observable für conversationId
    this.conversationIdSubscription = this.dmService.conversationId$.subscribe(id => {
      if (id) { this.conversationId = id; }
    });

    this.userSubscription = this.dmService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Abonniere das Observable, um den Nachrichtenstatus zu überwachen
    this.hasMessages$ = this.dmService.hasMessages$;

    this.recipientUser$ = this.dmService.recipientUser$;
  }


  ngOnDestroy(): void {
    if (this.conversationIdSubscription) {
      this.conversationIdSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  formatTime(timestamp: Date): string {
    const date = new Date(timestamp);
    return this.datePipe.transform(date, 'HH:mm') || '';
  }

  formatDate(timestamp: Date): string {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return 'Heute';
    } else {
      return this.datePipe.transform(date, 'EEEE, dd. MMMM yyyy') || '';
    }
  }

  formatMessage(message: string): string {
    return message.replace(/\n/g, '<br>');
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['conversationId'] && !changes['conversationId'].isFirstChange()) {
      this.closeEditMode();
    }
  }


  editMessage(message: Message) {
    if (this.currentUser && message.senderId === this.currentUser.uid) {
      this.editMessageClicked = true;
      this.editMessageText = message.message;
      this.selectedMessage = message;
      setTimeout(() => {
        if (this.editMessageText) {
          this.adjustHeightDirectly(this.descriptionTextarea.nativeElement);
        }
      }, 0);
    }
  }

  async saveEditedMessage() {
    if (this.selectedMessage) {
      if (!this.editMessageText.trim()) {
        this.isMessageEmpty = true;
        return;
      }
      try {
        this.selectedMessage.message = this.editMessageText;
        await this.dmService.updateMessage(this.conversationId!, this.selectedMessage.id!, this.editMessageText);
        this.editMessageClicked = false;
        this.isMessageEmpty = false;
        console.log('Message successfully saved.' + this.editMessageText);
        this.selectedMessage = null;
        this.editMessageText = '';
      } catch (e) {
        console.error('Error saving message:', e);
      }
    }
  }

  deleteMessage() {
    let selectedMessageId = this.selectedMessage?.id
    this.dmService.deleteMessage(this.conversationId!, selectedMessageId!)
  }


  cancelEdit() {
    this.closeEditMode();
  }

  closeEditMode() {
    this.editMessageClicked = false;
    this.selectedMessage = null;
    this.editMessageText = '';
  }


  openImg(message: Message) {
    this.dialog.open(DialogChatImgComponent, {
      data: { imagePath: message.imagePath }
    });
  }



  async toggleReaction(message: Message, emoji: string) {
    const userId = this.currentUser?.uid!;
    const username = this.currentUser?.username!;

    try {
      await this.emojiService.toggleReactionDM(this.conversationId!, message.id!, emoji, userId, username);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Reaktion:', error);
    }
  }

  addEmoji(event: any, message: Message) {
    const emoji = event.emoji.native;
    this.toggleReaction(message, emoji);
    this.emojiPickerMessageId = undefined;
  }

  toggleEmojiPicker(messageId: string | undefined, event: MouseEvent) {
    event.stopPropagation();
    this.emojiPickerMessageId = this.emojiPickerMessageId === messageId ? undefined : messageId;
  }

  toggleTooltip(show: boolean) {
    this.showTooltip = show;
  }

  isLastItem(array: string[], item: string): boolean {
    return array.indexOf(item) === array.length - 1;
  }

  getReactionText(reaction: Reaction): string {
    return this.emojiService.getReactionText(reaction, this.currentUser);
  }

  adjustHeight(event: any) {
    event.target.style.height = 'auto';
    event.target.style.width = '100%';
    event.target.style.height = event.target.scrollHeight + 'px';
  }

  adjustHeightDirectly(textarea: HTMLTextAreaElement) {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.width = '100%';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isClickInside = target.closest('.emoji-picker-dialog');

    if (!isClickInside && this.emojiPickerMessageId) {
      this.emojiPickerMessageId = undefined;
    }
  }






}
