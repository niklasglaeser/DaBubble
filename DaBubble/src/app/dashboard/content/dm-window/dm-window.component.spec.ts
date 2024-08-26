import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmWindowComponent } from './dm-window.component';

describe('DmWindowComponent', () => {
  let component: DmWindowComponent;
  let fixture: ComponentFixture<DmWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmWindowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DmWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
