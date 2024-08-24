import { Component, OnInit } from '@angular/core';
import { ThreadHeaderComponent } from './thread-header/thread-header.component';
import { ThreadMessagesComponent } from './thread-messages/thread-messages.component';
import { ThreadFooterComponent } from './thread-footer/thread-footer.component';
import { Message } from '../../../models/message.model';
import { combineLatest, map, Observable } from 'rxjs';
import { ThreadService } from '../../../services/thread.service';

@Component({
  selector: 'app-thread-window',
  standalone: true,
  imports: [
    ThreadHeaderComponent,
    ThreadMessagesComponent,
    ThreadFooterComponent,
  ],
  templateUrl: './thread-window.component.html',
  styleUrl: './thread-window.component.scss',
})
export class ThreadWindowComponent implements OnInit {
  channelId: string | null = null;
  messageId: string | null = null;
  originMessage: Message | null = null;
  threadMessages$: Observable<Message[]> | undefined;

  constructor(private threadService: ThreadService) {}

  ngOnInit(): void {
    this.threadService.selectedMessage$.subscribe((data) => {
      if (data) {
        this.channelId = data.channelId;
        this.messageId = data.messageId;
        this.originMessage = data.originMessage;
        this.loadThreadMessages();
      }
    });
  }

  loadThreadMessages() {
    if (this.channelId && this.messageId) {
      this.threadMessages$ = combineLatest([
        this.threadService.getThreadMessages(this.channelId, this.messageId),
        this.threadService.selectedMessage$,
      ]).pipe(
        map(([threadMessages, selectedMessage]) => {
          if (selectedMessage) {
            return [selectedMessage.originMessage, ...threadMessages];
          }
          return threadMessages;
        })
      );
    }
  }
}
