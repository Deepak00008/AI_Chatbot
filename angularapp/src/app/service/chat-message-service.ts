// src/app/services/chatmessage-service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessage } from '../model/chat-message/chat-message-module';
import { PageResponse } from '../model/common/page-response';

@Injectable({
  providedIn: 'root'
})
export class ChatMessageService {
  private baseUrl = 'http://localhost:8080/api/chatmessages';

  constructor(private http: HttpClient) {}

  // Get all chat messages
  getChatMessages(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(this.baseUrl);
  }

  // Get chat message by ID
  getChatMessageById(id: number): Observable<ChatMessage> {
    return this.http.get<ChatMessage>(`${this.baseUrl}/${id}`);
  }

  // Get messages by session ID with pagination (matches backend endpoint)
  getMessagesBySession(sessionId: number, page: number = 0, size: number = 5): Observable<PageResponse<ChatMessage>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<ChatMessage>>(`${this.baseUrl}/session/${sessionId}`, { params });
  }

  // Create a new chat message (original method - may not work with backend)
  createChatMessage(message: ChatMessage): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(this.baseUrl, message);
  }

  // Create chat message with session and intent (matches backend endpoint)
  createChatMessageWithSessionAndIntent(
    sessionId: number, 
    intentId: number, 
    message: ChatMessage
  ): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.baseUrl}/session/${sessionId}/intent/${intentId}`, message);
  }

  // Update an existing chat message
  updateChatMessage(id: number, message: ChatMessage): Observable<ChatMessage> {
    return this.http.put<ChatMessage>(`${this.baseUrl}/${id}`, message);
  }

  // Delete a chat message
  deleteChatMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
