import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmFooterComponent } from './dm-footer.component';

describe('DmFooterComponent', () => {
  let component: DmFooterComponent;
  let fixture: ComponentFixture<DmFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmFooterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DmFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
