import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { UserSidebar } from '../../sidebar/sidebar';
import { UserProfile } from '../../profile/profile';
import { UserService } from '../../../../service/user-service';
// import { AuthService } from '../../../../service/auth-service';



@Component({
  selector: 'app-user-dashboard',
  templateUrl: './userdashboard.html',
  styleUrls: ['./userdashboard.css'],
  standalone: true,
  imports: [CommonModule,UserSidebar,UserProfile],
  providers: [DatePipe]
})
export class UserDashboard {
  userName: string = 'User'; // Get from login session
  userCategory: string = '';
  showSessions: boolean = false;
  sessions: { id: string; name: string; updated: number; messagesCount: number }[] = [];
  sidebarOpen: boolean = false;
  showProfile: boolean = false;
  showAbout: boolean = false;
  private userKey: string = 'guest';

  constructor(private router: Router, private userService: UserService) {
    this.loadUserData();
  }

  startNewChat() {
    const sessionId = this.generateSessionId();
    this.saveLastSessionId(sessionId);
    this.router.navigate([`/chat/${sessionId}`]);
  }

  openLastChat() {
    this.loadSessions();
    this.showSessions = true;
  }

  openProfile() {
    this.showProfile = true;
  }

  logout() {
    // Clear user data from localStorage
    localStorage.removeItem('userData');
    this.router.navigate(['/login']);
  }

  private generateSessionId(): string {
    return 's_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  private saveLastSessionId(id: string) {
    localStorage.setItem(`lastChatSessionId_${this.userKey}`, id);
  }

  private loadSessions() {
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
  }

  openSession(id: string) {
    this.saveLastSessionId(id);
    this.router.navigate(['/chat', id]);
  }
  deleteSession(sessionId: string) {
  // Remove the session from the sessions array
  this.sessions = this.sessions.filter(s => s.id !== sessionId);

  // Optionally, call your backend API to delete the session permanently
  // this.sessionService.deleteSession(sessionId).subscribe();
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
    this.loadSessions();
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

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
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
