import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatSessionManagement } from './chatsession-management';

describe('ChatsessionManagement', () => {
  let component: ChatSessionManagement;
  let fixture: ComponentFixture<ChatSessionManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatSessionManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatSessionManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
