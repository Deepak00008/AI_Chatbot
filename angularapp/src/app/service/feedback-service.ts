// src/app/services/feedback-service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feedback } from '../model/feedback/feedback-module';
import { PageResponse } from '../model/common/page-response';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private baseUrl = 'http://localhost:8083/api/feedbacks'; // update if your backend uses a different path

  constructor(private http: HttpClient) {}

  // Get all feedbacks with pagination
  getFeedbacks(page: number = 0, size: number = 5): Observable<PageResponse<Feedback>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'id,desc'); // Default sorting as per backend
    return this.http.get<PageResponse<Feedback>>(this.baseUrl, { params });
  }

  // Get feedback by ID
  getFeedbackById(id: number): Observable<Feedback> {
    return this.http.get<Feedback>(`${this.baseUrl}/${id}`);
  }

  // Get feedbacks by user ID with pagination
  getFeedbacksByUser(userId: number, page: number = 0, size: number = 5): Observable<PageResponse<Feedback>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'id,desc');
    return this.http.get<PageResponse<Feedback>>(`${this.baseUrl}/user/${userId}`, { params });
  }

  // Create new feedback
  createFeedback(feedback: Feedback): Observable<Feedback> {
    return this.http.post<Feedback>(this.baseUrl, feedback);
  }

  // Update existing feedback
  updateFeedback(id: number, feedback: Feedback): Observable<Feedback> {
    return this.http.put<Feedback>(`${this.baseUrl}/${id}`, feedback);
  }

  // Delete feedback
  deleteFeedback(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
