import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { UserSidebar } from '../../sidebar/sidebar';
import { UserProfile } from '../../profile/profile';
import { UserService } from '../../../../service/user-service';
import { AuthService } from '../../../../service/auth-service';
import { ChatSessionService } from '../../../../service/chat-session-service';
import { ChatMessageService } from '../../../../service/chat-message-service';
import { ChatSession } from '../../../../model/chat-session/chat-session-module';



@Component({
  selector: 'app-user-dashboard',
  templateUrl: './userdashboard.html',
  styleUrls: ['./userdashboard.css'],
  standalone: true,
  imports: [CommonModule,UserSidebar,UserProfile],
  providers: [DatePipe]
})
export class UserDashboard implements OnInit {
  @ViewChild('sidebar') sidebar!: UserSidebar;
  
  userName: string = 'User'; // Get from login session
  userCategory: string = '';
  showSessions: boolean = false;
  sessions: { id: string; dbId?: number; name: string; updated: number; messagesCount: number }[] = [];
  sidebarOpen: boolean = false;
  showProfile: boolean = false;
  showAbout: boolean = false;
  private userKey: string = 'guest';
  private userId: number | null = null;

  constructor(
    private router: Router, 
    private userService: UserService, 
    private authService: AuthService,
    private chatSessionService: ChatSessionService,
    private chatMessageService: ChatMessageService
  ) {
    this.loadUserData();
  }

  ngOnInit() {
    // Load sessions after user data is loaded
    if (this.userId) {
      this.loadSessions();
    } else {
      // Wait for user data to load, then load sessions
      setTimeout(() => {
        if (this.userId) {
          this.loadSessions();
        }
      }, 200);
    }
  }

  startNewChat() {
    const sessionId = this.generateSessionId();
    this.saveLastSessionId(sessionId);
    this.router.navigate([`/chat/${sessionId}`]);
  }

  openLastChat() {
    console.log('📂 Opening last chats, loading sessions...');
    console.log('📂 Current userId:', this.userId);
    
    // Ensure user data is loaded before loading sessions
    if (!this.userId) {
      console.log('⚠️ No userId found, reloading user data...');
      this.loadUserData();
      // Wait a bit for user data to load, then try again
      setTimeout(() => {
        if (this.userId) {
          this.loadSessions();
        } else {
          console.error('❌ Still no userId after reloading user data');
        }
      }, 100);
    } else {
      // User data is already loaded, proceed with loading sessions
      this.loadSessions();
    }
    
    this.showSessions = true;
  }

  openProfile() {
    this.showProfile = true;
  }

  logout() {
    console.log('🚪 User logging out, saving data to database...');
    
    // Save any pending data to database before logout
    this.saveAllDataToDatabase().then(() => {
      console.log('✅ All data saved to database successfully');
      
      // Clear user data from localStorage
      localStorage.removeItem('userData');
      this.router.navigate(['/login']);
    }).catch((error) => {
      console.error('❌ Error saving data to database during logout:', error);
      
      // Still proceed with logout even if save fails
      localStorage.removeItem('userData');
      this.router.navigate(['/login']);
    });
  }

  private async saveAllDataToDatabase(): Promise<void> {
    // This method ensures all user data is saved to database before logout
    // Currently, the chatpage component handles its own data persistence
    // This is a placeholder for any additional data that needs to be saved
    console.log('💾 Saving all user data to database...');
    
    // Add any additional data persistence logic here if needed
    // For now, the chatpage component's ngOnDestroy handles chat data
  }

  private generateSessionId(): string {
    return 's_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  private saveLastSessionId(id: string) {
    localStorage.setItem(`lastChatSessionId_${this.userKey}`, id);
  }

