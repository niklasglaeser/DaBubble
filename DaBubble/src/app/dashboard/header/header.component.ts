import { Component, ElementRef, EventEmitter, inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UserLoggedService } from '../../services/lp-services/user-logged.service';
import { AuthService } from '../../services/lp-services/auth.service';
import { UserLogged } from '../../models/user-logged.model';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { DialogMenuComponent } from './dialog-menu/dialog-menu.component';
import { DialogEditProfilComponent } from '../../dialog/dialog-edit-profil/dialog-edit-profil.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';
import { SearchComponent } from "../search/search.component";
import { Router } from '@angular/router';
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatFormFieldModule,
    DialogMenuComponent,
    ReactiveFormsModule,
    DialogEditProfilComponent,
    SearchComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('arrowButton') arrowButton!: ElementRef;
  private subscription: Subscription = new Subscription();
  @Output() goMobileMenu = new EventEmitter<void>();

  dialog = inject(MatDialog);
  userLogged = inject(UserLoggedService);
  authService = inject(AuthService);
  user?: UserLogged;

  searchControl = new FormControl();
  isPanelOpen: boolean = false;
  searchResults: any[] = [];
  userEventService = inject(UserService);

  constructor(private router: Router, private sidebarService: GlobalService) { }

  ngOnInit(): void {
    this.subscribeToUserData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  reloadPage() {
    window.location.reload();
  }

  async getUsername(senderId: string): Promise<string> {
    try {
      const user = await this.userEventService.getSingleUserObj(senderId);
      return user ? user.username : 'Unbekannt';
    } catch (error) {
      console.error('Error fetching user:', error);
      return 'Unbekannt';
    }
  }

  async subscribeToUserData(): Promise<void> {
    if (this.authService.uid) {
      await this.userLogged.subscribeUser(this.authService.uid).subscribe((data) => {
        this.user = data;
      });
    }
  }

  openDialog(): void {
    const arrowButton = this.arrowButton.nativeElement;

    this.dialog.open(DialogMenuComponent, {
      position: {
        top: `${25 + arrowButton.offsetTop + arrowButton.offsetHeight}px`,
        left: `${arrowButton.offsetLeft - 250}px`
      },
      panelClass: 'dialog-header-profile',
    });
  }

  openProfilDialog() {
    this.dialog.open(DialogEditProfilComponent, {});
  }

  toggleSidebar() {
    //const isChannelActive = this.sidebarService.getChannelStatus();
    this.sidebarService.toggleSidebar();

    // Wenn ein Channel aktiv ist, zeige das Chat-Fenster, wenn die Sidebar geschlossen wird
    // if (isChannelActive && !this.sidebarService.getSidebarStatus()) {
    //   this.sidebarService.isChannel(true);  // Stelle sicher, dass das Chat-Fenster offen bleibt
    // }
  }

  // goBackToSidebar() {
  //   let dmWindow = document.querySelector('.dm-window') as HTMLElement;
  //   let chatWindow = document.querySelector('.chat-window') as HTMLElement;
  //   let threadWindow = document.querySelector('.thread-window') as HTMLElement;
  //   let sidebar = document.querySelector('.sidebar-window') as HTMLElement;
  //   sidebar.classList.remove('none');
  //   chatWindow.classList.add('none');
  //   dmWindow.classList.add('none');
  //   threadWindow.classList.add('none');
  // }
}
