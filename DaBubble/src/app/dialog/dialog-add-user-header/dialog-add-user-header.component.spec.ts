import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddUserHeaderComponent } from './dialog-add-user-header.component';

describe('DialogAddUserHeaderComponent', () => {
  let component: DialogAddUserHeaderComponent;
  let fixture: ComponentFixture<DialogAddUserHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAddUserHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogAddUserHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
