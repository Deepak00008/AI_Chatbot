import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatmessageManagement } from './chatmessage-management';

describe('ChatmessageManagement', () => {
  let component: ChatmessageManagement;
  let fixture: ComponentFixture<ChatmessageManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatmessageManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatmessageManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
