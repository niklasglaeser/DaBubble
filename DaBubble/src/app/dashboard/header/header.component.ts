import { Component, ElementRef, inject, ViewChild} from '@angular/core';
import { UserLoggedService } from '../../services/lp-services/user-logged.service';
import { AuthService } from '../../services/lp-services/auth.service';
import { UserLogged } from '../../models/user-logged.model';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { DialogMenuComponent } from './dialog-menu/dialog-menu.component';
import { DialogEditProfilComponent } from '../../dialog/dialog-edit-profil/dialog-edit-profil.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatMenuModule,
    DialogMenuComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @ViewChild('arrowButton') arrowButton!: ElementRef;
  dialog = inject(MatDialog);
  userLogged = inject(UserLoggedService)
  authService = inject(AuthService)
  user?: UserLogged 
  
  ngOnInit(): void {
    this.subscribeToUserData()
  }

  async subscribeToUserData(): Promise<void> {
    if (this.authService.uid) {
      await this.userLogged.subscribeUser(this.authService.uid).subscribe((data) =>{
        this.user = data
      })
      
    }
  }

  openDialog(): void {
    const arrowButton = this.arrowButton.nativeElement;
    
    this.dialog.open(DialogMenuComponent, {
      position: {
        top: `${arrowButton.offsetTop + arrowButton.offsetHeight}px`,
        left: `${arrowButton.offsetLeft - 250}px`
      }, 
    });
  }

  openProfilDialog(){
    this.dialog.open(DialogEditProfilComponent, {
     
    });
  }
}
