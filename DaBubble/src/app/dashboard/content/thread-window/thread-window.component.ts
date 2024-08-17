import { Component } from '@angular/core';
import { ThreadHeaderComponent } from "./thread-header/thread-header.component";
import { ThreadMessagesComponent } from "./thread-messages/thread-messages.component";
import { ThreadFooterComponent } from "./thread-footer/thread-footer.component";

@Component({
  selector: 'app-thread-window',
  standalone: true,
  imports: [ThreadHeaderComponent, ThreadMessagesComponent, ThreadFooterComponent],
  templateUrl: './thread-window.component.html',
  styleUrl: './thread-window.component.scss',
})
export class ThreadWindowComponent {}
