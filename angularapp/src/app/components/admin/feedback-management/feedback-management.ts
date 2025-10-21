import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../../service/feedback-service';
import { Feedback } from '../../../model/feedback/feedback-module';

@Component({
  selector: 'app-feedback-management',
  templateUrl: './feedback-management.html',
  styleUrls: ['./feedback-management.css'],
  standalone: true,
  imports: [CommonModule]
})
export class FeedbackManagement implements OnInit, OnDestroy {

  feedbacks: Feedback[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  currentPage: number = 0;
  pageSize: number = 5;
  totalPages: number = 0;
  totalElements: number = 0;
  private currentRequest: any = null;

  constructor(
    private feedbackService: FeedbackService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadFeedbacks();
  }

  loadFeedbacks() {
    console.log('Loading feedbacks for page:', this.currentPage);
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
    
    this.currentRequest = this.feedbackService.getFeedbacks(page, this.pageSize).subscribe({
      next: (data: any) => {
        console.log('Page loaded successfully:', data);
        
        this.feedbacks = data.content || [];
        this.totalPages = data.totalPages || 0;
        this.totalElements = data.totalElements || 0;
        this.isLoading = false;
        this.currentRequest = null;
        this.cdr.detectChanges();
        console.log('Page load completed - feedbacks:', this.feedbacks.length);
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

  deleteFeedback(id: number) {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    this.feedbackService.deleteFeedback(id).subscribe({
      next: () => {
        this.feedbacks = this.feedbacks.filter(f => f.id !== id);
        this.totalElements--;
        console.log(`Deleted feedback with id: ${id}`);
        // Refresh the current page after deletion
        this.loadFeedbacks();
      },
      error: (error) => {
        console.error('Error deleting feedback', error);
        this.errorMessage = 'Failed to delete feedback. Please try again.';
      }
    });
  }

  refreshData(): void {
    console.log('Refreshing feedbacks data');
    this.currentPage = 0;
    this.loadFeedbacks();
  }

  retryLoad(): void {
    console.log('Retrying to load feedbacks');
    this.errorMessage = '';
    this.loadFeedbacks();
  }

  ngOnDestroy(): void {
    // Clean up any pending requests
    if (this.currentRequest) {
      this.currentRequest.unsubscribe();
    }
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
}
