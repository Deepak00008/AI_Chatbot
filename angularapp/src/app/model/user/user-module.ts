
import { Feedback } from '../feedback/feedback-module';
import { ChatSession } from '../chat-session/chat-session-module';

export interface User {
  id?: number;               // optional because it will be auto-generated
  username: string;
  email: string;
  password?: string;         // password field to match backend
  category?: string;         // user category: student, employee, teacher, business, farmer, other
  avatar?: string;           // avatar image as base64 data URL
  role?: string;             // user role: USER, ADMIN (to match backend)
  feedbackList?: Feedback[]; // optional since it may not be fetched every time
  chatSessions?: ChatSession[];
}

