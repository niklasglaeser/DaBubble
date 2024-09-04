import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ThreadWindowComponent } from './thread-window/thread-window.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DmWindowComponent } from './dm-window/dm-window.component';
import { WorkspaceToggleComponent } from "../../dialog/workspace-toggle/workspace-toggle.component";
import { Subscription } from 'rxjs';
import { DeviceService } from '../../services/device.service';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [ChatWindowComponent, ThreadWindowComponent, SidebarComponent, DmWindowComponent, WorkspaceToggleComponent],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent implements OnInit, OnDestroy {
  workspaceVisible: boolean = true;
  showWorkspaceToggle = true;
  screenWidth!: Subscription;

  constructor(private deviceService: DeviceService) {
    this.checkWindowSize();
  }
  ngOnInit(): void {
    this.screenWidth = this.deviceService.screenWidth.subscribe(width => {
      this.workspaceVisible = width >= 1200
    })
  }

  toggleWorkspace() {
    this.workspaceVisible = !this.workspaceVisible;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkWindowSize();
  }

  checkWindowSize() {
    this.showWorkspaceToggle = window.innerWidth <= 1980;
  }
  ngOnDestroy(): void {
    if (this.screenWidth) {
      this.screenWidth.unsubscribe();
    }
  }
}
