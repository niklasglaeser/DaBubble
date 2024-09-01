import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor() { }

  /*TESTING OPENING DIALOG*/

  /*
  calculateLeftPosition(event: MouseEvent, dialogWidth: number): { top: string; left: string } {
    let leftPosition = event.clientX - dialogWidth;
    if (leftPosition < 0) {
      leftPosition = 0;
    }
    return {
      top: `${event.clientY}px`,
      left: `${leftPosition}px`
    };
  }

  calculateRightPosition(event: MouseEvent, dialogWidth: number): { top: string; left: string } {
    const windowWidth = window.innerWidth;
    let rightPosition = event.clientX;

    if (rightPosition + dialogWidth > windowWidth) {
      rightPosition = windowWidth - dialogWidth;
    }

    return {
      top: `${event.clientY}px`,
      left: `${rightPosition}px`
    };
  }*/


  /*TESTING OPENING DIALOG*/
}  