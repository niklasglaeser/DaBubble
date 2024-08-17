import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSelectedUserListComponent } from './add-selected-user-list.component';

describe('AddSelectedUserListComponent', () => {
  let component: AddSelectedUserListComponent;
  let fixture: ComponentFixture<AddSelectedUserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSelectedUserListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddSelectedUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
