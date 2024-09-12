import { Component, HostListener, OnInit, AfterContentChecked, ChangeDetectorRef, ViewContainerRef, ViewChild, ComponentRef, Output, EventEmitter } from '@angular/core';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ThreadWindowComponent } from './thread-window/thread-window.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DmWindowComponent } from './dm-window/dm-window.component';
import { WorkspaceToggleComponent } from '../../dialog/workspace-toggle/workspace-toggle.component';
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
  @ViewChild('dialogContainer', { read: ViewContainerRef }) dialogContainer!: ViewContainerRef;
  @ViewChild('dmWindow') dmWindow!: DmWindowComponent;

  showSidebar: boolean = true;
  sidebarOpen: boolean = true;
  showWorkspaceToggle: boolean = true;

  isDektop: boolean = false;
  isTablet: boolean = false;
  isMobile: boolean = false;

  isChannel: boolean = true;
  isDirectChat: boolean = false;
  isThread: boolean = false;

  currentWidth: number;
  screenWidth = window.innerWidth;

  chatDialogRef: MatDialogRef<ChatWindowComponent> | null = null;

  constructor(private cdref: ChangeDetectorRef, private dialog: MatDialog, private sidebarService: GlobalService) { 
    this.currentWidth = window.innerWidth;
  }

  ngOnInit() {
    this.checkWindowSize(window.innerWidth);
    this.sidebarService.showSidebar$.subscribe((status) => {
      this.showSidebar = status;
    });

    this.sidebarService.isChannel$.subscribe((status) => {
      this.isChannel = status;
    });

    this.sidebarService.isDirectChat$.subscribe((status) => {
      this.isDirectChat = status;
    });

    this.sidebarService.isThread$.subscribe((status) => {
      this.isThread = status;
    });

    this.showWorkspaceToggle = this.screenWidth > 1200 && this.screenWidth <= 1920;
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }


  /*
  checkWindowSize() {
    let screenWidth = window.innerWidth;
    this.showWorkspaceToggle = screenWidth > 790 && screenWidth <= 1920;

    if (screenWidth > 1200) {
      this.isMobile = false;
      this.showSidebar = true;
      this.sidebarService.setIsMobile(this.isMobile);
      this.sidebarService.isSidebar(this.showSidebar);
      this.sidebarService.manageChatAndChannelStates();
    } else {
      this.isMobile = true;
      this.showSidebar = true;
      this.sidebarService.setIsMobile(this.isMobile);
      this.sidebarService.isSidebar(true);
      this.sidebarService.manageChatAndChannelStates();
    }
  }
  */

  handleChannelOpen() {
    this.sidebarService.isChannel(true);
    this.sidebarService.isDirectChat(false);
    if (this.isMobile) {
      this.sidebarService.isSidebar(false);
    }
  }

  handleDirectMessageOpen() {
    this.sidebarService.isChannel(false);
    this.sidebarService.isDirectChat(true);
    if (this.isMobile) {
      this.sidebarService.isSidebar(false);
    }
  }

  handleThreadOpen() {
    this.sidebarService.isThread(true);
    const isSidebarOpen = this.sidebarService.getSidebarStatus();
    if (isSidebarOpen) {
      this.sidebarService.isSidebar(false);
    }
  }


  toggleSidebar() {
    this.sidebarService.toggleSidebar();
    const isSidebarOpen = this.sidebarService.getSidebarStatus();
    const isThreadOpen = this.sidebarService.getThreadStatus();
    if (isSidebarOpen && isThreadOpen) {
      this.sidebarService.isThread(false);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkWindowSize(event.target.innerWidth);
  }

  checkWindowSize(newWidth: number) {
    // Führe eine Aktion nur aus, wenn die Breite kleiner oder größer als ein bestimmter Schwellenwert ist
    if (newWidth > 1200 && this.currentWidth <= 1200) {
      console.log('Fenster ist breiter als 1200px geworden');
      this.updateLayoutDesktop();
    } else if (newWidth <= 1200 && this.currentWidth > 1200) {
      console.log('Fenster ist schmaler als 1200px geworden');
      this.updateLayoutMobile();
    }
    this.currentWidth = newWidth;
  }

  updateLayoutMobile() {
    this.showWorkspaceToggle = window.innerWidth > 1210;
    this.isMobile = true;
    this.showSidebar = false;
    this.sidebarService.setIsMobile(this.isMobile);
    this.sidebarService.isSidebar(true);
    this.sidebarService.manageChatAndChannelStates();

  }
  
  updateLayoutDesktop() {
    this.showWorkspaceToggle = window.innerWidth <= 1920;
    this.isMobile = false;
    this.showSidebar = true;
    this.sidebarService.setIsMobile(this.isMobile);
    this.sidebarService.isSidebar(true);
    this.sidebarService.manageChatAndChannelStates();
  }

}