import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Login} from './login';
import {provideHttpClient} from '@angular/common/http';
import {provideRouter} from '@angular/router';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty credentials initially', () => {
    expect(component.credentials.username).toBe('');
    expect(component.credentials.password).toBe('');
  });

  it('should show error when submitting empty form', () => {
    component.onSubmit();
    expect(component.errorMessage).toBe('Please fill in all fields');
  });
});
