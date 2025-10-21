import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../service/user-service';
import { AuthService } from '../../../../service/auth-service';
import { UserSidebar } from '../../sidebar/sidebar';
import { UserProfile } from '../../profile/profile';
import { ChatSessionService } from '../../../../service/chat-session-service';
import { ChatMessageService } from '../../../../service/chat-message-service';
import { ChatSession } from '../../../../model/chat-session/chat-session-module';
import { ChatMessage } from '../../../../model/chat-message/chat-message-module';
import { timeout, catchError, of, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-user-chat',
  templateUrl: './chatpage.html',
  styleUrls: ['./chatpage.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, UserSidebar, UserProfile]
})
export class ChatPage implements OnDestroy {
  messages: { sender: string, text: string, id?: number }[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  sessionId: string | null = null;
  userName: string = 'User';
  userCategory: string = '';
  userId: number | null = null;
  // Sidebar & sessions modal state (mirrors UserDashboard)
  showSessions: boolean = false;
  sessions: { id: string; dbId?: number; name: string; updated: number; messagesCount: number }[] = [];
  sidebarOpen: boolean = false;
  showProfile: boolean = false;
  showAbout: boolean = false;
  public userKey: string = 'guest';
  private currentDbSessionId: number | null = null;
  private lastSavedMessageCount: number = 0; // Track how many messages have been saved

  private apiUrl = 'http://localhost:8083/api/chat'; // Backend chat API

  constructor(
    private http: HttpClient, 
    private route: ActivatedRoute, 
    private router: Router, 
    private userService: UserService, 
    private authService: AuthService,
    private chatSessionService: ChatSessionService,
    private chatMessageService: ChatMessageService,
    private cdr: ChangeDetectorRef
  ) {
    // Ensure userKey is available before loading sessions
    this.loadUserData();
    this.route.paramMap.subscribe(params => {
      const id = params.get('sessionId');
      this.sessionId = id;
      this.loadSession();
    });

    this.route.queryParamMap.subscribe(params => {
      const q = params.get('q');
      if (q && !this.isLoading) {
        // If there's a prompt, seed it as user's first message and send
        this.userInput = q;
        // Avoid duplicating if already present
        const alreadySeeded = this.messages.length > 0 && this.messages[0]?.text === q;
        if (!alreadySeeded) {
          setTimeout(() => this.sendMessage(), 0);
        }
      }
    });
  }

  // paragraph-only rendering (points formatting removed per request)

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    // Show user's message immediately
    this.messages.push({ sender: 'USER', text: this.userInput.trim() });

    const userMessage = this.userInput.trim();
    this.userInput = '';
    this.isLoading = true;

    // Manually trigger change detection to ensure UI updates
    this.cdr.detectChanges();

    // Scroll to bottom to show user message
    this.scrollToBottom();

    // Set up a delayed loading indicator (only shows if response takes > 1 second)
    let loadingTimeout: any;
    loadingTimeout = setTimeout(() => {
      if (this.isLoading) {
        this.messages.push({ sender: 'BOT', text: 'Thinking...' });
        // Manually trigger change detection to ensure UI updates
        this.cdr.detectChanges();
        this.scrollToBottom();
      }
    }, 1000);

    // Send message to backend API with optional sessionId and userId
    console.log('Sending message to:', this.apiUrl, 'Message:', userMessage);
    this.http.post<{ reply: string }>(this.apiUrl, { 
      message: userMessage, 
      sessionId: this.sessionId,
      userId: this.userId 
    })
      .pipe(
        timeout(30000), // 30 second timeout
        catchError((error: HttpErrorResponse) => {
          console.error('HTTP Error:', error);
          if ((error as any).name === 'TimeoutError') {
            return of({ reply: 'Sorry, the request timed out. Please try again.' });
          } else if (error.status === 0 || error.status >= 500) {
            return of({ reply: 'The backend service is currently unavailable. Please try again later or contact support.' });
          }
          return of({ reply: 'Sorry, I encountered an error. Please try again.' });
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Chat response received:', response);
          // Clear the loading timeout
          clearTimeout(loadingTimeout);
          // Remove any loading message that might have appeared
          this.messages = this.messages.filter(msg => msg.text !== 'Thinking...');
          this.messages.push({ sender: 'BOT', text: response.reply });
          this.isLoading = false;
          
          // Save both user and bot messages to database
          this.saveMessagesToDatabase();
          
          // Manually trigger change detection to ensure UI updates
          this.cdr.detectChanges();
          
          // Scroll to bottom to show new message
          this.scrollToBottom();
          // Focus back on input field
          this.focusInput();
        },
        error: (error) => {
          console.error('Chat API error:', error);
          // Clear the loading timeout
          clearTimeout(loadingTimeout);
          // Remove any loading message that might have appeared
          this.messages = this.messages.filter(msg => msg.text !== 'Thinking...');
          
          // Handle different types of errors
          let errorMessage = 'Sorry, I encountered an error. Please try again.';
          if ((error as any).name === 'TimeoutError' || error.message?.includes('timeout')) {
            errorMessage = 'Sorry, the request timed out. Please try again.';
          } else if (error.status === 0 || error.status >= 500) {
            errorMessage = 'The backend service is currently unavailable. Please try again later or contact support.';
          }
          
          this.messages.push({ sender: 'BOT', text: errorMessage });
          this.isLoading = false;
          
          // Manually trigger change detection to ensure UI updates
          this.cdr.detectChanges();
          
          // Scroll to bottom to show error message
          this.scrollToBottom();
          // Focus back on input field
          this.focusInput();
        }
      });
  }

