import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private screenWidth$ = new BehaviorSubject<number>(window.innerWidth);

  constructor() {
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(50),
        map(() => window.innerWidth)
      )
      .subscribe((width) => this.screenWidth$.next(width));
  }

  get screenWidth() {
    return this.screenWidth$.asObservable();
  }

  get deviceType$(): Observable<'mobile' | 'tablet' | 'desktop'> {
    return this.screenWidth.pipe(
      map(width => {
        if (width < 768) {
          return 'mobile';
        } else if (width >= 768 && width < 1024) {
          return 'tablet';
        } else {
          return 'desktop';
        }
      }),
      startWith(this.getDeviceType(window.innerWidth))
    );
  }


  private getDeviceType(width: number): 'mobile' | 'tablet' | 'desktop' {
    if (width < 768) {
      return 'mobile';
    } else if (width >= 768 && width < 1024) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }
}
