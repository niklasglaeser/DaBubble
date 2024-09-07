import { Component, HostListener, OnInit, AfterContentChecked, ChangeDetectorRef, ViewContainerRef, ViewChild, ComponentRef, Output, EventEmitter } from '@angular/core';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ThreadWindowComponent } from './thread-window/thread-window.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DmWindowComponent } from './dm-window/dm-window.component';
import { WorkspaceToggleComponent } from "../../dialog/workspace-toggle/workspace-toggle.component";
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CustomDialogComponent } from '../../dialog/custom-dialog/custom-dialog.component';


@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, ChatWindowComponent, ThreadWindowComponent, SidebarComponent, DmWindowComponent, WorkspaceToggleComponent, CustomDialogComponent],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent implements OnInit, AfterContentChecked {
  @ViewChild('dialogContainer', { read: ViewContainerRef }) dialogContainer!: ViewContainerRef;
  dialogRef: ComponentRef<CustomDialogComponent> | null = null;

  workspaceVisible: boolean = true;
  showWorkspaceToggle: boolean = true;
  isMobile: boolean = false;
  sidebarOpen: boolean = true;
  chatDialogRef: MatDialogRef<ChatWindowComponent> | null = null;

  constructor(private cdref: ChangeDetectorRef, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.checkWindowSize();
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }
  checkWindowSize() {
    let screenWidth = window.innerWidth;
    this.showWorkspaceToggle = screenWidth > 790 && screenWidth <= 1920;

    if (screenWidth <= 790) {
      this.isMobile = true;
      this.workspaceVisible = false;
      let dmWindow = document.querySelector('.dm-window') as HTMLElement;
      let chatWindow = document.querySelector('.chat-window') as HTMLElement;
      if (dmWindow && dmWindow.classList.contains('none')) {
        dmWindow.classList.remove('none');
      }
      if (chatWindow && chatWindow.classList.contains('none')) {
        chatWindow.classList.remove('none');
      }

    } else {
      this.isMobile = false;
      this.workspaceVisible = true;
    }
  }

  toggleWorkspace() {
    this.workspaceVisible = !this.workspaceVisible;

  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkWindowSize();
  }
}
