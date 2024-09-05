import { Component, HostListener, OnInit, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ThreadWindowComponent } from './thread-window/thread-window.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DmWindowComponent } from './dm-window/dm-window.component';
import { WorkspaceToggleComponent } from "../../dialog/workspace-toggle/workspace-toggle.component";
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, ChatWindowComponent, ThreadWindowComponent, SidebarComponent, DmWindowComponent, WorkspaceToggleComponent],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent implements OnInit, AfterContentChecked {
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
      this.sidebarOpen = true;
      this.workspaceVisible = false;
    } else {
      this.isMobile = false;
      this.sidebarOpen = false;
      if (screenWidth > 790 && screenWidth <= 1200) {
        this.workspaceVisible = false;
      } else if (screenWidth > 1200) {
        this.workspaceVisible = true;
      }
    }
  }
  openChatAsDialog() {
    if (this.isMobile && !this.chatDialogRef) {
      this.chatDialogRef = this.dialog.open(ChatWindowComponent, {
        width: '100%',
        height: '80%',
        maxWidth: '100vw',
        maxHeight: '100vh',
        panelClass: 'mobile-chat-dialog'
      });

      this.chatDialogRef.afterClosed().subscribe(() => {
        this.chatDialogRef = null;
      });
    }
  }
  toggleWorkspace() {
    this.workspaceVisible = !this.workspaceVisible;
  }


  closeSidebarOnMobile() {
    if (this.isMobile) {
      this.sidebarOpen = false;
      this.openChatAsDialog();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkWindowSize();
  }
}
