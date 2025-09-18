import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user-chat',
  templateUrl: './chatpage.html',
  styleUrls: ['./chatpage.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule]
})
export class ChatPage {
  messages: { sender: string, text: string }[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  sessionId: string | null = null;
  userName: string = 'User';

  private apiUrl = 'http://localhost:8080/api/chat'; // Your backend chat API

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {
    this.route.paramMap.subscribe(params => {
      const id = params.get('sessionId');
      this.sessionId = id;
      this.loadSession();
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
    this.http.post<{ reply: string }>(this.apiUrl, { message: userMessage, sessionId: this.sessionId })
      .subscribe(
        response => {
          this.messages.push({ sender: 'Bot', text: response.reply });
          this.isLoading = false;
          // persist
          this.persistSession();
          this.touchMeta();
        },
        error => {
          this.messages.push({ sender: 'Bot', text: 'Error: Unable to get response.' });
          this.isLoading = false;
          this.persistSession();
          this.touchMeta();
        }
      );
  }

  goToFeedback() {
    this.router.navigate(['/feedback']);
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
    const meta = { updated: Date.now() };
    localStorage.setItem(key + '_meta', JSON.stringify(meta));
  }

  private getStorageKey(): string {
    const id = this.sessionId || 'default';
    return `chat_session_${id}`;
  }
}
