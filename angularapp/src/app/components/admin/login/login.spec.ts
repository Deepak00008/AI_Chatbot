import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error if email or password is empty', () => {
    component.email = '';
    component.password = '';
    component.login();
    expect(component.errorMessage).toBe('Email and Password are required');
  });

  it('should redirect if credentials are correct', () => {
    component.email = 'admin@example.com';
    component.password = 'admin123';
    component.login();
    expect(component.errorMessage).toBe('');
  });
});
