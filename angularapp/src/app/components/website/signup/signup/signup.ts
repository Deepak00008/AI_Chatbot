import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
// import { AuthService, RegisterRequest } from '../../../service/auth-service';

@Component({
  selector: 'app-user-signup',
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule, HttpClientModule]
})
export class Signup {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  category: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Individual field validation errors
  usernameError: string = '';
  emailError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';
  categoryError: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  signup() {
    // Clear previous errors
    this.clearErrors();
    
    let hasErrors = false;

    // Validate name
    if (!this.username.trim()) {
      this.usernameError = 'Username is required';
      hasErrors = true;
    } else if (this.username.trim().length < 2) {
      this.usernameError = 'Username must be at least 2 characters long';
      hasErrors = true;
    }

    // Validate email
    if (!this.email.trim()) {
      this.emailError = 'Email is required';
      hasErrors = true;
    } else if (!this.isValidEmail(this.email)) {
      this.emailError = 'Please enter a valid email address';
      hasErrors = true;
    }

    // Validate password
    if (!this.password) {
      this.passwordError = 'Password is required';
      hasErrors = true;
    } else if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters long';
      hasErrors = true;
    } else if (!this.hasValidPassword(this.password)) {
      this.passwordError = 'Password must contain at least one letter and one number';
      hasErrors = true;
    }

    // Validate confirm password
    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Please confirm your password';
      hasErrors = true;
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
      hasErrors = true;
    }

    // Validate category
    if (!this.category) {
      this.categoryError = 'Please select a category';
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    // If all validations pass, register with backend
    const registerRequest = {
      username: this.username,
      email: this.email,
      password: this.password,
      category: this.category
    };

    this.http.post<any>('http://localhost:8080/api/auth/register', registerRequest).subscribe({
      next: (response: any) => {
        // Store user data in localStorage
        localStorage.setItem('userData', JSON.stringify(response));
        
        this.successMessage = 'Registration successful!';
        setTimeout(() => {
          // Navigate based on user role
          if (response.role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/user']);
          }
        }, 1500);
      },
      error: (err: any) => {
        this.errorMessage = 'Registration failed. Username or email may already exist.';
        console.error('Registration error:', err);
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private hasValidPassword(password: string): boolean {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLetter && hasNumber;
  }

  private clearErrors(): void {
    this.usernameError = '';
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.categoryError = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
