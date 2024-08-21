import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Message } from '../../../../models/message.model';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../../../services/lp-services/auth.service';
import { UserLogged } from '../../../../models/user-logged.model';

@Component({
  selector: 'app-chat-messages',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './chat-messages.component.html',
  styleUrls: ['./chat-messages.component.scss'],
  providers: [DatePipe],
})
export class ChatMessagesComponent implements OnInit, OnDestroy {
  @Input() messages$: Observable<Message[]> | undefined;
  @Input() currentUser: UserLogged | null = null;
  private userSubscription: Subscription | undefined;

  constructor(private datePipe: DatePipe, private authService: AuthService) {}

  ngOnInit(): void {
    // this.userSubscription = this.authService.user$.subscribe((user) => {
    //   if (user) {
    //     this.currentUser = user.displayName || null;
    //   } else {
    //     this.currentUser = null;
    //   }
    // });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
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
}
