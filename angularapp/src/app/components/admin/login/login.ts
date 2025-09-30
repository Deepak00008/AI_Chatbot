// src/app/components/website/login/login.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // <-- Import CommonModule for *ngIf

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, RouterLink], // <-- Add CommonModule here
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;

  constructor(private router: Router, private http: HttpClient) {}

  login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and Password are required';
      return;
    }

    // Demo credentials fallback with redirect support
    if (this.email === 'admin@example.com' && this.password === 'admin123') {
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
    if (this.email === 'user@example.com' && this.password === 'user123') {
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

    const loginRequest = {
      usernameOrEmail: this.email,
      password: this.password
    };

    this.http.post<any>('http://localhost:8080/api/auth/login', loginRequest)
      .subscribe({
        next: (res) => {
          // Store user data in localStorage
          localStorage.setItem('userData', JSON.stringify(res));
          
          // Navigate based on user role
          if (res.role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else if (res.role === 'USER') {
            const target = sessionStorage.getItem('postLoginRedirect') || '/user';
            sessionStorage.removeItem('postLoginRedirect');
            this.router.navigate([target]);
          } else {
            this.errorMessage = 'Invalid role received';
          }
        },
        error: (err) => {
          this.errorMessage = 'Invalid email or password';
          console.error('Login error:', err);
        }
      });
  }
}
