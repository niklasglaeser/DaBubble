import { Component, EventEmitter, Output, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-custom-dialog',
  standalone: true,
  imports: [],
  template: `
<div class="custom-dialog-overlay" (click)="closeDialog()"></div>
<div class="custom-dialog">
    <ng-container #dialogContentContainer></ng-container>
    <button class="close-button" (click)="closeDialog()">Close</button>
</div>
`,
  styleUrls: ['./custom-dialog.component.scss']
})
export class CustomDialogComponent {
  @Output() closed = new EventEmitter<void>();
  @ViewChild('dialogContentContainer', { read: ViewContainerRef, static: true }) dialogContainer!: ViewContainerRef;

  closeDialog() {
    this.closed.emit();
  }
}