import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadHeaderComponent } from './thread-header.component';

describe('ThreadHeaderComponent', () => {
  let component: ThreadHeaderComponent;
  let fixture: ComponentFixture<ThreadHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThreadHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
