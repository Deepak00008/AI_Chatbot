import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FeedbackService } from '../../../service/feedback-service';
import { AuthService } from '../../../service/auth-service';
import { Feedback } from '../../../model/feedback/feedback-module';

@Component({
  selector: 'app-feedback-page',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './feedback.html',
  styleUrls: ['./feedback.css']
})
export class FeedbackPage {
  rating: number = 0;
  text: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;

  setRating(n: number) { this.rating = n; }

  constructor(
    private router: Router, 
    private feedbackService: FeedbackService,
    private authService: AuthService
  ) {
    // Ensure user data is loaded from localStorage
    this.loadUserData();
  }

  private loadUserData() {
    // Force reload user data from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.authService.updateUserData(user);
        console.log('User data loaded from localStorage:', user);
      } catch (error) {
        console.error('Error loading user data from localStorage:', error);
      }
    }
  }

  submit() {
    if (!this.text.trim()) {
      this.errorMessage = 'Please enter your feedback message';
      return;
    }

    if (this.rating === 0) {
      this.errorMessage = 'Please select a rating';
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    const isLoggedIn = this.authService.isLoggedIn();
    console.log('Current user:', currentUser); // Debug log
    console.log('Is logged in:', isLoggedIn); // Debug log

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Create feedback object - allow anonymous feedback if user is not logged in
    let feedback: Feedback;
    
    if (currentUser && isLoggedIn) {
      // Convert LoginResponse to User format for the feedback
      const userForFeedback = {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        category: currentUser.category,
        role: currentUser.role,
        avatar: currentUser.avatar
      };

      feedback = {
        message: this.text,
        rating: this.rating,
        user: userForFeedback
      };
    } else {
      // Anonymous feedback
      feedback = {
        message: this.text,
        rating: this.rating,
        user: undefined
      };
    }

    this.feedbackService.createFeedback(feedback).subscribe({
      next: (response) => {
        this.successMessage = 'Thank you for your feedback!';
        this.isSubmitting = false;
        // Clear form
        this.text = '';
        this.rating = 0;
        // Navigate after a short delay - only if user is logged in
        if (currentUser && isLoggedIn) {
          setTimeout(() => {
            this.router.navigate(['/user']);
          }, 2000);
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to submit feedback. Please try again.';
        this.isSubmitting = false;
        console.error('Feedback submission error:', err);
      }
    });
  }
}


