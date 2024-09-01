import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/lp-services/auth.service';
import { UserLoggedService } from '../../../services/lp-services/user-logged.service';
import { MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { DialogEditProfilComponent } from '../../../dialog/dialog-edit-profil/dialog-edit-profil.component';
import { user } from '@angular/fire/auth';
import { UserLogged } from '../../../models/user-logged.model';

@Component({
  selector: 'app-dialog-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './dialog-menu.component.html',
  styleUrls: ['./dialog-menu.component.scss'], 
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogMenuComponent {
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  userService = inject(UserLoggedService);
  dialogRef = inject(MatDialogRef);
  dialog = inject(MatDialog); 
  user?: UserLogged

  ngOnInit(): void {
    this.subscribeToUserData()
  }

  async subscribeToUserData(): Promise<void> {
    if (this.authService.uid) {
      await this.userService.subscribeUser(this.authService.uid).subscribe((data) =>{
        this.user = data
      })
      
    }
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.dialogRef.close();  
      this.router.navigateByUrl('');  
    });
  }

  openProfilDialog(): void {
    this.dialog.open(DialogEditProfilComponent, {
      data: { user: this.user }
    });
    this.dialogRef.close()
  }
}
