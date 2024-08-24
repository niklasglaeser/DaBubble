import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-thread-header',
  standalone: true,
  imports: [],
  templateUrl: './thread-header.component.html',
  styleUrl: './thread-header.component.scss',
})
export class ThreadHeaderComponent {
  @Input() channelName: string | undefined = '';

  closeThread() {
    const threadWindow = document.querySelector(
      '.thread-window'
    ) as HTMLElement;
    if (threadWindow) {
      threadWindow.classList.remove('open');
    }
  }
}
