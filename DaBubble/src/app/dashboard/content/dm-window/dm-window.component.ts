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
export class DmWindowComponent implements AfterViewInit, AfterViewChecked {
  messages$: Observable<Message[]> | null = null;

  @ViewChild('dmMessages') dmMessages!: ElementRef;

  constructor(private dmService: DirectMessagesService) { }

  ngAfterViewInit(): void {
    this.loadMessages();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom(); // Scrollen Sie nach unten, nachdem die Ansicht gecheckt wurde
  }

  loadMessages(): void {
    this.messages$ = this.dmService.loadConversation();
    this.messages$.subscribe(() => {
      this.scrollToBottom(); // Scrollen Sie nach unten, sobald die Nachrichten geladen sind
    });
  }

  scrollToBottom(): void {
    if (this.dmMessages && this.dmMessages.nativeElement) {
      this.dmMessages.nativeElement.scrollTop = this.dmMessages.nativeElement.scrollHeight;
    } else {
      console.log('dmMessages or nativeElement is not defined');
    }
  }
}