  async goToFeedback() {
    // End current session before navigating to feedback
    await this.endCurrentSession();
    this.router.navigate(['/feedback']);
  }

  async logout() {
    console.log('🚪 User logging out from chatpage, saving data to database...');
    
    // Save current session and messages to database before logout
    await this.endCurrentSession();
    
    // Give a moment for the session to be saved
    setTimeout(() => {
      console.log('✅ Session data saved, proceeding with logout');
      
      // Clear user data from localStorage
      localStorage.removeItem('userData');
      this.router.navigate(['/feedback']);
    }, 1000); // 1 second delay to ensure data is saved
  }

  // Sidebar actions
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  startNewChat() {
    const sessionId = this.generateSessionId();
    this.saveLastSessionId(sessionId);
    this.router.navigate([`/chat/${sessionId}`]);
  }

  openLastChat() {
    console.log('📂 Opening last chats from chatpage, loading sessions...');
    console.log('📂 Current userId:', this.userId);
    console.log('📂 Current userKey:', this.userKey);
    
    // Ensure user data is loaded before loading sessions
    if (!this.userId) {
      console.log('⚠️ No userId found, reloading user data...');
      this.loadUserData();
      // Wait a bit for user data to load, then try again
      setTimeout(() => {
        if (this.userId) {
          this.loadSessionsList();
        } else {
          console.error('❌ Still no userId after reloading user data');
        }
      }, 100);
    } else {
      // User data is already loaded, proceed with loading sessions
      this.loadSessionsList();
    }
    
    // Test API call first
    this.testApiCall();
    
    // Show sessions modal
    this.showSessions = true;
  }

  private testApiCall() {
    if (this.userId) {
      console.log('🧪 Testing API call for userId:', this.userId);
      this.chatSessionService.getChatSessionsByUser(this.userId, 0, 5).subscribe({
        next: (response) => {
          console.log('🧪 Test API response:', response);
          console.log('🧪 Test API sessions count:', response.content.length);
        },
        error: (error) => {
          console.error('🧪 Test API error:', error);
        }
      });
    }
  }

  openProfile() {
    this.showProfile = true;
  }

  closeSessions() {
    this.showSessions = false;
  }

  refreshSessions() {
    console.log('🔄 Refreshing sessions list...');
    this.loadSessionsList();
  }

