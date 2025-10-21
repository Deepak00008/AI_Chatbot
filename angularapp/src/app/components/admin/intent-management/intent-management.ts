import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IntentService } from '../../../service/intent-service';
import { Intent } from '../../../model/intent/intent-module';

@Component({
  selector: 'app-intent-management',
  templateUrl: './intent-management.html',
  styleUrls: ['./intent-management.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class IntentManagement implements OnInit, OnDestroy {

  intents: Intent[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;
  showAddForm: boolean = false;
  isSubmitting: boolean = false;
  currentPage: number = 0;
  pageSize: number = 5;
  totalPages: number = 0;
  totalElements: number = 0;
  private currentRequest: any = null;
  
  // Form data for adding new intent
  newIntent = {
    name: '',
    keyword: '',
    response: ''
  };

  constructor(
    private intentService: IntentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadIntents();
  }

  loadIntents() {
    console.log('Loading intents for page:', this.currentPage);
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
    
    this.currentRequest = this.intentService.getIntentsPaginated(page, this.pageSize).subscribe({
      next: (data: any) => {
        console.log('Page loaded successfully:', data);
        
        this.intents = data.content || [];
        this.totalPages = data.totalPages || 0;
        this.totalElements = data.totalElements || 0;
        this.isLoading = false;
        this.currentRequest = null;
        this.cdr.detectChanges();
        console.log('Page load completed - intents:', this.intents.length);
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

  deleteIntent(id: number) {
    if (!confirm('Are you sure you want to delete this intent?')) return;

    this.intentService.deleteIntent(id).subscribe({
      next: () => {
        this.intents = this.intents.filter(intent => intent.id !== id);
        this.totalElements--;
        console.log(`Deleted intent with id: ${id}`);
        // Refresh the current page after deletion
        this.loadIntents();
      },
      error: (error) => {
        console.error('Error deleting intent', error);
        this.errorMessage = 'Failed to delete intent. Please try again.';
      }
    });
  }

  // Add new intent methods
  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.newIntent = {
      name: '',
      keyword: '',
      response: ''
    };
    this.errorMessage = '';
  }

  addIntent() {
    // Validate form
    if (!this.newIntent.name.trim() || !this.newIntent.keyword.trim() || !this.newIntent.response.trim()) {
      this.errorMessage = 'All fields are required';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const intentData: Intent = {
      name: this.newIntent.name.trim(),
      keyword: this.newIntent.keyword.trim(),
      response: this.newIntent.response.trim()
    };

    this.intentService.createIntent(intentData).subscribe({
      next: (response) => {
        console.log('Intent added successfully:', response);
        this.totalElements++;
        this.resetForm();
        this.showAddForm = false;
        this.isSubmitting = false;
        // Refresh the current page after adding
        this.loadIntents();
      },
      error: (error) => {
        console.error('Error adding intent:', error);
        this.errorMessage = 'Failed to add intent. Please try again.';
        this.isSubmitting = false;
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
    console.log('Refreshing intents data');
    this.currentPage = 0;
    this.loadIntents();
  }

  retryLoad(): void {
    console.log('Retrying to load intents');
    this.errorMessage = '';
    this.loadIntents();
  }

  ngOnDestroy(): void {
    // Clean up any pending requests
    if (this.currentRequest) {
      this.currentRequest.unsubscribe();
    }
  }
}
