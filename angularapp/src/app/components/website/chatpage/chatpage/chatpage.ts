import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../service/user-service';
//import { AuthService } from '../../../../service/auth-service';
import { UserSidebar } from '../../sidebar/sidebar';
import { UserProfile } from '../../profile/profile';

@Component({
  selector: 'app-user-chat',
  templateUrl: './chatpage.html',
  styleUrls: ['./chatpage.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, UserSidebar, UserProfile]
})
export class ChatPage {
  messages: { sender: string, text: string }[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  sessionId: string | null = null;
  userName: string = 'User';
  userCategory: string = '';
  // Sidebar & sessions modal state (mirrors UserDashboard)
  showSessions: boolean = false;
  sessions: { id: string; name: string; updated: number; messagesCount: number }[] = [];
  sidebarOpen: boolean = false;
  showProfile: boolean = false;
  showAbout: boolean = false;
  private userKey: string = 'guest';

  private apiUrl = 'http://localhost:8080/api/chat'; // Backend chat API

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private userService: UserService) {
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

  sendMessage() {
    if (!this.userInput.trim()) return;

    // Show user's message
    this.messages.push({ sender: 'User', text: this.userInput });

    const userMessage = this.userInput;
    this.userInput = '';
    this.isLoading = true;

    // Send message to backend API with optional sessionId
    console.log('Sending message to:', this.apiUrl, 'Message:', userMessage);
    this.http.post<{ reply: string }>(this.apiUrl, { message: userMessage, sessionId: this.sessionId })
      .subscribe({
        next: (response) => {
          console.log('Chat response received:', response);
          this.messages.push({ sender: 'Bot', text: response.reply });
          this.isLoading = false;
          // persist
          this.persistSession();
          this.touchMeta();
        },
        error: (error) => {
          console.error('Chat API error:', error);
          this.messages.push({ sender: 'Bot', text: 'Error: Unable to get response.' });
          this.isLoading = false;
          this.persistSession();
          this.touchMeta();
        }
      });
  }

  goToFeedback() {
    this.router.navigate(['/feedback']);
  }

  logout() {
    // Clear user data from localStorage
    localStorage.removeItem('userData');
    this.router.navigate(['/feedback']);
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
    this.loadSessionsList();
    this.showSessions = true;
  }

  openProfile() {
    this.showProfile = true;
  }

  closeSessions() {
    this.showSessions = false;
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
    // Update local list view only; data is kept in localStorage for now
    this.sessions = this.sessions.filter(s => s.id !== sessionId);
  }

  private loadSession() {
    const key = this.getStorageKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      try { this.messages = JSON.parse(stored) || []; } catch {}
    }
    // track last session
    if (this.sessionId) {
      localStorage.setItem('lastChatSessionId', this.sessionId);
    }
  }

  private persistSession() {
    const key = this.getStorageKey();
    localStorage.setItem(key, JSON.stringify(this.messages));
    if (this.sessionId) {
      localStorage.setItem('lastChatSessionId', this.sessionId);
    }
  }

  private touchMeta() {
    const key = this.getStorageKey();
    const metaRaw = localStorage.getItem(key + '_meta');
    let meta: any = {};
    try { meta = metaRaw ? JSON.parse(metaRaw) : {}; } catch { meta = {}; }
    meta.updated = Date.now();
    localStorage.setItem(key + '_meta', JSON.stringify(meta));
  }

  private getStorageKey(): string {
    const id = this.sessionId || 'default';
    return `chat_session_${this.userKey}_${id}`;
  }

  private generateSessionId(): string {
    return 's_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  private saveLastSessionId(id: string) {
    localStorage.setItem(`lastChatSessionId_${this.userKey}`, id);
  }

  private loadSessionsList() {
    const prefix = `chat_session_${this.userKey}_`;
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix) && !k.endsWith('_meta'));
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
  }

  renameSession(sessionId: string) {
    const prefix = `chat_session_${this.userKey}_`;
    const key = `${prefix}${sessionId}_meta`;
    const metaRaw = localStorage.getItem(key) || '{}';
    let meta: any = {};
    try { meta = JSON.parse(metaRaw); } catch { meta = {}; }
    const current = meta.name || '';
    const proposed = window.prompt('Name this chat session', current);
    if (proposed === null) { return; }
    const name = proposed.trim();
    meta.name = name || `Session ${sessionId.slice(-6)}`;
    if (!meta.updated) { meta.updated = Date.now(); }
    localStorage.setItem(key, JSON.stringify(meta));
    this.loadSessionsList();
  }

  private loadUserData() {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userName = user.username || 'User';
        this.userCategory = user.category || '';
        const rawKey = user.email || user.username || 'guest';
        this.userKey = String(rawKey).toLowerCase().replace(/[^a-z0-9]+/g, '_');
      } catch (error) {
        console.error('Error parsing user data:', error);
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
}