  cleanupDuplicateMessages() {
    console.log('🧹 Starting cleanup of duplicate messages...');
    if (this.userId && this.currentDbSessionId) {
      // Load all messages for current session
      this.chatMessageService.getMessagesBySession(this.currentDbSessionId, 0, 1000).subscribe({
        next: (response) => {
          console.log('📊 Found', response.content.length, 'messages in current session');
          
          // Group messages by content and sender to find duplicates
          const messageGroups = new Map<string, any[]>();
          
          response.content.forEach(msg => {
            const key = `${msg.sender}_${msg.messageContent}`;
            if (!messageGroups.has(key)) {
              messageGroups.set(key, []);
            }
            messageGroups.get(key)!.push(msg);
          });
          
          // Find and log duplicates
          let duplicateCount = 0;
          messageGroups.forEach((messages, key) => {
            if (messages.length > 1) {
              console.log(`🔄 Found ${messages.length} duplicates for: ${key}`);
              duplicateCount += messages.length - 1;
              
              // Keep the first message, delete the rest
              const toKeep = messages[0];
              const toDelete = messages.slice(1);
              
              toDelete.forEach(duplicate => {
                console.log(`🗑️ Deleting duplicate message ID: ${duplicate.id}`);
                this.chatMessageService.deleteChatMessage(duplicate.id!).subscribe({
                  next: () => {
                    console.log(`✅ Deleted duplicate message ID: ${duplicate.id}`);
                  },
                  error: (error) => {
                    console.error(`❌ Error deleting duplicate message ID: ${duplicate.id}`, error);
                  }
                });
              });
            }
          });
          
          if (duplicateCount > 0) {
            console.log(`🧹 Cleanup complete. Removed ${duplicateCount} duplicate messages.`);
            alert(`Cleanup complete. Removed ${duplicateCount} duplicate messages.`);
          } else {
            console.log('✅ No duplicate messages found.');
            alert('No duplicate messages found.');
          }
        },
        error: (error) => {
          console.error('❌ Error during cleanup:', error);
          alert('Error during cleanup. Please try again.');
        }
      });
    } else {
      console.log('❌ Cannot cleanup: No userId or currentDbSessionId');
      alert('Cannot cleanup: No active session.');
    }
  }


  closeProfile() {
    this.showProfile = false;
  }

  openAbout() {
    this.showAbout = true;
  }
  closeAbout() {
    this.showAbout = false;
  }

