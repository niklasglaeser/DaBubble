import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-thread-header',
  standalone: true,
  imports: [],
  templateUrl: './thread-header.component.html',
  styleUrl: './thread-header.component.scss',
})
export class ThreadHeaderComponent {
  @Input() channelName: string | undefined = '';
  @Output() closeThreadEvent = new EventEmitter<void>();

  onCloseThread() {
    this.closeThreadEvent.emit(); // Sende das Ereignis an die Parent-Komponente
  }
}
