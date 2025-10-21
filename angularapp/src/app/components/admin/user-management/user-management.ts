import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../service/user-service';
import { User } from '../../../model/user/user-module';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagement implements OnInit, OnDestroy {

  users: User[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  lastRefreshTime: string = '';
  currentPage: number = 0;
  pageSize: number = 5;
  totalPages: number = 0;
  totalElements: number = 0;
  private refreshSubscription?: Subscription;
  private currentRequest: any = null;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    // Auto-refresh every 30 seconds
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadUsers();
    });
  }


  loadUsers(): void {
    console.log('Loading users for page:', this.currentPage);
    this.loadPageDirectly(this.currentPage);
  }

  private loadPageDirectly(page: number): void {
    console.log('Loading page directly:', page);
    this.isLoading = true;
    this.errorMessage = '';
    
    // Cancel any existing request
    if (this.currentRequest) {
      this.currentRequest.unsubscribe();
    }
    
    this.currentRequest = this.userService.getUsersPaginated(page, this.pageSize).subscribe({
      next: (data: any) => {
        console.log('Page loaded successfully:', data);
        
        this.users = data.content || [];
        this.totalPages = data.totalPages || 0;
        this.totalElements = data.totalElements || 0;
        this.isLoading = false;
        this.currentRequest = null;
        this.lastRefreshTime = new Date().toLocaleTimeString();
        this.cdr.detectChanges();
        console.log('Page load completed - users:', this.users.length);
      },
      error: (error) => {
        console.error('Error loading page:', error);
        this.errorMessage = 'Failed to load page. Please try again.';
        this.isLoading = false;
        this.currentRequest = null;
        this.cdr.detectChanges();
      }
    });
  }


  deleteUser(id: number): void {
    if (!confirm('Are you sure you want to delete this user?')) return;

    this.userService.deleteAccount(id).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.id !== id);
        this.totalElements--;
        console.log(`Deleted user with id: ${id}`);
        // Refresh the current page after deletion
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.errorMessage = 'Failed to delete user. Please try again.';
      }
    });
  }

  onPageChange(page: number): void {
    console.log('=== PAGINATION CLICKED ===');
    console.log('Requested page:', page);
    console.log('Current page before change:', this.currentPage);
    console.log('Total pages available:', this.totalPages);
    console.log('Is loading before change:', this.isLoading);
    
    // Simple validation
    if (page < 0 || page >= this.totalPages) {
      console.log('Page change ignored - invalid page number:', page);
      return;
    }
    
    console.log('Changing to page:', page);
    this.currentPage = page;
    console.log('Current page after setting:', this.currentPage);
    console.log('About to call loadPageDirectly...');
    this.loadPageDirectly(page);
    console.log('=== END PAGINATION CLICK ===');
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  refreshData(): void {
    console.log('Refreshing users data');
    this.currentPage = 0;
    this.loadUsers();
  }

  retryLoad(): void {
    console.log('Retrying to load users');
    this.errorMessage = '';
    this.loadUsers();
  }

  ngOnDestroy(): void {
    // Clean up any pending requests
    if (this.currentRequest) {
      this.currentRequest.unsubscribe();
    }
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
}
