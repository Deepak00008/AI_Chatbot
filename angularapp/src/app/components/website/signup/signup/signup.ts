import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-signup',
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
  standalone: true,
  imports: [FormsModule, RouterLink]
})
export class Signup {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  category: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private router: Router) {}

  signup() {
    if (!this.name || !this.email || !this.password || !this.confirmPassword || !this.category) {
      this.errorMessage = 'All fields are required';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    // Replace with API call
    this.successMessage = 'Registration successful!';
    setTimeout(() => this.router.navigate(['/user/login']), 1500);
  }
}
