
import { Routes } from '@angular/router';

//user side components
import { Login } from './components/website/login/login/login';
import { Signup } from './components/website/signup/signup/signup';
import { UserDashboard } from './components/website/userdashboard/userdashboard/userdashboard';
import { ChatPage } from './components/website/chatpage/chatpage/chatpage';
import { FeedbackPage } from './components/website/feedback/feedback';

// Admin side components
import { UserManagement } from './components/admin/user-management/user-management';
import { IntentManagement } from './components/admin/intent-management/intent-management';
import { FeedbackManagement } from './components/admin/feedback-management/feedback-management';
import { ChatSessionManagement } from './components/admin/chatsession-management/chatsession-management';
import { DashboardComponent } from './components/admin/dashboard/dashboard';
import { Sidebar } from './components/admin/sidebar/sidebar';
import { AdminMenu } from './components/admin/dashboard/menu/admin-menu';
import { ChatmessageManagement } from './components/admin/chatmessage-management/chatmessage-management';

export const routes: Routes = [
  //user side routes
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'sidebar', component: Sidebar },

  { path: 'user', component: UserDashboard, children: [
    { path: 'chat', component: ChatPage }
  ]},
  { path: 'chat', component: ChatPage },
  { path: 'chat/:sessionId', component: ChatPage },
  { path: 'feedback', component: FeedbackPage },
// Admin side routes
  { 
    path: 'admin',
    component: DashboardComponent, 
    children: [
      { path: '', component: AdminMenu },
       { path: 'user-management', component: UserManagement },
      { path: 'intent-management', component: IntentManagement },
      { path: 'feedback-management', component: FeedbackManagement },
      { path: 'chatmessage-management', component: ChatmessageManagement },
      { path: 'chatsession-management', component: ChatSessionManagement },
      { path: '', redirectTo: '', pathMatch: 'full' }
    ]
  },

  // Default Route
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
