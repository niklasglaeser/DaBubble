import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DirectMessagesService } from '../../../../services/direct-message.service';
import { UserService } from '../../../../services/user.service';
import { UserLogged } from '../../../../models/user-logged.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dm-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dm-header.component.html',
  styleUrl: './dm-header.component.scss'
})

export class DmHeaderComponent {
  
  recipientId: string | null = null;
  users: UserLogged[] = [];
  recipientUser$: Observable<UserLogged | null>;

  constructor(private dmService: DirectMessagesService, private userService: UserService) {
    this.recipientUser$ = this.dmService.recipientUser$;
  }
}
