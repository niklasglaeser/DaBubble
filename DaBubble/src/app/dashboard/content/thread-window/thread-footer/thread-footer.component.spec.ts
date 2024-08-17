import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadFooterComponent } from './thread-footer.component';

describe('ThreadFooterComponent', () => {
  let component: ThreadFooterComponent;
  let fixture: ComponentFixture<ThreadFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadFooterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreadFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
