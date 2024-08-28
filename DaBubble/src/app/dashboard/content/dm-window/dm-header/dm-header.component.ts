import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DirectMessagesService } from '../../../../services/direct-message.service';
import { UserService } from '../../../../services/user.service';
import { UserLogged } from '../../../../models/user-logged.model';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditProfilComponent } from '../../../../dialog/dialog-edit-profil/dialog-edit-profil.component';

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

  constructor(private dmService: DirectMessagesService, private userService: UserService, private dialog: MatDialog) {
    this.recipientUser$ = this.dmService.recipientUser$;
  }

  openProfile(userId: string): void {
    this.userService.getSingleUserObj(userId).then(user => {
      if (user) {
        this.dialog.open(DialogEditProfilComponent, {
          data: { user }
        });
      }
    });
  }

}

