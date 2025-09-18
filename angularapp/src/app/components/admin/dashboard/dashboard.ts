import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Navbar } from "../navbar/navbar";
import { Sidebar } from "../sidebar/sidebar";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  standalone: true,
  styleUrls: ['./dashboard.css'],
    imports: [RouterModule, Navbar, Sidebar, NgIf] 
})
export class DashboardComponent {

  adminName: string = 'Admin'; // You can fetch from login session
  isBaseAdminRoute: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = this.router.url;
        this.isBaseAdminRoute = currentUrl === '/admin';
      }
    });
  }

  // Navigation functions
  goToUsers() {
    this.router.navigate(['/admin/users']);
  }

  goToFeedbacks() {
    this.router.navigate(['/admin/feedbacks']);
  }

  goToIntents() {
    this.router.navigate(['/admin/intents']);
  }

  goToChatSessions() {
    this.router.navigate(['/admin/chatsessions']);
  }

  goToChatMessages() {
    this.router.navigate(['/admin/chatmessages']);
  }

  logout() {
    // TODO: clear session if using auth
    this.router.navigate(['/login']);
  }
}
