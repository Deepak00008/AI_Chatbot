import { Component } from '@angular/core';
import { Router } from '@angular/router'; // If you want to navigate to login page

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'] // corrected from styleUrl to styleUrls
})
export class Navbar {
  constructor(private router: Router) {} // optional, only if using router navigation

  logout(): void {
    // Clear stored user session data
    localStorage.removeItem('userToken'); // example
    localStorage.removeItem('userInfo');

    console.log('User logged out');

    // Navigate to login page using Router
    this.router.navigate(['/login']);

    // OR, if you don't want to use Router:
    // window.location.href = '/login'; 
  }

}
