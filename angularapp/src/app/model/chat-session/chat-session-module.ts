

import { User } from '../user/user-module';
import { ChatMessage } from '../chat-message/chat-message-module';

export interface ChatSession {
  id?: number;               // optional because it's auto-generated
  sessionName: string;       // name of the session
  startedAt: string;         // using ISO string (maps to LocalDateTime in backend)
  endedAt?: string;          // optional, may not be set until session ends
  userId?: number;               // reference to the user who owns this session
  chatMessages?: ChatMessage[]; // list of chat messages in the session
}
