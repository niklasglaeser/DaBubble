import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChatImgComponent } from './dialog-chat-img.component';

describe('DialogChatImgComponent', () => {
  let component: DialogChatImgComponent;
  let fixture: ComponentFixture<DialogChatImgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogChatImgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogChatImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