  openSession(id: string) {
    this.saveLastSessionId(id);
    this.router.navigate(['/chat', id]);
    this.closeSessions();
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
        
        // Update local sessions list
        this.sessions = this.sessions.filter(s => s.id !== sessionId);
        
        // Show success message
        alert(`Session "${session.name}" deleted successfully`);
        
        // Trigger change detection to update the UI
        this.cdr.detectChanges();
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

  private loadSession() {
    if (this.sessionId && this.userId) {
      // Try to load from database first
      this.loadSessionFromDatabase();
    } else {
      // No userId available - user needs to log in properly
      console.error('No userId available for session loading');
      this.messages = [];
    }
    // track last session
    if (this.sessionId) {
      localStorage.setItem('lastChatSessionId', this.sessionId);
    }
  }

  private loadSessionFromDatabase() {
    if (!this.userId) return;
    
    console.log('🔍 Loading session from database for sessionId:', this.sessionId);
    
    // First, try to find existing session by sessionId
    this.chatSessionService.getChatSessionsByUser(this.userId, 0, 100).subscribe({
      next: (response) => {
        console.log('📋 Available sessions:', response.content.map(s => ({ id: s.id, sessionName: s.sessionName })));
        
        // Look for session by sessionName or by ID
        console.log('🔍 Looking for session with sessionId:', this.sessionId);
        console.log('🔍 Available session names:', response.content.map(s => s.sessionName));
        console.log('🔍 Available session IDs:', response.content.map(s => s.id));
        
        const session = response.content.find(s => 
          s.sessionName === this.sessionId || 
          s.id?.toString() === this.sessionId
        );
        
        if (session) {
          this.currentDbSessionId = session.id!;
          console.log('✅ Found existing session in database:', session.id, session.sessionName);
          this.loadMessagesFromDatabase();
        } else {
          console.log('❌ No existing session found, creating new one');
          // Create new session in database
          this.createNewDatabaseSession();
        }
      },
      error: (error) => {
        console.error('Error loading session from database:', error);
        // No fallback - user needs to log in properly
        this.messages = [];
      }
    });
  }

  private createNewDatabaseSession() {
    if (!this.userId) return;
    
    const newSession: any = {
      sessionName: this.sessionId || 'New Session',
      // startedAt will be set by backend @PrePersist - don't include it
      endedAt: undefined,
      userId: this.userId,
      chatMessages: []
    };
    
    this.chatSessionService.createChatSessionForUser(this.userId, newSession).subscribe({
      next: (session) => {
        this.currentDbSessionId = session.id!;
        this.messages = [];
        this.lastSavedMessageCount = 0; // Reset for new session
        console.log('✅ Chat session created with ID:', session.id);
      },
      error: (error) => {
        console.error('❌ Error creating new session:', error);
        this.messages = [];
      }
    });
  }

  private loadMessagesFromDatabase() {
    if (!this.currentDbSessionId) {
      console.log('❌ No currentDbSessionId available for loading messages');
      return;
    }
    
    console.log('📨 Loading messages for session ID:', this.currentDbSessionId);
    
    this.chatMessageService.getMessagesBySession(this.currentDbSessionId, 0, 1000).subscribe({
      next: (response) => {
        console.log('📨 Loaded messages from database:', response.content.length, 'messages');
        
        // Ensure chronological order
        const sorted = (response.content || []).slice().sort((a, b) => {
          const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          if (ta !== tb) return ta - tb;
          const ia = (a.id || 0); const ib = (b.id || 0);
          return ia - ib;
        });

        console.log('📨 Sorted messages:', sorted.length);
        
        // Remove duplicates by id+content to avoid hidden last bubble
        const unique = new Map<string, { sender: string, text: string }>();
        sorted.forEach(msg => {
          const key = `${msg.id || ''}_${msg.sender}_${msg.messageContent}`;
          unique.set(key, { sender: msg.sender || 'BOT', text: msg.messageContent || '' });
        });
        
        // Preserve IDs when available
        this.messages = sorted.map(msg => ({ sender: msg.sender || 'BOT', text: msg.messageContent || '', id: msg.id }));
        
        // Ensure last message is visible at bottom
        this.cdr.detectChanges();
        this.scrollToBottom();

        // Map after de-dup (kept as objects already in correct shape)
        /* this.messages = sorted.map(msg => ({
          sender: msg.sender || 'BOT',
          text: msg.messageContent || ''
        })); */
        
        // Update the last saved message count to match loaded messages
        this.lastSavedMessageCount = this.messages.length;
        
        console.log('📨 Processed messages for display:', this.messages.length);
        console.log('📨 Updated lastSavedMessageCount to:', this.lastSavedMessageCount);
        
        // Manually trigger change detection again after next tick to ensure final bubble renders
        setTimeout(() => {
          this.cdr.detectChanges();
          this.scrollToBottom();
        }, 0);
      },
      error: (error) => {
        console.error('❌ Error loading messages from database:', error);
        // No fallback - user needs to log in properly
        this.messages = [];
      }
    });
  }
  // per-message delete removed per request


  private persistSession() {
    console.log('💾 Persisting session:', {
      currentDbSessionId: this.currentDbSessionId,
      messageCount: this.messages.length,
      sessionId: this.sessionId
    });
    
    // Save to database if we have a database session
    if (this.currentDbSessionId) {
      // Fire-and-forget during normal operation; critical paths await
      this.saveMessagesToDatabase();
    } else {
      console.log('❌ No database session ID, skipping database save');
    }
    
    // Session data is now only stored in database
  }

  private saveMessagesToDatabase(): Promise<void> {
    if (!this.currentDbSessionId) {
      console.log('❌ Cannot save message: currentDbSessionId is null');
      return Promise.resolve();
    }
    
    // Check if there are new messages to save
    if (this.messages.length <= this.lastSavedMessageCount) {
      console.log('📝 No new messages to save. Current:', this.messages.length, 'Saved:', this.lastSavedMessageCount);
      return Promise.resolve();
    }
    
    // Get the new messages that haven't been saved yet
    const newMessages = this.messages.slice(this.lastSavedMessageCount);
    console.log('💾 Saving new messages to database:', {
      sessionId: this.currentDbSessionId,
      newMessageCount: newMessages.length,
      totalMessages: this.messages.length,
      lastSavedCount: this.lastSavedMessageCount,
      userId: this.userId
    });
    
    // Process messages in pairs (user + bot)
    return this.saveMessagePairs(newMessages, 0);
  }

  private saveMessagePairs(messages: any[], index: number): Promise<void> {
    return new Promise<void>((resolve) => {
      if (index >= messages.length) {
        // All messages processed
        this.lastSavedMessageCount = this.messages.length;
        console.log('✅ All new messages saved. Updated lastSavedMessageCount to:', this.lastSavedMessageCount);
        resolve();
        return;
      }
      
      // Get the current message pair (user + bot)
      const userMessage = messages[index];
      const botMessage = messages[index + 1];
      
      // If there's an odd trailing message (e.g., user typed but bot didn't reply yet), save it alone
      if (!botMessage) {
        console.log('ℹ️ Trailing single message detected; saving last user message only.');
      }
      
      if (!userMessage) {
        console.log('❌ No user message at index', index, '- finishing');
        this.lastSavedMessageCount = this.messages.length;
        resolve();
        return;
      }
      
      console.log('💾 Saving message pair (or single if trailing):', {
        userMessage: userMessage?.text,
        botMessage: botMessage?.text,
        pairIndex: Math.floor(index / 2) + 1
      });
      
      // Save user message first
      const userChatMessage: ChatMessage = {
        messageContent: userMessage.text,
        sender: userMessage.sender,
        timestamp: '', // Will be set by backend @PrePersist
        chatSession: undefined,
        intent: undefined
      };
      
      this.chatMessageService.createChatMessageWithSessionAndIntent(
        this.currentDbSessionId!, 
        1,
        userChatMessage
      ).subscribe({
        next: (savedUserMessage) => {
          console.log('✅ User message saved to database with ID:', savedUserMessage.id);
          
          // If no bot message, proceed to next
          if (!botMessage) {
            this.saveMessagePairs(messages, index + 2).then(resolve);
            return;
          }
          
          const botChatMessage: ChatMessage = {
            messageContent: botMessage.text,
            sender: botMessage.sender,
            timestamp: '', // Will be set by backend @PrePersist
            chatSession: undefined,
            intent: undefined
          };
          
          this.chatMessageService.createChatMessageWithSessionAndIntent(
            this.currentDbSessionId!, 
            1,
            botChatMessage
          ).subscribe({
            next: (savedBotMessage) => {
              console.log('✅ Bot message saved to database with ID:', savedBotMessage.id);
              this.saveMessagePairs(messages, index + 2).then(resolve);
            },
            error: (error) => {
              console.error('❌ Error saving bot message to database:', error);
              this.saveMessagePairs(messages, index + 2).then(resolve);
            }
          });
        },
        error: (error) => {
          console.error('❌ Error saving user message to database:', error);
          console.error('Error details:', error);
          this.saveMessagePairs(messages, index + 2).then(resolve);
        }
      });
    });
  }


  private generateSessionId(): string {
    return 's_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  private saveLastSessionId(id: string) {
    localStorage.setItem(`lastChatSessionId_${this.userKey}`, id);
  }

  private loadSessionsList() {
    console.log('🔄 loadSessionsList called with userId:', this.userId);
    if (this.userId) {
      console.log('📡 Loading sessions from database for userId:', this.userId);
      // Load from database
      this.chatSessionService.getChatSessionsByUser(this.userId, 0, 100).subscribe({
        next: (response) => {
          console.log('📋 Raw response from database:', response);
          console.log('📋 Number of sessions found:', response.content.length);
          
          // Only update sessions if we got a valid response
          if (response && response.content) {
            this.sessions = response.content.map(session => {
              console.log('📅 Processing session timestamp:', session.startedAt, 'Type:', typeof session.startedAt);
              let updatedTime = 0;
              if (session.startedAt) {
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
                  updatedTime = date.getTime();
                  console.log('📅 Parsed timestamp:', date, 'Time:', updatedTime);
                } catch (error) {
                  console.error('❌ Error parsing timestamp:', session.startedAt, error);
                  updatedTime = 0;
                }
              }
              
            return {
              id: session.sessionName || session.id?.toString() || '',
              dbId: session.id, // Store the actual database ID for updates
              name: session.sessionName || `Session ${session.id}`,
              updated: updatedTime,
              messagesCount: 0 // Will be updated by loadMessageCounts
            };
            }).sort((a, b) => b.updated - a.updated);
            
            console.log('✅ Sessions loaded successfully:', this.sessions.length, 'sessions');
            
            // Load message counts for each session
            this.loadMessageCounts();
          } else {
            console.log('⚠️ No sessions found in response');
            this.sessions = [];
          }
        },
        error: (error) => {
          console.error('❌ Error loading sessions from database:', error);
          this.sessions = [];
        }
      });
    } else {
      console.log('❌ No userId available for loading sessions');
      this.sessions = [];
    }
  }

