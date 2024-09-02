import { CommonModule, DatePipe} from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DirectMessagesService } from '../../../../services/direct-message.service';
import { Message } from '../../../../models/message.model';
import { AuthService } from '../../../../services/lp-services/auth.service';
import { Observable } from 'rxjs';
import { UserLogged } from '../../../../models/user-logged.model';

@Component({
  selector: 'app-dm-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dm-messages.component.html',
  styleUrl: './dm-messages.component.scss',
  providers: [DatePipe],
})
export class DmMessagesComponent {
  @Input() messages: Message[] | null = null;

  hasMessages$!: Observable<boolean>;
  recipientUser$: Observable<UserLogged | null>;

  constructor (private dmService: DirectMessagesService, private authService: AuthService, private datePipe: DatePipe) {
    this.recipientUser$ = this.dmService.recipientUser$;
  }

  get currentUserId(): string | undefined {
    return this.authService.currentUserSig()?.userId;
  }

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

  formatMessage(message: string): string {
    return message.replace(/\n/g, '<br>');
  }

  ngOnInit() {
    // Abonniere das Observable, um den Nachrichtenstatus zu überwachen
    this.hasMessages$ = this.dmService.hasMessages$;
  }
  





}
