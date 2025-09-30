import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../../../service/user-service';
import { ChangePasswordDTO } from '../../../dto/change-password.dto';
// import { AuthService } from '../../../service/auth-service';

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

  constructor(private fb: FormBuilder, private userService: UserService) {
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
    // Get current user from localStorage
    const userData = localStorage.getItem('userData');
    const currentUser = userData ? JSON.parse(userData) : null;
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
          this.avatarPreview = data.avatar || currentUser.avatar || this.getDefaultAvatar();
        }, (error) => {
          console.log('Backend not available, using auth service data');
          // Fallback to localStorage data
          this.loadFromLocalStorage();
        });
      } else {
        // No backend ID, use localStorage data directly
        this.loadFromLocalStorage();
      }
    } else {
      console.error('No user found in auth service');
      // Set default values
      if (this.profileForm) {
        this.profileForm.patchValue({
          email: '',
          username: ''
        });
      }
      this.avatarPreview = this.getDefaultAvatar();
    }
  }

  private loadFromLocalStorage() {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (this.profileForm) {
          this.profileForm.patchValue({
            email: user.email || '',
            username: user.username || ''
          });
        }
        this.avatarPreview = user.avatar || this.getDefaultAvatar();
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
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
        
        // Update user data in localStorage
        const currentUser = this.userService.getCurrentUser();
        if (currentUser) {
          currentUser.avatar = reader.result as string;
          localStorage.setItem('userData', JSON.stringify(currentUser));
          this.user.avatar = reader.result as string;
          console.log('Avatar updated locally');
        }
      };
      reader.readAsDataURL(file);

      // Try to upload to backend if available, but don't show error if it fails
      if (this.user?.id) {
        this.userService.uploadAvatar(this.user.id, file).subscribe(
          (response) => {
            console.log('Avatar uploaded to backend successfully');
            // Update localStorage with backend response if needed
            const currentUser = this.userService.getCurrentUser();
            if (currentUser && response.avatar) {
              currentUser.avatar = response.avatar;
              localStorage.setItem('userData', JSON.stringify(currentUser));
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
            // Update auth service with new data
            const userData = localStorage.getItem('userData');
            if (userData) {
              try {
                const currentUser = JSON.parse(userData);
                currentUser.email = updatedUser.email;
                currentUser.username = updatedUser.username;
                localStorage.setItem('userData', JSON.stringify(currentUser));
              } catch (error) {
                console.error('Error updating user data:', error);
              }
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
        // Update auth service only (no backend ID available)
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const currentUser = JSON.parse(userData);
            currentUser.email = this.profileForm.value.email;
            currentUser.username = this.profileForm.value.username;
            localStorage.setItem('userData', JSON.stringify(currentUser));
            this.user = currentUser;
          } catch (error) {
            console.error('Error updating user data:', error);
          }
          alert('Profile updated successfully!');
          console.log('Profile updated locally');
        }
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
            localStorage.removeItem('userData');
            window.location.href = '/login';
            },
            (error) => {
              console.error('Error deleting account:', error);
              alert('Failed to delete account. Please try again.');
            }
          );
        } else {
          // No backend ID - just clear auth service
          alert('Account deleted locally!');
          localStorage.removeItem('userData');
          window.location.href = '/login';
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
