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

  @Output() toggle = new EventEmitter<boolean>();

  toggleWorkspace() {
    this.hide = !this.hide;
    this.toggle.emit(this.hide);
  }
}
