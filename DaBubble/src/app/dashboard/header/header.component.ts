import { Component, inject} from '@angular/core';
import { UserLoggedService } from '../../services/lp-services/user-logged.service';
import { AuthService } from '../../services/lp-services/auth.service';
import { UserLogged } from '../../models/user-logged.model';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  userLogged = inject(UserLoggedService)
  authService = inject(AuthService)
  user?: UserLogged 

  ngOnInit(): void {
    this.subscribeToUserData()
  }

  async subscribeToUserData(): Promise<void> {
    if (this.authService.uid) {
      await this.userLogged.subscribeUser(this.authService.uid)
      this.user = this.userLogged.userData
    }
  }

  openDialog() {
  }
}
