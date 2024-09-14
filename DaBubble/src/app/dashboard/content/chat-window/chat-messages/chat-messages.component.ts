import {Component, Input, OnInit, OnDestroy, SimpleChanges, inject, HostListener, ViewChild, ElementRef,} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Message } from '../../../../models/message.model';
import { Observable, Subscription } from 'rxjs';
import { UserLogged } from '../../../../models/user-logged.model';
import { ThreadService } from '../../../../services/thread.service';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../../../services/message.service';
import { Reaction } from '../../../../models/reaction.model';
import { UserService } from '../../../../services/user.service';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogChatImgComponent } from '../../../../dialog/dialog-chat-img/dialog-chat-img.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiService } from '../../../../services/emoji.service';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { GlobalService } from '../../../../services/global.service';


@Component({
  selector: 'app-chat-messages',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, MatTooltipModule, MatDialogModule, PickerComponent, EmojiComponent, MatIconModule],
  templateUrl: './chat-messages.component.html',
  styleUrls: ['./chat-messages.component.scss'],
  providers: [DatePipe],
})
export class ChatMessagesComponent implements OnInit, OnDestroy {
  @Input() messages$: Observable<Message[]> | undefined;
  @Input() currentUser: UserLogged | null = null;
  @Input() channelId: string = '';
  @Input() threadCounts: Map<string, number> = new Map<string, number>();
  @Input() lastThreadMessageTimes: Map<string, Date | null> = new Map<string, Date | null>();
  @ViewChild('tooltip') tooltip!: MatTooltip;
  @ViewChild('descriptionTextarea') descriptionTextarea!: ElementRef<HTMLTextAreaElement>;


  dialog = inject(MatDialog);

  selectedMessage: Message | null = null;
  editMessageClicked: boolean = false;
  editMessageText: string = '';
  isMessageEmpty: boolean = false;
  isPdf: boolean = false

  emojiPickerMessageId: string | undefined = undefined;
  showTooltip: boolean = false;

  private userSubscription: Subscription | undefined;

  constructor(
    private datePipe: DatePipe,
    private threadService: ThreadService,
    private messageService: MessageService,
    private userService: UserService,
    private emojiService: EmojiService,
    private sanitizer: DomSanitizer,
    private globalService: GlobalService
  ) { }


  ngOnInit(): void { }

  checkPdf(message: Message): boolean {
    if (message.imagePath) {
      let cleanUrl = message.imagePath.split('?')[0];
      let fileExtension = cleanUrl.split('.').pop()?.toLowerCase();
      this.isPdf = fileExtension === 'pdf';
    } else {
      this.isPdf = false;
    }
    return this.isPdf;
  }

  formatMessage(message: string): string {
    return message.replace(/\n/g, '<br>');
  }

  transform(message: Message): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(message.imagePath!);
  }

  openPdf(message: Message) {
    window.open(message.imagePath, '_blank');
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {this.userSubscription.unsubscribe();}
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channelId'] && !changes['channelId'].isFirstChange()) {this.closeEditMode();}
  }

  editMessage(message: Message) {
    if (this.currentUser && message.senderId === this.currentUser.uid) {
      this.editMessageClicked = true;
      this.editMessageText = message.message;
      this.selectedMessage = message;
      setTimeout(() => {
        if (this.editMessageText) {this.adjustHeightDirectly(this.descriptionTextarea.nativeElement);}
      }, 0);
    }
  }

  async saveEditedMessage() {
    if (this.selectedMessage) {
      if (!this.editMessageText.trim()) {this.isMessageEmpty = true; return;}
      try {
        this.selectedMessage.message = this.editMessageText;
        await this.messageService.updateMessage(this.channelId, this.selectedMessage.id!, this.editMessageText);
        this.editMessageClicked = false;
        this.isMessageEmpty = false;
        this.selectedMessage = null;
        this.editMessageText = '';
      } catch (e) {console.error('Error saving message:', e);}
    }
  }

  deleteMessage() {
    let selectedMessageId = this.selectedMessage?.id
    this.messageService.deleteMessage(this.channelId!, selectedMessageId!)
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
    let date = new Date(timestamp);
    return this.datePipe.transform(date, 'HH:mm') || '';
  }

  formatDate(timestamp: Date): string {
    let date = new Date(timestamp);
    let today = new Date();
    let isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();

    if (isToday) {return 'Heute';}
    else {return this.datePipe.transform(date, 'EEEE, dd. MMMM yyyy') || '';}
  }

  getReplayCount(messageId: string): boolean {
    const count = this.threadCounts.get(messageId);
    return count !== undefined && count > 0;
  }

  getAnswerTime(messageId: string): Date | null {
    return this.lastThreadMessageTimes.get(messageId) || null;
  }

  openThread(channelId: string, messageId: string, originMessage: Message) {
    this.threadService.checkAndCreateThread(channelId, messageId, originMessage);
    this.globalService.isThread(true);
    let currentThreadStatus = this.globalService.getThreadStatus();
  }

  openImg(message: Message) {
    this.dialog.open(DialogChatImgComponent, {data: { imagePath: message.imagePath }});
  }

  async toggleReaction(message: Message, emoji: string) {
    const userId = this.currentUser?.uid!;
    const username = this.currentUser?.username!;

    try {await this.emojiService.toggleReaction(this.channelId, message.id!, emoji, userId, username);}
    catch (error) {console.error('Fehler beim Aktualisieren der Reaktion:', error);}
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
    event.target.style.height = event.target.scrollHeight + 'px';
  }

  adjustHeightDirectly(textarea: HTMLTextAreaElement) {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    let target = event.target as HTMLElement;
    let isClickInside = target.closest('.emoji-picker-dialog');
    if (!isClickInside && this.emojiPickerMessageId) {this.emojiPickerMessageId = undefined;}
  }
}

