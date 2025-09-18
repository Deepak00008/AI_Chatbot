import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntentManagement } from './intent-management';

describe('IntentManagement', () => {
  let component: IntentManagement;
  let fixture: ComponentFixture<IntentManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntentManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntentManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
