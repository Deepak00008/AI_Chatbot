// src/app/services/user-service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/user/user-module';
import { ChangePasswordDTO } from '../dto/change-password.dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:8080/api/users'; // Backend base URL

  constructor(private http: HttpClient) {}

  // 🔹 Get all users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  // 🔹 Get a single user by ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  // 🔹 Create a new user
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.baseUrl, user);
  }

  // 🔹 Update an existing user
  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, user);
  }

  // 🔹 Update Profile
updateProfile(id: number, updatedUser: Partial<User>): Observable<User> {
  // Partial<User> allows you to only send the fields you want to update
  return this.http.put<User>(`${this.baseUrl}/${id}`, updatedUser);
}

  // 🔹 Get Profile by ID
  getProfile(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/profile/${id}`);
  }

  // 🔹 Upload Avatar
  uploadAvatar(id: number, file: File): Observable<User> {
    const formData = new FormData();
    formData.append('avatar', file);// 'avatar' must match @RequestPart name in backend
    return this.http.post<User>(`${this.baseUrl}/${id}/avatar`, formData);
  }

  // 🔹 Change Password
  changePassword(id: number, dto: ChangePasswordDTO): Observable<void> {
    
    return this.http.post<void>(`${this.baseUrl}/${id}/change-password`, dto);
  }

  // 🔹 Delete a user 
  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // -----------------------
  // 🔹 LocalStorage Helpers
  // -----------------------

  // Get current logged-in user (from localStorage)
  getCurrentUser(): User | null {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  // Update current user category locally
  updateUserCategory(category: string): void {
    const userData = this.getCurrentUser();
    if (userData) {
      userData.category = category;
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  }
}
