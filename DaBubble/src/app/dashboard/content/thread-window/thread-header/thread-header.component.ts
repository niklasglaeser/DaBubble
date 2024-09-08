import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GlobalService } from '../../../../services/global.service';

@Component({
  selector: 'app-thread-header',
  standalone: true,
  imports: [],
  templateUrl: './thread-header.component.html',
  styleUrl: './thread-header.component.scss',
})
export class ThreadHeaderComponent {
  @Input() channelName: string | undefined = '';

  constructor(private globalService: GlobalService) { }
  onCloseThread() {
    this.globalService.isThread(false);
  }
}
