import { Component, Input, inject, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../service/user-service';
import { AuthService } from '../../../service/auth-service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class UserSidebar implements OnInit {
  @Input() isCollapsed = false; // for collapsible sidebar
  @Output() openLastChat = new EventEmitter<void>();
  @Output() startNewChat = new EventEmitter<void>();
  @Output() openProfile = new EventEmitter<void>();
  
  user: any = {};
  avatarUrl: string | null = null;
  currentYear: number = new Date().getFullYear();
  private userService = inject(UserService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    try {
      // Get current user from AuthService
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.user = currentUser;
        this.avatarUrl = this.getAvatarUrl(currentUser.avatar);
        
        // Try to load from backend if user has an ID
        if (currentUser.id) {
          this.userService.getUserById(currentUser.id).subscribe((data: any) => {
            this.user = { ...this.user, ...data };
            this.avatarUrl = this.getAvatarUrl(data.avatar || currentUser.avatar);
          }, (error) => {
            console.log('Backend not available, using auth service data');
            // Keep using current user data
          });
        }
      } else {
        // Fallback to localStorage for backward compatibility
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            this.user = user;
            this.avatarUrl = this.getAvatarUrl(user.avatar);
          } catch (error) {
            console.error('Error parsing user data:', error);
            this.setDefaultUser();
          }
        } else {
          this.setDefaultUser();
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      this.setDefaultUser();
    }
  }

  private setDefaultUser() {
    this.user = {
      username: 'User',
      email: 'user@example.com',
      fullName: 'User'
    };
    this.avatarUrl = null;
  }

  triggerOpenLastChat() {
    this.openLastChat.emit();
  }

  triggerStartNewChat() {
    this.startNewChat.emit();
  }
  

  triggerOpenProfile() {
    this.openProfile.emit();
  }

  // Method to refresh user data (can be called from parent component)
  refreshUser() {
    this.loadUser();
  }

  // Footer action methods
  openHelp(event: Event) {
    event.preventDefault();
    // You can implement help modal or redirect to help page
    window.open('mailto:support@aichatbot.com?subject=Help Request', '_blank');
  }

  openContact(event: Event) {
    event.preventDefault();
    // You can implement contact modal or redirect to contact page
    window.open('mailto:contact@aichatbot.com?subject=Contact Request', '_blank');
  }

  openPrivacy(event: Event) {
    event.preventDefault();
    // You can implement privacy policy modal or redirect to privacy page
    alert('Privacy Policy: We respect your privacy and protect your data. All conversations are encrypted and stored securely.');
  }

  openTerms(event: Event) {
    event.preventDefault();
    // You can implement terms of service modal or redirect to terms page
    alert('Terms of Service: By using this application, you agree to our terms of service. Please use responsibly and in accordance with applicable laws.');
  }

  private getAvatarUrl(avatar: string | null | undefined): string | null {
    if (!avatar) return null;
    
    // If it's already a data URL (starts with 'data:'), return as is
    if (avatar.startsWith('data:')) {
      return avatar;
    }
    
    // If it's a relative path from backend, prepend the backend URL
    if (avatar.startsWith('/uploads/')) {
      return 'http://localhost:8083' + avatar;
    }
    
    // If it's already a full URL, return as is
    if (avatar.startsWith('http')) {
      return avatar;
    }
    
    // Default case - treat as relative path
    return 'http://localhost:8083/uploads/' + avatar;
  }

  getDefaultAvatar(): string {
    // Create a simple default avatar using a data URL
    const canvas = document.createElement('canvas');
    canvas.width = 60;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a gradient background
      const gradient = ctx.createLinearGradient(0, 0, 60, 60);
      gradient.addColorStop(0, '#4a90e2');
      gradient.addColorStop(1, '#357abd');
      
      // Draw circle background
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(30, 30, 30, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw user icon
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👤', 30, 30);
    }
    
    return canvas.toDataURL();
  }
}
