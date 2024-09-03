import { Component, HostListener, Input, SimpleChanges } from '@angular/core';
import { Message } from '../../../../models/message.model';
import { CommonModule, DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { MessageService } from '../../../../services/message.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmojiService } from '../../../../services/emoji.service';
import { AuthService } from '../../../../services/lp-services/auth.service';
import { Reaction } from '../../../../models/reaction.model';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { UserLogged } from '../../../../models/user-logged.model';

@Component({
  selector: 'app-thread-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule, MatDialogModule, PickerComponent, ReactiveFormsModule],
  templateUrl: './thread-messages.component.html',
  styleUrl: './thread-messages.component.scss',
  providers: [DatePipe],
})
export class ThreadMessagesComponent {
  @Input() originMessage: Message | null = null;
  @Input() threadMessages$: Observable<Message[]> | undefined;
  @Input() threadMessageCount$: Observable<number> | undefined;
  @Input() currentUserId: string | null = null;
  @Input() currentUser: UserLogged | null = null;
  @Input() channelId: string = '';

  selectedMessage: Message | null = null;
  editMessageClicked: boolean = false;
  editMessageText: string = '';
  isMessageEmpty: boolean = false;

  emojiPickerMessageId: string | undefined = undefined;
  showTooltip: boolean = false;
  threadId: string = '';

  constructor(
    private datePipe: DatePipe,
    private messageService: MessageService,
    private emojiService: EmojiService,
    private authService: AuthService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channelId'] && !changes['channelId'].isFirstChange()) {
      this.closeEditMode();
    }
  }

  editMessage(message: Message) {
    if (message.senderId === this.currentUserId) {
      this.editMessageClicked = true;
      this.editMessageText = message.message;
      this.selectedMessage = message;
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
        await this.messageService.updateMessage(
          this.channelId,
          this.selectedMessage.id!,
          this.editMessageText
        );
        this.editMessageClicked = false;
        this.isMessageEmpty = false;
        this.selectedMessage = null;
        this.editMessageText = '';
      } catch (e) {
        console.error('Error saving message:', e);
      }
    }
  }

  cancelEdit() {
    this.closeEditMode();
    this.isMessageEmpty = false;
  }

  closeEditMode() {
    this.editMessageClicked = false;
    this.selectedMessage = null;
    this.editMessageText = '';
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

  async toggleReactionOriginalMessage(message: Message, emoji: string) {
    const currentUser = this.authService.currentUserSig();
    const userId = this.currentUserId!;
    const username = currentUser?.username || '';
    try {
      await this.emojiService.toggleReaction(this.channelId, message.id!, emoji, userId, username);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Reaktion:', error);
    }
  }

  async toggleReaction(message: Message, emoji: string) {
    const currentUser = this.authService.currentUserSig();
    const userId = this.currentUserId!;
    const username = currentUser?.username || '';
    const threadId = message.id
    const messageId = this.originMessage?.id!;
    try {
      await this.emojiService.toggleReactionThread(this.channelId, messageId, emoji, userId, username, threadId!);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Reaktion:', error);
    }
  }

  addEmojiOriginMessage(event: any, message: Message) {
    const emoji = event.emoji.native;
    this.toggleReactionOriginalMessage(message, emoji);
    this.emojiPickerMessageId = undefined;
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isClickInside = target.closest('.emoji-picker-dialog');

    if (!isClickInside && this.emojiPickerMessageId) {
      this.emojiPickerMessageId = undefined;
    }
  }
}
