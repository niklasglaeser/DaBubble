import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogMenuComponent } from './dialog-menu.component';

describe('DialogMenuComponent', () => {
  let component: DialogMenuComponent;
  let fixture: ComponentFixture<DialogMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
