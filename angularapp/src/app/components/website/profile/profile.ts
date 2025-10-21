import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../../../service/user-service';
import { ChangePasswordDTO } from '../../../dto/change-password.dto';
import { AuthService } from '../../../service/auth-service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class UserProfile implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  user: any = {};
  avatarPreview: string | ArrayBuffer | null = null;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(private fb: FormBuilder, private userService: UserService, private authService: AuthService) {
    // Initialize forms immediately in constructor
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    // Get current user from AuthService
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = currentUser;
      
      // Try to load from backend if user has an ID
      if (currentUser.id) {
        this.userService.getUserById(currentUser.id).subscribe((data: any) => {
          this.user = data;
          if (this.profileForm) {
            this.profileForm.patchValue({
              email: data.email,
              username: data.username
            });
          }
          this.avatarPreview = this.getAvatarUrl(data.avatar) || this.getAvatarUrl(currentUser.avatar) || this.getDefaultAvatar();
        }, (error) => {
          console.error('Error loading user profile from database:', error);
          alert('Unable to load profile data. Please refresh the page.');
        });
      } else {
        // No backend ID - user needs to log in properly
        console.error('No user ID available for profile loading');
        alert('Unable to load profile. Please log out and log back in.');
      }
    } else {
      // No current user - redirect to login
      console.error('No user found in AuthService');
      alert('Please log in to access your profile.');
      window.location.href = '/login';
    }
  }


  onAvatarChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result;
        console.log('Avatar preview updated');
      };
      reader.readAsDataURL(file);

      // Try to upload to backend if available, but don't show error if it fails
      if (this.user?.id) {
        this.userService.uploadAvatar(this.user.id, file).subscribe(
          (response) => {
            console.log('Avatar uploaded to backend successfully');
            // Update the avatar preview with the correct URL from database
            if (response.avatar) {
              this.avatarPreview = this.getAvatarUrl(response.avatar);
              this.user.avatar = response.avatar;
            }
          },
          (error) => {
            console.log('Backend upload failed, but avatar saved locally');
            // Don't show error to user since local storage works
          }
        );
      }
    }
  }

  saveProfile() {
    if (this.profileForm.valid && this.user) {
      // Check if user has backend ID for API calls
      if (this.user.id) {
        const updatedData = {
          email: this.profileForm.value.email,
          username: this.profileForm.value.username
        };

        this.userService.updateProfile(this.user.id, updatedData).subscribe(
          (updatedUser) => {
            this.user = updatedUser;
            // Update AuthService with new data - create LoginResponse object
            const currentUser = this.authService.getCurrentUser();
            if (currentUser) {
              const updatedLoginResponse = {
                ...currentUser,
                email: updatedUser.email,
                username: updatedUser.username,
                avatar: updatedUser.avatar
              };
              // Update avatar preview if avatar was updated
              if (updatedUser.avatar) {
                this.avatarPreview = this.getAvatarUrl(updatedUser.avatar);
              }
              this.authService.updateUserData(updatedLoginResponse);
            }
            alert('Profile updated successfully!');
            console.log('Profile updated successfully');
          },
          (error) => {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
          }
        );
      } else {
        // No backend ID available - user needs to log in properly
        alert('Unable to update profile. Please log out and log back in.');
        console.error('No user ID available for profile update');
      }
    } else if (!this.user) {
      alert('Please log in to update your profile.');
    } else {
      alert('Please fill in all required fields correctly.');
    }
  }


  changePassword() {
    if (this.passwordForm.valid && this.user) {
      // Check if user has backend ID for API calls
      if (this.user.id) {
        const dto: ChangePasswordDTO = {
          currentPassword: this.passwordForm.value.currentPassword,
          newPassword: this.passwordForm.value.newPassword
        };

        this.userService.changePassword(this.user.id, dto).subscribe(
          () => {
            alert('Password changed successfully!');
            this.passwordForm.reset();
            // Reset password visibility toggles
            this.showCurrentPassword = false;
            this.showNewPassword = false;
            this.showConfirmPassword = false;
          },
          (error) => {
            console.error('Error changing password:', error);
            if (error.status === 400) {
              alert('Current password is incorrect. Please try again.');
            } else {
              alert('Failed to change password. Please try again.');
            }
          }
        );
      } else {
        // No backend ID available - password change requires backend
        alert('Password change requires backend connection. Please ensure you are properly logged in with a backend account.');
      }
    } else if (!this.user) {
      alert('Please log in to change your password.');
    } else {
      alert('Please fill in all password fields correctly.');
    }
  }


  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  deleteAccount() {
    if (this.user) {
      if (confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.')) {
        // Check if user has backend ID for API calls
        if (this.user.id) {
          this.userService.deleteAccount(this.user.id).subscribe(
            () => {
              alert('Account deleted successfully!');
              // Clear auth service and redirect to login
              this.authService.logout();
              window.location.href = '/login';
            },
            (error) => {
              console.error('Error deleting account:', error);
              alert('Failed to delete account. Please try again.');
            }
          );
        } else {
          // No backend ID - user needs to log in properly
          alert('Unable to delete account. Please log out and log back in.');
          console.error('No user ID available for account deletion');
        }
      }
    } else {
      alert('Please log in to delete your account.');
    }
  }

  private passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null : { passwordMismatch: true };
  }

  private getAvatarUrl(avatar: string | null | undefined): string | null {
    if (!avatar) return null;
    
    // If it's already a data URL (starts with 'data:'), return as is
    if (avatar.startsWith('data:')) {
      return avatar;
    }
    
    // If it's a relative path from backend, prepend the backend URL
    if (avatar.startsWith('/uploads/')) {
      return 'http://localhost:8083' + avatar;
    }
    
    // If it's already a full URL, return as is
    if (avatar.startsWith('http')) {
      return avatar;
    }
    
    // Default case - treat as relative path
    return 'http://localhost:8083/uploads/' + avatar;
  }

  private getDefaultAvatar(): string {
    // Create a simple default avatar using a data URL
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a gradient background
      const gradient = ctx.createLinearGradient(0, 0, 80, 80);
      gradient.addColorStop(0, '#4a90e2');
      gradient.addColorStop(1, '#357abd');
      
      // Draw circle background
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(40, 40, 40, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw user icon
      ctx.fillStyle = 'white';
      ctx.font = '32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👤', 40, 40);
    }
    
    return canvas.toDataURL();
  }
}
