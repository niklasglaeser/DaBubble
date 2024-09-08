import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  private showSidebarSubject = new BehaviorSubject<boolean>(true);
  private isChannelSubject = new BehaviorSubject<boolean>(false);

  showSidebar$ = this.showSidebarSubject.asObservable();
  isChannel$ = this.isChannelSubject.asObservable();

  toggleSidebar() {
    const currentStatus = this.showSidebarSubject.getValue();
    this.showSidebarSubject.next(!currentStatus); // Sidebar Status umschalten
  }

  // Setze den Zustand von isChannel
  setIsChannel(status: boolean) {
    this.isChannelSubject.next(status);
  }

  // Seitenleiste explizit öffnen/schließen
  setSidebarStatus(status: boolean) {
    this.showSidebarSubject.next(status);
  }

  // Prüfe den aktuellen Zustand von isChannel
  getIsChannelStatus() {
    return this.isChannelSubject.getValue();
  }

  // Prüfe den aktuellen Sidebar-Status
  getSidebarStatus() {
    return this.showSidebarSubject.getValue();
  }
}  