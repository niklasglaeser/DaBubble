import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  private showSidebarSubject = new BehaviorSubject<boolean>(true);
  private isChannelSubject = new BehaviorSubject<boolean>(false);
  private isDirectChatSubject = new BehaviorSubject<boolean>(false);
  private isThreadSubject = new BehaviorSubject<boolean>(false);

  showSidebar$ = this.showSidebarSubject.asObservable();
  isChannel$ = this.isChannelSubject.asObservable();
  isDirectChat$ = this.isDirectChatSubject.asObservable();
  isThread$ = this.isThreadSubject.asObservable();

  toggleSidebar() {
    const currentStatus = this.showSidebarSubject.getValue();
    this.showSidebarSubject.next(!currentStatus);
  }


  isChannel(status: boolean) {
    this.isChannelSubject.next(status);
  }

  isDirectChat(status: boolean) {
    this.isDirectChatSubject.next(status);
  }
  isThread(status: boolean) {
    this.isThreadSubject.next(status);
  }

  isSidebar(status: boolean) {
    this.showSidebarSubject.next(status);
  }

  getSidebarStatus() {
    return this.showSidebarSubject.getValue();
  }

  getChannelStatus() {
    return this.isChannelSubject.getValue();
  }

  getDirectChatStatus() {
    return this.isDirectChatSubject.getValue();
  }
  getThreadStatus() {
    return this.isThreadSubject.getValue();
  }
}  