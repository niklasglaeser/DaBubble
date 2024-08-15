import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceToggleComponent } from './workspace-toggle.component';

describe('WorkspaceToggleComponent', () => {
  let component: WorkspaceToggleComponent;
  let fixture: ComponentFixture<WorkspaceToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceToggleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkspaceToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
