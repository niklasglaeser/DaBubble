import { Component, input, Input } from '@angular/core';
import { Message } from '../../../../models/message.model';
import { CommonModule, DatePipe} from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-thread-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './thread-messages.component.html',
  styleUrl: './thread-messages.component.scss',
  providers: [DatePipe],
})
export class ThreadMessagesComponent {
  @Input() originMessage: Message | null = null;
  @Input() threadMessages$: Observable<Message[]> | undefined;
  @Input() threadMessageCount$: Observable<number> | undefined;
  @Input() currentUserId: string | null = null;

  constructor (private datePipe: DatePipe,) {}

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
}
