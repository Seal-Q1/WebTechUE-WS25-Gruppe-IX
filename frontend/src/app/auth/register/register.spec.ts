import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Register} from './register';
import {provideHttpClient} from '@angular/common/http';
import {provideRouter} from '@angular/router';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty user data initially', () => {
    expect(component.userData.userName).toBe('');
    expect(component.userData.email).toBe('');
  });

  it('should show error when submitting empty form', () => {
    component.onSubmit();
    expect(component.errorMessage).toBe('Please fill in all fields');
  });

  it('should show error when passwords do not match', () => {
    component.userData = {
      userName: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '+1234567890',
      password: 'password123'
    };
    component.confirmPassword = 'different';
    component.onSubmit();
    expect(component.errorMessage).toBe('Passwords do not match');
  });
});
