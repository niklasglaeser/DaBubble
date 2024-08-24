import { Component, Input } from '@angular/core';
import { Message } from '../../../../models/message.model';

@Component({
  selector: 'app-thread-messages',
  standalone: true,
  imports: [],
  templateUrl: './thread-messages.component.html',
  styleUrl: './thread-messages.component.scss',
})
export class ThreadMessagesComponent {
  @Input() originMessage: Message | null = null;
}
