import { AfterViewChecked, AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { DmHeaderComponent } from './dm-header/dm-header.component';
import { DmMessagesComponent } from './dm-messages/dm-messages.component';
import { DmFooterComponent } from './dm-footer/dm-footer.component';
import { CommonModule } from '@angular/common';
import { DirectMessagesService } from '../../../services/direct-message.service';
import { Observable } from 'rxjs';
import { Message } from '../../../models/message.model';

@Component({
  selector: 'app-dm-window',
  standalone: true,
  imports: [DmHeaderComponent, DmMessagesComponent, DmFooterComponent, CommonModule],
  templateUrl: './dm-window.component.html',
  styleUrl: './dm-window.component.scss'
})
export class DmWindowComponent {
  messages$: Observable<Message[]> | null = null;
  private previousMessageCount: number = 0;

  @ViewChild('dmMessages') dmMessages!: ElementRef;

  constructor(private dmService: DirectMessagesService) { }

  loadMessages(): void {
    this.messages$ = this.dmService.loadConversation();
    this.messages$.subscribe((messages) => {
      const newMessageCount = messages.length;

      // Check if a new message has been added since the last update
      if (newMessageCount > this.previousMessageCount) {
        setTimeout(() => {
          this.scrollToBottom();
        }, 500);
      }
      // Update the previous message count for future comparisons
      this.previousMessageCount = newMessageCount;
    });
  }

  scrollToBottom(): void {
    if (this.dmMessages && this.dmMessages.nativeElement) {
      this.dmMessages.nativeElement.scrollTop = this.dmMessages.nativeElement.scrollHeight;
    } else {
      console.log('dmMessages or nativeElement is not defined');
    }
  }

  onMessageSent(): void {
    this.scrollToBottom();
  }
}