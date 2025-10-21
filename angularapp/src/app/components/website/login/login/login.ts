// src/app/components/website/login/login.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // <-- Import CommonModule for *ngIf
import { AuthService, LoginRequest } from '../../../../service/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, RouterLink], // <-- Add CommonModule here
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  
  usernameOrEmail: string = '';
  password: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;

  constructor(private router: Router, private http: HttpClient, private authService: AuthService) {}

  private isEmail(input: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  }

  login() {
    if (!this.usernameOrEmail || !this.password) {
      this.errorMessage = 'Username/Email and Password are required';
      return;
    }

    // Clear previous errors
    this.errorMessage = '';

    // Demo credentials fallback with redirect support
    if (this.usernameOrEmail === 'admin@example.com' && this.password === 'admin123') {
      // Create demo admin user data
      const adminUser = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        category: 'admin',
        token: 'demo-admin-token'
      };
      localStorage.setItem('userData', JSON.stringify(adminUser));
      this.router.navigate(['/admin']);
      return;
    }
    if (this.usernameOrEmail === 'user@example.com' && this.password === 'user123') {
      // Create demo user data
      const userData = {
        id: 2,
        username: 'user',
        email: 'user@example.com',
        role: 'USER',
        category: 'student',
        token: 'demo-user-token'
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      const target = sessionStorage.getItem('postLoginRedirect') || '/user';
      sessionStorage.removeItem('postLoginRedirect');
      this.router.navigate([target]);
      return;
    }

    const loginRequest: LoginRequest = {
      usernameOrEmail: this.usernameOrEmail,
      password: this.password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response: any) => {
        console.log('User login successful:', response);
        
        // Navigate based on user role
        if (response.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          const target = sessionStorage.getItem('postLoginRedirect') || '/user';
          sessionStorage.removeItem('postLoginRedirect');
          this.router.navigate([target]);
        }
      },
      error: (err: any) => {
        this.errorMessage = 'Invalid username/email or password';
        console.error('Login error:', err);
      }
    });
  }
}
