import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'app-workspace-toggle',
  standalone: true,
  imports: [],
  templateUrl: './workspace-toggle.component.html',
  styleUrl: './workspace-toggle.component.scss',
})
export class WorkspaceToggleComponent implements OnInit {
  showSidebar: boolean = true;
  constructor(private sidebarService: GlobalService) { }

  ngOnInit(): void {
    this.sidebarService.showSidebar$.subscribe(status => {
      this.showSidebar = status;
    });
  }

  toggleWorkspace() {
    this.sidebarService.toggleSidebar();
  }
}
