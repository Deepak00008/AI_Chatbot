// src/app/services/intent-service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Intent } from '../model/intent/intent-module';

@Injectable({
  providedIn: 'root'
})
export class IntentService {
  private baseUrl = 'http://localhost:8080/api/intents'; // adjust if your backend uses a different path

  constructor(private http: HttpClient) {}

  // Get all intents
  getIntents(): Observable<Intent[]> {
    return this.http.get<Intent[]>(this.baseUrl);
  }

  // Get intent by ID
  getIntentById(id: number): Observable<Intent> {
    return this.http.get<Intent>(`${this.baseUrl}/${id}`);
  }

  // Create new intent
  createIntent(intent: Intent): Observable<Intent> {
    return this.http.post<Intent>(this.baseUrl, intent);
  }

  // Update existing intent
  updateIntent(id: number, intent: Intent): Observable<Intent> {
    return this.http.put<Intent>(`${this.baseUrl}/${id}`, intent);
  }

  // Delete intent
  deleteIntent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Get response by keyword (matches backend endpoint)
  getResponseByKeyword(keyword: string): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}/keyword/${keyword}`);
  }
}
