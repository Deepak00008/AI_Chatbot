import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-intent-management',
  templateUrl: './intent-management.html',
  styleUrls: ['./intent-management.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule]  // ✅ Ensure both modules are imported
})
export class IntentManagement implements OnInit {

  intents: any[] = [];
  private apiUrl = 'http://localhost:8080/api/intents';  // Replace with your backend API endpoint

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadIntents();
  }

  loadIntents() {
    this.http.get<any[]>(this.apiUrl).subscribe(
      data => {
        this.intents = data;
      },
      error => {
        console.error('Error loading intents', error);
      }
    );
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
}