  private loadMessageCounts() {
    // Load message counts for each session
    this.sessions.forEach((session, index) => {
      if (session.dbId) {
        console.log(`📊 Loading message count for session ${session.id} (dbId: ${session.dbId})`);
        
        // Load message count for this session
        this.chatMessageService.getMessagesBySession(session.dbId, 0, 1000).subscribe({
          next: (response) => {
            this.sessions[index].messagesCount = response.content.length;
            console.log(`📊 Session ${session.id} has ${response.content.length} messages`);
          },
          error: (error) => {
            console.error(`❌ Error loading message count for session ${session.id}:`, error);
            this.sessions[index].messagesCount = 0;
          }
        });
      } else {
        console.log(`📊 No dbId for session ${session.id}, setting message count to 0`);
        this.sessions[index].messagesCount = 0;
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
        
        // Update local sessions list
        const sessionIndex = this.sessions.findIndex(s => s.id === sessionId);
        if (sessionIndex !== -1) {
          this.sessions[sessionIndex].name = newName;
          this.sessions[sessionIndex].id = newName; // Update the ID to match the new name
        }
        
        // Show success message
        alert(`Session renamed to "${newName}"`);
        
        // Trigger change detection to update the UI
        this.cdr.detectChanges();
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

  private loadUserData() {
    const currentUser = this.authService.getCurrentUser();
    console.log('🔍 AuthService getCurrentUser result:', currentUser);
    
    if (currentUser) {
      this.userName = currentUser.username || 'User';
      this.userCategory = currentUser.category || '';
      this.userId = currentUser.id || null;
      const rawKey = currentUser.email || currentUser.username || 'guest';
      this.userKey = String(rawKey).toLowerCase().replace(/[^a-z0-9]+/g, '_');
      console.log('✅ User data loaded from AuthService:', { userId: this.userId, userName: this.userName });
    } else {
      // Fallback to localStorage
      console.log('⚠️ No user found in AuthService, checking localStorage...');
      const userData = localStorage.getItem('userData');
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
          console.error('❌ Error parsing user data from localStorage:', error);
          this.router.navigate(['/login']);
        }
      } else {
        console.error('❌ No user found in AuthService or localStorage');
        this.router.navigate(['/login']);
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
          ] as string[]
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
          ] as string[]
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
          ] as string[]
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
          ] as string[]
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
          ] as string[]
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
          ] as string[]
        };
    }
  }

  onFeatureClick(prompt: string) {
    this.userInput = prompt;
    this.sendMessage();
  }

  // Handle Enter key press
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // Handle input focus and blur for better UX
  onInputFocus() {
    // Optional: Add focus styling or behavior
  }

  onInputBlur() {
    // Optional: Add blur styling or behavior
  }

  // Scroll to bottom of chat window
  private scrollToBottom() {
    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      const chatWindow = document.querySelector('.chat-window');
      if (chatWindow) {
        chatWindow.scrollTop = chatWindow.scrollHeight;
      }
    });
  }

  // Focus on input field
  private focusInput() {
    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input && !this.isLoading) {
        input.focus();
      }
    });
  }

  // Implement OnDestroy to end session when component is destroyed
  ngOnDestroy() {
    // Best-effort; component destroy lifecycle can't await
    this.endCurrentSession();
  }

  // End the current session
  private async endCurrentSession(): Promise<void> {
    if (this.currentDbSessionId) {
      console.log('🔚 Ending session:', this.currentDbSessionId);
      
      // First, save any pending messages
      await this.saveMessagesToDatabase();
      
      // Use the proper backend method to end the session
      try {
        const session = await firstValueFrom(this.chatSessionService.endChatSession(this.currentDbSessionId));
        console.log('✅ Session ended successfully:', session.id, 'Ended at:', session.endedAt);
      } catch (error) {
        console.error('❌ Error ending session:', error);
      }
    } else {
      console.log('⚠️ No currentDbSessionId found, cannot end session');
    }
    return Promise.resolve();
  }
}