  private loadSessions() {
    console.log('🔄 Loading sessions for userId:', this.userId);
    if (this.userId) {
      console.log('📡 Making API call to get sessions for user:', this.userId);
      // Load sessions from database
      this.chatSessionService.getChatSessionsByUser(this.userId, 0, 100).subscribe({
        next: (response) => {
          console.log('📋 Raw sessions from database:', response.content.length, 'sessions');
          console.log('📋 Full response:', response);
          this.sessions = response.content.map(session => {
            console.log('📅 Processing session timestamp in dashboard:', session.startedAt, 'Type:', typeof session.startedAt);
            let updatedTime = 0;
            if (session.startedAt && session.startedAt.trim() !== '') {
              try {
                // Handle different timestamp formats
                let date: Date;
                if (typeof session.startedAt === 'string') {
                  // If it's a string, try to parse it
                  if (session.startedAt.includes('T')) {
                    // ISO format
                    date = new Date(session.startedAt);
                  } else {
                    // Custom format like "06-10-2025 12:40:41"
                    const parts = session.startedAt.split(' ');
                    if (parts.length === 2) {
                      const [datePart, timePart] = parts;
                      const [day, month, year] = datePart.split('-');
                      const [hour, minute, second] = timePart.split(':');
                      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
                    } else {
                      date = new Date(session.startedAt);
                    }
                  }
                } else {
                  date = new Date(session.startedAt);
                }
                
                // Check if the date is valid
                if (isNaN(date.getTime())) {
                  console.warn('⚠️ Invalid date parsed, using current time:', session.startedAt);
                  updatedTime = Date.now();
                } else {
                  updatedTime = date.getTime();
                  console.log('📅 Parsed timestamp in dashboard:', date, 'Time:', updatedTime);
                }
              } catch (error) {
                console.error('❌ Error parsing timestamp in dashboard:', session.startedAt, error);
                // Use current time as fallback
                updatedTime = Date.now();
              }
            } else {
              console.log('⚠️ No startedAt timestamp for session, using current time');
              updatedTime = Date.now();
            }
            
            return {
              id: session.sessionName || session.id?.toString() || '',
              dbId: session.id, // Store the actual database ID for updates
              name: session.sessionName || `Session ${session.id}`,
              updated: updatedTime,
              messagesCount: 0 // Will be updated by loadMessageCounts
            };
          }).sort((a, b) => b.updated - a.updated);
          console.log('✅ Loaded sessions from database:', this.sessions.length, 'sessions');
          console.log('📋 Session details:', this.sessions.map(s => ({ id: s.id, name: s.name, messages: s.messagesCount, updated: new Date(s.updated) })));
          
          // Load message counts for each session
          this.loadMessageCounts();
        },
        error: (error) => {
          console.error('❌ Error loading sessions from database:', error);
          console.error('❌ Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            url: error.url
          });
          this.loadSessionsFromLocalStorage();
        }
      });
    } else {
      console.log('❌ No userId found, falling back to localStorage');
      // Fallback to localStorage for users without database ID
      this.loadSessionsFromLocalStorage();
    }
  }

  private loadSessionsFromLocalStorage() {
    const prefix = `chat_session_${this.userKey}_`;
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
    const items = keys.map(k => {
      const raw = localStorage.getItem(k) || '[]';
      let count = 0;
      try { count = (JSON.parse(raw) as any[]).length; } catch {}
      const metaRaw = localStorage.getItem(k + '_meta');
      let updated = 0;
      let name = '';
      try {
        const meta = metaRaw ? JSON.parse(metaRaw) : {};
        updated = meta.updated || 0;
        name = meta.name || '';
      } catch {}
      const id = k.replace(prefix, '');
      if (!name) { name = `Session ${id.slice(-6)}`; }
      return { id, name, updated, messagesCount: count };
    });
    this.sessions = items.sort((a,b) => b.updated - a.updated);
    console.log('✅ Loaded sessions from localStorage:', this.sessions);
  }

  openSession(id: string) {
    // The id here is the sessionName from the database
    // We need to use it as the sessionId for the chat page
    this.saveLastSessionId(id);
    this.router.navigate(['/chat', id]);
  }
  deleteSession(sessionId: string) {
    console.log('🗑️ Deleting session:', sessionId);
    
    // Find the session in the current sessions list
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      console.error('❌ Session not found:', sessionId);
      return;
    }
    
    if (!session.dbId) {
      console.error('❌ No database ID found for session:', sessionId);
      alert('Cannot delete session: Database ID not found');
      return;
    }
    
    // Confirm deletion
    const confirmed = window.confirm(`Are you sure you want to delete the session "${session.name}"? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }
    
    console.log('🗑️ Deleting session from database:', {
      dbId: session.dbId,
      sessionName: session.name,
      userId: this.userId
    });
    
    // Delete session from database
    this.chatSessionService.deleteChatSession(session.dbId).subscribe({
      next: () => {
        console.log('✅ Session deleted successfully from database:', {
          dbId: session.dbId,
          sessionName: session.name
        });
        
        // Update local sessions list immediately
        this.sessions = this.sessions.filter(s => s.id !== sessionId);
        
        // Show success message
        alert(`Session "${session.name}" deleted successfully`);
      },
      error: (error) => {
        console.error('❌ Error deleting session from database:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        alert('Failed to delete session. Please try again.');
      }
    });
  }

  renameSession(sessionId: string) {
    console.log('🔄 Renaming session:', sessionId);
    
    // Find the session in the current sessions list
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      console.error('❌ Session not found:', sessionId);
      return;
    }
    
    if (!session.dbId) {
      console.error('❌ No database ID found for session:', sessionId);
      alert('Cannot rename session: Database ID not found');
      return;
    }
    
    const currentName = session.name;
    const proposed = window.prompt('Name this chat session', currentName);
    if (proposed === null) { 
      return; // User cancelled
    }
    
    const newName = proposed.trim();
    if (!newName) {
      alert('Session name cannot be empty');
      return;
    }
    
    if (newName === currentName) {
      console.log('📝 Session name unchanged');
      return;
    }
    
    console.log('📝 Updating session name from', currentName, 'to', newName);
    
    // Create updated session object
    const updatedSession: any = {
      sessionName: newName
      // Do not send startedAt/endedAt to avoid clearing them
    };
    
    // Update session in database
    console.log('📡 Sending rename request to database:', {
      dbId: session.dbId,
      oldName: currentName,
      newName: newName,
      userId: this.userId
    });
    
    this.chatSessionService.updateChatSession(session.dbId, updatedSession).subscribe({
      next: (updatedDbSession) => {
        console.log('✅ Session renamed successfully in database:', {
          id: updatedDbSession.id,
          sessionName: updatedDbSession.sessionName,
          startedAt: updatedDbSession.startedAt
        });
        
        // Update local sessions list immediately
        const sessionIndex = this.sessions.findIndex(s => s.id === sessionId);
        if (sessionIndex !== -1) {
          this.sessions[sessionIndex].name = newName;
          this.sessions[sessionIndex].id = newName; // Update the ID to match the new name
        }
        
        // Show success message
        alert(`Session renamed to "${newName}"`);
      },
      error: (error) => {
        console.error('❌ Error renaming session in database:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        alert('Failed to rename session. Please try again.');
      }
    });
  }

  closeSessions() {
    this.showSessions = false;
  }

  refreshSessions() {
    console.log('🔄 Refreshing sessions list...');
    this.loadSessions();
  }

  cleanupInvalidSessions() {
    console.log('🧹 Starting cleanup of invalid sessions...');
    if (this.userId) {
      this.chatSessionService.getChatSessionsByUser(this.userId, 0, 100).subscribe({
        next: (response) => {
          console.log('📊 Found', response.content.length, 'sessions in database');
          
          // Filter out sessions with invalid timestamps or empty data
          const validSessions = response.content.filter(session => {
            const hasValidTimestamp = session.startedAt && 
                                    session.startedAt.trim() !== '' && 
                                    !isNaN(new Date(session.startedAt).getTime());
            const hasValidName = session.sessionName && session.sessionName.trim() !== '';
            
            if (!hasValidTimestamp || !hasValidName) {
              console.log('🗑️ Found invalid session:', {
                id: session.id,
                sessionName: session.sessionName,
                startedAt: session.startedAt,
                hasValidTimestamp,
                hasValidName
              });
            }
            
            return hasValidTimestamp && hasValidName;
          });
          
          console.log('✅ Valid sessions:', validSessions.length, 'Invalid sessions:', response.content.length - validSessions.length);
          
          if (validSessions.length !== response.content.length) {
            console.log('🧹 Some sessions have invalid data. Consider cleaning up the database.');
            alert(`Found ${response.content.length - validSessions.length} invalid sessions. Check console for details.`);
          } else {
            console.log('✅ All sessions have valid data.');
            alert('All sessions have valid data.');
          }
        },
        error: (error) => {
          console.error('❌ Error during session cleanup:', error);
          alert('Error during session cleanup. Please try again.');
        }
      });
    } else {
      console.log('❌ Cannot cleanup: No userId');
      alert('Cannot cleanup: No user ID found.');
    }
  }

  private loadMessageCounts() {
    // Load message counts for each session using the chat message service directly
    let completedCount = 0;
    const totalSessions = this.sessions.length;
    
    this.sessions.forEach((session, index) => {
      if (session.dbId) {
        console.log(`📊 Loading message count for session ${session.id} (dbId: ${session.dbId})`);
        
        // Use the chat message service to get count directly
        this.chatMessageService.getMessagesBySession(session.dbId, 0, 1000).subscribe({
          next: (msgResponse) => {
            this.sessions[index].messagesCount = msgResponse.content.length;
            console.log(`📊 Session ${session.id} has ${msgResponse.content.length} messages`);
            
            completedCount++;
            if (completedCount === totalSessions) {
              console.log('✅ All message counts loaded successfully');
              console.log('📋 Final sessions with message counts:', this.sessions.map(s => ({ 
                id: s.id, 
                name: s.name, 
                messages: s.messagesCount, 
                updated: new Date(s.updated) 
              })));
            }
          },
          error: (error) => {
            console.error(`❌ Error loading message count for session ${session.id}:`, error);
            this.sessions[index].messagesCount = 0;
            
            completedCount++;
            if (completedCount === totalSessions) {
              console.log('✅ All message counts processed (some with errors)');
            }
          }
        });
      } else {
        console.log(`📊 No dbId for session ${session.id}, setting message count to 0`);
        this.sessions[index].messagesCount = 0;
        
        completedCount++;
        if (completedCount === totalSessions) {
          console.log('✅ All message counts processed');
        }
      }
    });
  }

  closeProfile() {
    this.showProfile = false;
    // Refresh sidebar to show updated avatar
    if (this.sidebar) {
      this.sidebar.refreshUser();
    }
  }

  openAbout() {
    this.showAbout = true;
  }
  closeAbout() {
    this.showAbout = false;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  private loadUserData() {
    const currentUser = this.authService.getCurrentUser();
    console.log('🔍 Loading user data, currentUser:', currentUser);
    if (currentUser) {
      this.userName = currentUser.username || 'User';
      this.userCategory = currentUser.category || '';
      this.userId = currentUser.id || null;
      const rawKey = currentUser.email || currentUser.username || 'guest';
      this.userKey = String(rawKey).toLowerCase().replace(/[^a-z0-9]+/g, '_');
      console.log('✅ User data loaded from AuthService:', { userId: this.userId, userName: this.userName });
    } else {
      // Fallback to localStorage for backward compatibility
      const userData = localStorage.getItem('userData');
      console.log('🔍 No currentUser, checking localStorage:', userData);
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.userName = user.username || 'User';
          this.userCategory = user.category || '';
          this.userId = user.id || null;
          const rawKey = user.email || user.username || 'guest';
          this.userKey = String(rawKey).toLowerCase().replace(/[^a-z0-9]+/g, '_');
          console.log('✅ User data loaded from localStorage:', { userId: this.userId, userName: this.userName });
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      } else {
        console.log('❌ No user data found in localStorage');
      }
    }
  }

  getCategorySpecificContent() {
    switch (this.userCategory) {
      case 'student':
        return {
          title: 'Student Dashboard',
          description: 'Access educational resources, study materials, and academic support.',
          features: [
            'Study assistance and homework help',
            'Academic resource recommendations',
            'Exam preparation support',
            'Research and citation help'
          ]
        };
      case 'employee':
        return {
          title: 'Employee Dashboard',
          description: 'Boost your productivity with workplace tools and professional development.',
          features: [
            'Workplace productivity tips',
            'Professional development resources',
            'Meeting and project assistance',
            'Career advancement guidance'
          ]
        };
      case 'teacher':
        return {
          title: 'Teacher Dashboard',
          description: 'Enhance your teaching with educational tools and classroom management.',
          features: [
            'Lesson planning assistance',
            'Student assessment tools',
            'Educational resource library',
            'Classroom management tips'
          ]
        };
      case 'business':
        return {
          title: 'Business Professional Dashboard',
          description: 'Grow your business with strategic insights and professional tools.',
          features: [
            'Business strategy consultation',
            'Market analysis assistance',
            'Financial planning support',
            'Networking and partnership guidance'
          ]
        };
      case 'farmer':
        return {
          title: 'Farmer Dashboard',
          description: 'Optimize your farming operations with agricultural insights and support.',
          features: [
            'Crop management assistance',
            'Weather and seasonal guidance',
            'Agricultural best practices',
            'Market and pricing information'
          ]
        };
      default:
        return {
          title: 'Welcome to AI ChatBot',
          description: 'Get personalized assistance tailored to your needs.',
          features: [
            'General knowledge and information',
            'Problem-solving assistance',
            'Creative and analytical support',
            'Personalized recommendations'
          ]
        };
    }
  }

  onFeatureClick(prompt: string) {
    const sessionId = this.generateSessionId();
    const url = ['/chat', sessionId];
    const extras = { queryParams: { q: prompt } } as const;
    this.router.navigate(url, extras);
  }
}
