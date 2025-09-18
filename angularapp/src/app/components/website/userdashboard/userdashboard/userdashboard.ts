import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './userdashboard.html',
  styleUrls: ['./userdashboard.css'],
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe]
})
export class UserDashboard {
  userName: string = 'User'; // Get from login session
  showSessions: boolean = false;
  sessions: { id: string; updated: number; messagesCount: number }[] = [];

  constructor(private router: Router) {}

  startNewChat() {
    const sessionId = this.generateSessionId();
    this.saveLastSessionId(sessionId);
    this.router.navigate([`/chat/${sessionId}`]);
  }

  openLastChat() {
    this.loadSessions();
    this.showSessions = true;
  }

  login() {
    this.router.navigate(['/user/login']);
  }

  private generateSessionId(): string {
    return 's_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  private saveLastSessionId(id: string) {
    localStorage.setItem('lastChatSessionId', id);
  }

  private loadSessions() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('chat_session_'));
    const items = keys.map(k => {
      const raw = localStorage.getItem(k) || '[]';
      let count = 0;
      try { count = (JSON.parse(raw) as any[]).length; } catch {}
      const metaRaw = localStorage.getItem(k + '_meta');
      let updated = 0;
      try { updated = metaRaw ? JSON.parse(metaRaw).updated : 0; } catch {}
      return { id: k.replace('chat_session_', ''), updated, messagesCount: count };
    });
    this.sessions = items.sort((a,b) => b.updated - a.updated);
  }

  openSession(id: string) {
    this.saveLastSessionId(id);
    this.router.navigate(['/chat', id]);
  }

  closeSessions() {
    this.showSessions = false;
  }
}
