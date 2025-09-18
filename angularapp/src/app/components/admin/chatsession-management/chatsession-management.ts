import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chatsession-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatsession-management.html',
  styleUrls: ['./chatsession-management.css']
})
export class ChatSessionManagement implements OnInit {

  chatSessions = [
    { id: 1, user: 'User1', sessionStart: '2025-09-13 09:30', sessionEnd: '2025-09-13 10:00' },
    { id: 2, user: 'User2', sessionStart: '2025-09-13 10:15', sessionEnd: '2025-09-13 10:45' }
  ];

  constructor() { }

  ngOnInit(): void {
    // Ideally load sessions from backend service here
  }

  deleteChatSession(id: number) {
    this.chatSessions = this.chatSessions.filter(session => session.id !== id);
    console.log(`Deleted chat session with id: ${id}`);
  }
}
