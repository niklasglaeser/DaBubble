import { Component, HostListener, OnInit, AfterContentChecked, ChangeDetectorRef, ViewContainerRef, ViewChild, ComponentRef, Output, EventEmitter } from '@angular/core';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ThreadWindowComponent } from './thread-window/thread-window.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DmWindowComponent } from './dm-window/dm-window.component';
import { WorkspaceToggleComponent } from '../../dialog/workspace-toggle/workspace-toggle.component';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, ChatWindowComponent, ThreadWindowComponent, SidebarComponent, DmWindowComponent, WorkspaceToggleComponent],
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

  chatDialogRef: MatDialogRef<ChatWindowComponent> | null = null;

  constructor(private cdref: ChangeDetectorRef, private dialog: MatDialog, private sidebarService: GlobalService) {
    this.currentWidth = window.innerWidth;
    if (window.innerWidth < 1200) {this.isMobile = true;} else {this.isMobile = false;}
    if (window.innerWidth < 1200) {this.showSidebar = false;} else {this.showSidebar = true;}
  }

  ngOnInit() {
    this.checkWindowSize(window.innerWidth);
    this.sidebarService.showSidebar$.subscribe((status) => { this.showSidebar = status;});
    this.sidebarService.isChannel$.subscribe((status) => {this.isChannel = status;});
    this.sidebarService.isDirectChat$.subscribe((status) => {this.isDirectChat = status;});
    this.sidebarService.isThread$.subscribe((status) => {this.isThread = status;});
    this.showWorkspaceToggle = window.innerWidth > 1200 && window.innerWidth <= 1920;
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  handleChannelOpen() {
    if (this.isMobile) {
      this.sidebarService.isSidebar(false);
      this.sidebarService.setIsMobile(true);
    }
    this.sidebarService.isChannel(true);
    this.sidebarService.isDirectChat(false);
  }

  handleDirectMessageOpen() {
    if (this.isMobile) {
      this.sidebarService.isSidebar(false);
      this.sidebarService.setIsMobile(true);
    }
    this.sidebarService.isChannel(false);
    this.sidebarService.isDirectChat(true);
  }

  handleThreadOpen() {
    this.sidebarService.isThread(true);
    let isSidebarOpen = this.sidebarService.getSidebarStatus();
    if (isSidebarOpen) {
      this.sidebarService.isSidebar(false);
    }
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
    let isSidebarOpen = this.sidebarService.getSidebarStatus();
    let isThreadOpen = this.sidebarService.getThreadStatus();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkWindowSize(event.target.innerWidth);
    this.showWorkspaceToggle = window.innerWidth > 1210 && window.innerWidth <= 1920;
  }

  checkWindowSize(newWidth: number) {
    if (newWidth > 1200 && this.currentWidth <= 1200) {this.updateLayoutDesktop();}
    else if (newWidth <= 1200 && this.currentWidth > 1200) {this.updateLayoutMobile();}
    this.currentWidth = newWidth;
  }

  updateLayoutMobile() {
    this.isMobile = true;
    this.showSidebar = false;
    this.sidebarService.setIsMobile(this.isMobile);
    this.sidebarService.isSidebar(true);
    this.sidebarService.isThread(false);
    this.sidebarService.manageChatAndChannelStates();

  }

  updateLayoutDesktop() {
    this.isMobile = false;
    this.showSidebar = true;
    this.sidebarService.setIsMobile(this.isMobile);
    this.sidebarService.isSidebar(true);
    this.sidebarService.manageChatAndChannelStates();
  }

}