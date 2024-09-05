import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ThreadWindowComponent } from './thread-window/thread-window.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DmWindowComponent } from './dm-window/dm-window.component';
import { WorkspaceToggleComponent } from "../../dialog/workspace-toggle/workspace-toggle.component";
import { Subscription } from 'rxjs';
import { DeviceService } from '../../services/device.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, ChatWindowComponent, ThreadWindowComponent, SidebarComponent, DmWindowComponent, WorkspaceToggleComponent],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent {
  workspaceVisible: boolean = true;
  showWorkspaceToggle: boolean = true;

  constructor() {
    this.checkWindowSize();
  }

  checkWindowSize() {
    let screenWidth = window.innerWidth;
    this.showWorkspaceToggle = screenWidth > 790 && screenWidth <= 1920;
    if (screenWidth <= 790) {
      this.workspaceVisible = true;
    } else if (screenWidth > 790 && screenWidth <= 1200) {
      this.workspaceVisible = false;
    } else if (screenWidth > 1200) {
      this.workspaceVisible = true;;
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
