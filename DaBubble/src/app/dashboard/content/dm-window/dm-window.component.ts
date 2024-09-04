import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
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

  @ViewChild('dmMessages') dmMessages!: ElementRef;

  constructor(private dmService: DirectMessagesService) { }

  loadMessages(): void {
    this.messages$ = this.dmService.loadConversation();
    console.log('messs loaded');
  }

  scrollToBottom(): void {
    try {
      this.dmMessages.nativeElement.scrollTop = this.dmMessages.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll to bottom failed', err);
    }
  }
  



}
