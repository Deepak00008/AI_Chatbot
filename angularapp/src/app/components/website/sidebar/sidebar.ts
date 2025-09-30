import { Component, Input, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../service/user-service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class UserSidebar {
  @Input() isCollapsed = false; // for collapsible sidebar
  @Output() openLastChat = new EventEmitter<void>();
  @Output() startNewChat = new EventEmitter<void>();
  @Output() openProfile = new EventEmitter<void>();
  
  user: any = {};
  private userService = inject(UserService);

  constructor() {
    this.loadUser();
  }

  loadUser() {
    this.userService.getUserById(this.user.id!).subscribe((data:any) => {
      this.user = data;
    });
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
}
