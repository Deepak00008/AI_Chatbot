import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-intent-management',
  templateUrl: './intent-management.html',
  styleUrls: ['./intent-management.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule]  // ✅ Ensure all modules are imported
})
export class IntentManagement implements OnInit {

  intents: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;
  showAddForm: boolean = false;
  isSubmitting: boolean = false;
  
  // Form data for adding new intent
  newIntent = {
    name: '',
    keyword: '',
    response: ''
  };
  
  private apiUrl = 'http://localhost:8080/api/intents';  // Replace with your backend API endpoint

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadIntents();
  }

  loadIntents() {
    this.isLoading = true;
    this.errorMessage = '';
    console.log('Loading intents from:', this.apiUrl);
    
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        console.log('Intents loaded:', data);
        this.intents = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading intents', error);
        this.errorMessage = 'Failed to load intents. Please check if the backend is running.';
        this.intents = []; // Ensure intents array is empty on error
        this.isLoading = false;
      }
    });
  }

  deleteIntent(id: number) {
    if (!confirm('Are you sure you want to delete this intent?')) return;

    this.http.delete(`${this.apiUrl}/${id}`).subscribe(
      () => {
        this.intents = this.intents.filter(intent => intent.id !== id);
      },
      error => {
        console.error('Error deleting intent', error);
      }
    );
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

    this.http.post<any>(this.apiUrl, this.newIntent).subscribe({
      next: (response) => {
        console.log('Intent added successfully:', response);
        this.intents.push(response); // Add to local array
        this.resetForm();
        this.showAddForm = false;
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error adding intent:', error);
        this.errorMessage = 'Failed to add intent. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
