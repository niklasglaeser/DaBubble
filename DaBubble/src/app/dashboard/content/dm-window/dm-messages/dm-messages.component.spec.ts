import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmMessagesComponent } from './dm-messages.component';

describe('DmMessagesComponent', () => {
  let component: DmMessagesComponent;
  let fixture: ComponentFixture<DmMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmMessagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DmMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
