import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChannelStateService {
  private selectedChannelIdSource = new BehaviorSubject<string | null>(null);
  selectedChannelId$ = this.selectedChannelIdSource.asObservable();

  public emitOpenDirectMessage = new EventEmitter<string>();

  openDirectMessage(userId: string) {
    this.emitOpenDirectMessage.emit(userId);
  }

  setSelectedChannelId(channelId: string) {
    this.selectedChannelIdSource.next(channelId);
  }
}
