import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  private showSidebarSubject = new BehaviorSubject<boolean>(true);
  private isChannelSubject = new BehaviorSubject<boolean>(false);
  private isDirectChatSubject = new BehaviorSubject<boolean>(false);
  private isThreadSubject = new BehaviorSubject<boolean>(false);
  private isMobileSubject = new BehaviorSubject<boolean>(false);
  private channelSwitchSubject = new BehaviorSubject<string | null>(null);

  showSidebar$ = this.showSidebarSubject.asObservable();
  isChannel$ = this.isChannelSubject.asObservable();
  isDirectChat$ = this.isDirectChatSubject.asObservable();
  isThread$ = this.isThreadSubject.asObservable();
  isMobile$ = this.isMobileSubject.asObservable();

  toggleSidebar() {
    let currentStatus = this.showSidebarSubject.getValue();
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

  setIsMobile(status: boolean) {
    this.isMobileSubject.next(status);
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

  getIsMobileStatus() {
    return this.isMobileSubject.getValue();
  }

  manageChatAndChannelStates() {
    let isMobile = this.isMobileSubject.getValue();

    if (isMobile) {
      if (this.getDirectChatStatus()) {this.isDirectChat(true); this.isChannel(false);} 
      else {this.isDirectChat(false); this.isChannel(true);}
    } else {
      if (this.getDirectChatStatus()) {this.isDirectChat(true); this.isChannel(false);}
      else {this.isDirectChat(false); this.isChannel(true);}
    }
  }

  switchChannel(channelId: string) {
    this.channelSwitchSubject.next(channelId);
  }

  getChannelSwitch() {
    return this.channelSwitchSubject.asObservable();
  }
}  