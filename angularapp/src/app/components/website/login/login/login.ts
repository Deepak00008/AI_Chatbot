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

    // Replace the URL with your backend login endpoint
    // Demo credentials fallback with redirect support
    if (this.email === 'admin@example.com' && this.password === 'admin123') {
      this.router.navigate(['/admin']);
      return;
    }
    if (this.email === 'user@example.com' && this.password === 'user123') {
      const target = sessionStorage.getItem('postLoginRedirect') || '/user';
      sessionStorage.removeItem('postLoginRedirect');
      this.router.navigate([target]);
      return;
    }

    this.http.post<any>('http://localhost:8080/api/login', { email: this.email, password: this.password })
      .subscribe({
        next: (res) => {
          // Example: backend returns { role: 'USER' } or { role: 'ADMIN' }
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
        }
      });
  }
}
