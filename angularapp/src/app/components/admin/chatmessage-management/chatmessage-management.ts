import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-chatmessage-management',
  standalone: true,
  imports: [CommonModule,HttpClientModule],
  templateUrl: './chatmessage-management.html',
  styleUrls: ['./chatmessage-management.css']
})
export class ChatmessageManagement implements OnInit {

  chatMessages = [
    { id: 1, user: 'User1', message: 'Hello!', timestamp: '2025-09-13 10:00' },
    { id: 2, user: 'User2', message: 'How are you?', timestamp: '2025-09-13 10:05' }
  ];

  constructor() { }

  ngOnInit(): void {
    // Ideally, here you would call a service to load chat messages from backend
  }

  deleteChatMessage(id: number) {
    // Simple delete logic (replace with API call in real app)
    this.chatMessages = this.chatMessages.filter(msg => msg.id !== id);
    console.log(`Deleted message with id: ${id}`);
  }

}
