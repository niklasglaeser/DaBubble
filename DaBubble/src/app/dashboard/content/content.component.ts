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

  chatDialogRef: MatDialogRef<ChatWindowComponent> | null = null;

  constructor(private cdref: ChangeDetectorRef, private dialog: MatDialog, private sidebarService: GlobalService) {}

  ngOnInit() {
    this.checkWindowSize();
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
      console.log('isThread status in ContentComponent:', status);
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
      if (this.sidebarService.getDirectChatStatus()) {
        this.sidebarService.isChannel(false);
        this.sidebarService.isDirectChat(true);
      } else {
        this.sidebarService.isChannel(true);
        this.sidebarService.isDirectChat(false);
      }
    } else if (screenWidth <= 1200 && screenWidth > 790) {
      this.isMobile = false;
      if (this.sidebarService.getDirectChatStatus()) {
        this.sidebarService.isDirectChat(true);
        this.sidebarService.isChannel(false);
      } else {
        this.sidebarService.isChannel(true);
        this.sidebarService.isDirectChat(false);
      }
    } else {
      this.isMobile = true;
    }
  }

  handleChannelOpen() {
    this.sidebarService.isChannel(true);
    this.sidebarService.isDirectChat(false);
    if (this.showSidebar && this.isMobile) {
      this.sidebarService.isSidebar(false);
    }
  }

  handleDirectMessageOpen() {
    this.sidebarService.isChannel(false);
    this.sidebarService.isDirectChat(true);
    if (this.showSidebar && this.isMobile) {
      this.sidebarService.isSidebar(false);
    }
  }

  handleThreadOpen() {
    if (this.isMobile) {
      this.sidebarService.isChannel(false);
    }
    this.sidebarService.isThread(true);
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkWindowSize();
  }
}
