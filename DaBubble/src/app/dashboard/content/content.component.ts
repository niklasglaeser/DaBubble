import { Component, HostListener, OnInit, AfterContentChecked, ChangeDetectorRef, ViewContainerRef, ViewChild, ComponentRef, Output, EventEmitter } from '@angular/core';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ThreadWindowComponent } from './thread-window/thread-window.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DmWindowComponent } from './dm-window/dm-window.component';
import { WorkspaceToggleComponent } from "../../dialog/workspace-toggle/workspace-toggle.component";
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CustomDialogComponent } from '../../dialog/custom-dialog/custom-dialog.component';
import { GlobalService } from '../../services/global.service';


@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, ChatWindowComponent, ThreadWindowComponent, SidebarComponent, DmWindowComponent, WorkspaceToggleComponent, CustomDialogComponent],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent implements OnInit, AfterContentChecked {

  showSidebar: boolean = true;
  sidebarOpen: boolean = true;
  showWorkspaceToggle: boolean = true;

  isDektop: boolean = false
  isTablet: boolean = false
  isMobile: boolean = false;

  isChannel: boolean = false;
  isDirectChat: boolean = false;

  chatDialogRef: MatDialogRef<ChatWindowComponent> | null = null;

  constructor(private cdref: ChangeDetectorRef, private dialog: MatDialog, private sidebarService: GlobalService) {
  }

  ngOnInit() {
    this.checkWindowSize();

    this.sidebarService.showSidebar$.subscribe(status => {
      this.showSidebar = status;
    });

    this.sidebarService.isChannel$.subscribe(status => {
      this.isChannel = status;
    });
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  checkWindowSize() {
    let screenWidth = window.innerWidth;

    this.showWorkspaceToggle = screenWidth > 790 && screenWidth <= 1920;

    if (screenWidth > 1200) {
      this.isMobile = false;
      this.showSidebar = true;
      console.log('Desktop view detected');
    } else if (screenWidth <= 1200 && screenWidth > 790) {
      this.isMobile = false;
      this.showSidebar = true;
      this.isChannel = true;
      console.log('Tablet view detected');
    } else {
      this.isMobile = true;
      // Wenn kein Channel offen ist, Sidebar anzeigen
      this.showSidebar = !this.isChannel;
      console.log('Mobile view detected');
      console.log('isChannel ' + this.isChannel);
    }
  }


  handleChannelOpen() {
    this.sidebarService.setIsChannel(true);
    if (this.showSidebar) {
      this.sidebarService.setSidebarStatus(false);  // Schließe die Sidebar im mobilen Modus
    }
  }



  toggleSidebar() {
    console.log('toggle sidebar');

    this.showSidebar = !this.showSidebar;
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkWindowSize();
  }
}
