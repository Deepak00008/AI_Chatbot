// src/app/service/auth-service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  category: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  category: string;
  avatar?: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8083/api/auth';
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in (from localStorage)
    this.loadUserFromStorage();
  }

  // Login user
  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, loginRequest)
      .pipe(
        tap(response => {
          // Store user data in localStorage
          localStorage.setItem('userData', JSON.stringify(response));
          this.currentUserSubject.next(response);
        })
      );
  }

  // Register user
  register(registerRequest: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/register`, registerRequest)
      .pipe(
        tap(response => {
          // Store user data in localStorage
          localStorage.setItem('userData', JSON.stringify(response));
          this.currentUserSubject.next(response);
        })
      );
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('userData');
    this.currentUserSubject.next(null);
  }

  // Get current user
  getCurrentUser(): LoginResponse | null {
    // First try to get from current subject
    let user = this.currentUserSubject.value;
    
    // If not available, try to load from localStorage
    if (!user) {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          user = JSON.parse(userData);
          // Update the subject with the loaded user
          this.currentUserSubject.next(user);
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
          localStorage.removeItem('userData');
        }
      }
    }
    
    return user;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  // Load user from localStorage on service initialization
  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('userData');
      }
    }
  }

  // Update user data in localStorage and current subject
  updateUserData(userData: LoginResponse): void {
    localStorage.setItem('userData', JSON.stringify(userData));
    this.currentUserSubject.next(userData);
  }
}
