import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feedback-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback.html',
  styleUrls: ['./feedback.css']
})
export class FeedbackPage {
  rating: number = 0;
  text: string = '';

  setRating(n: number) { this.rating = n; }

  constructor(private router: Router) {}

  submit() {
    // TODO: send to backend
    alert(`Thanks for your feedback! Rating: ${this.rating}, Text: ${this.text}`);
    // Navigate to login after submit
    this.router.navigate(['/login']);
  }
}


