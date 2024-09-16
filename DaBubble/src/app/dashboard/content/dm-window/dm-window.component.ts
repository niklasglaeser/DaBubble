import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
export class DmWindowComponent implements OnInit {
  messages$: Observable<Message[]> | null = null;
  private previousMessageCount: number = 0;

  @ViewChild('dmMessages') dmMessages!: ElementRef;

  constructor(private dmService: DirectMessagesService) { }

  ngOnInit(): void {
    this.dmService.loadMessages$.subscribe(() => {this.loadMessagesAfterSidebarClick();});
  }

  loadMessagesAfterSidebarClick(): void {
    this.messages$ = this.dmService.loadConversation();
    let textarea = document.getElementById('dm-message-input') as HTMLTextAreaElement;
    setTimeout(() => {
      textarea.focus();
      textarea.value = '';
    }, 0);
    setTimeout(() => {this.scrollToBottom();}, 500);
  }

  private isUserAtBottom(): boolean {
    let element = this.dmMessages.nativeElement;
    let threshold = 150;
    let position = element.scrollTop + element.offsetHeight;
    let height = element.scrollHeight;

    return position > height - threshold;
  }

  loadMessages(): void {
    this.messages$ = this.dmService.loadConversation();
    this.messages$.subscribe((messages) => {
      let newMessageCount = messages.length;
      if (newMessageCount > this.previousMessageCount && this.isUserAtBottom()) {
        setTimeout(() => {this.scrollToBottom();}, 500);
      }
      this.previousMessageCount = newMessageCount;
    });
  }

  scrollToBottom(): void {
    if (this.dmMessages && this.dmMessages.nativeElement) {
      setTimeout(() => {
        this.dmMessages.nativeElement.scrollTop = this.dmMessages.nativeElement.scrollHeight;
      }, 100);
    } else {
      console.log('dmMessages or nativeElement is not defined');
    }
  }

  onMessageSent(): void {
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }
}