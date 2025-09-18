import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-feedback-management',
  templateUrl: './feedback-management.html',
  styleUrls: ['./feedback-management.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule]
})
export class FeedbackManagement implements OnInit {

  feedbacks: any[] = [];
  private apiUrl = 'http://localhost:8080/api/feedbacks';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadFeedbacks();
  }

  loadFeedbacks() {
    this.http.get<any[]>(this.apiUrl).subscribe(
      data => {
        this.feedbacks = data;
      },
      error => {
        console.error('Error loading feedbacks', error);
      }
    );
  }

  deleteFeedback(id: number) {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    this.http.delete(`${this.apiUrl}/${id}`).subscribe(
      () => {
        this.feedbacks = this.feedbacks.filter(f => f.id !== id);
      },
      error => {
        console.error('Error deleting feedback', error);
      }
    );
  }
}
