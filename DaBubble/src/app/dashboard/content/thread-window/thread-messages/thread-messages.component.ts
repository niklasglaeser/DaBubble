import { Component, input, Input } from '@angular/core';
import { Message } from '../../../../models/message.model';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-thread-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './thread-messages.component.html',
  styleUrl: './thread-messages.component.scss',
})
export class ThreadMessagesComponent {
  @Input() originMessage: Message | null = null;
  @Input() threadMessages$: Observable<Message[]> | undefined;
  @Input() threadMessageCount$: Observable<number> | undefined;
  @Input() currentUserId: string | null = null;
}
