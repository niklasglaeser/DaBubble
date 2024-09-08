import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-workspace-toggle',
  standalone: true,
  imports: [],
  templateUrl: './workspace-toggle.component.html',
  styleUrl: './workspace-toggle.component.scss',
})
export class WorkspaceToggleComponent {
  hide: boolean = false;
  @Output() toggleSidebar = new EventEmitter<boolean>();

  toggleWorkspace() {
    this.hide = !this.hide;
    this.toggleSidebar.emit(this.hide);
  }
}
