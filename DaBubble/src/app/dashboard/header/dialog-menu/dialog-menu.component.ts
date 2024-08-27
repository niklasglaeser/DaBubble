import { ChangeDetectionStrategy, Component, Inject, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/lp-services/auth.service';
import { UserLoggedService } from '../../../services/lp-services/user-logged.service';
import { MatDialogRef } from '@angular/material/dialog';
import { HeaderComponent } from '../header.component';

@Component({
  selector: 'app-dialog-menu',
  standalone: true,
  imports: [],
  templateUrl: './dialog-menu.component.html',
  styleUrl: './dialog-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogMenuComponent {
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  userService = inject(UserLoggedService);
  dialogRef = inject(MatDialogRef);
  
  constructor(
  ) {
    
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.dialogRef.close();  
      this.router.navigateByUrl('');  
    });
  }
}
