import { Component } from '@angular/core';
import { SidebarComponent } from '../../../sidebar/sidebar.component';

@Component({
  selector: 'app-thread-window',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './thread-window.component.html',
  styleUrl: './thread-window.component.scss',
})
export class ThreadWindowComponent {}
