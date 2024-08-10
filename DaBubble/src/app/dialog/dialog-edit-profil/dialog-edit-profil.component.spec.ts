import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditProfilComponent } from './dialog-edit-profil.component';

describe('DialogEditProfilComponent', () => {
  let component: DialogEditProfilComponent;
  let fixture: ComponentFixture<DialogEditProfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditProfilComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogEditProfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
