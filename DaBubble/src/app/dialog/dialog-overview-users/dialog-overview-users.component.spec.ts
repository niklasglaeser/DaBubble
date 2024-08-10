import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogOverviewUsersComponent } from './dialog-overview-users.component';

describe('DialogOverviewUsersComponent', () => {
  let component: DialogOverviewUsersComponent;
  let fixture: ComponentFixture<DialogOverviewUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogOverviewUsersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogOverviewUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
