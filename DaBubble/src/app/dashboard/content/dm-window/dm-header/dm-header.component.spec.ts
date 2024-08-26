import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmHeaderComponent } from './dm-header.component';

describe('DmHeaderComponent', () => {
  let component: DmHeaderComponent;
  let fixture: ComponentFixture<DmHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DmHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
