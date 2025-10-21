// src/app/services/chatsession-service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatSession } from '../model/chat-session/chat-session-module';
import { PageResponse } from '../model/common/page-response';

@Injectable({
  providedIn: 'root'
})
export class ChatSessionService {
  private baseUrl = 'http://localhost:8083/api/chatsessions';

  constructor(private http: HttpClient) {}

  // Get all chat sessions with pagination (matches backend)
  getChatSessions(page: number = 0, size: number = 10): Observable<PageResponse<ChatSession>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<ChatSession>>(this.baseUrl, { params });
  }

  // Get a single chat session by ID
  getChatSessionById(id: number): Observable<ChatSession> {
    return this.http.get<ChatSession>(`${this.baseUrl}/${id}`);
  }

  // Get chat sessions by user ID with pagination (matches backend endpoint)
  getChatSessionsByUser(userId: number, page: number = 0, size: number = 10): Observable<PageResponse<ChatSession>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<ChatSession>>(`${this.baseUrl}/user/${userId}`, { params });
  }

  // Create a new chat session (original method - may not work with backend)
  createChatSession(session: ChatSession): Observable<ChatSession> {
    return this.http.post<ChatSession>(this.baseUrl, session);
  }

  // Create chat session for specific user (matches backend endpoint)
  createChatSessionForUser(userId: number, session: ChatSession): Observable<ChatSession> {
    return this.http.post<ChatSession>(`${this.baseUrl}/user/${userId}`, session);
  }

  // Update an existing chat session
  updateChatSession(id: number, session: ChatSession): Observable<ChatSession> {
    return this.http.put<ChatSession>(`${this.baseUrl}/${id}`, session);
  }

  // Delete a chat session
  deleteChatSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // End a chat session (set endedAt timestamp)
  endChatSession(id: number): Observable<ChatSession> {
    return this.http.put<ChatSession>(`${this.baseUrl}/${id}/end`, {});
  }
}
