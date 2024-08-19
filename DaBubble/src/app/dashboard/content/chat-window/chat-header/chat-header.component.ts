import { Component, Input } from '@angular/core';
import { Channel } from '../../../../models/channel.class';
import { UserLogged } from '../../../../models/user-logged.model';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss',
})
export class ChatHeaderComponent {
  @Input() channel: Channel | null = null;
  @Input() members: UserLogged[] = [];
}
