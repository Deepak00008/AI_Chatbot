import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatSessionService } from '../../../service/chat-session-service';
import { ChatSession } from '../../../model/chat-session/chat-session-module';

@Component({
  selector: 'app-chatsession-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatsession-management.html',
  styleUrls: ['./chatsession-management.css']
})
export class ChatSessionManagement implements OnInit, OnDestroy {

  chatSessions: ChatSession[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;
  private currentRequest: any = null;
  private autoRefreshHandle: any = null;

  constructor(
    private chatSessionService: ChatSessionService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadChatSessions();
    // Auto-refresh briefly to catch recent logout updates
    this.autoRefreshHandle = setInterval(() => {
      this.loadPageDirectly(this.currentPage);
    }, 5000);
  }

  loadChatSessions(): void {
    console.log('Loading chat sessions for page:', this.currentPage);
    this.loadPageDirectly(this.currentPage);
  }

  private loadPageDirectly(page: number): void {
    console.log('Loading page directly:', page);
    this.isLoading = true;
    this.errorMessage = '';
    
    // Cancel any existing request
    if (this.currentRequest) {
      this.currentRequest.unsubscribe();
    }
    
    this.currentRequest = this.chatSessionService.getChatSessions(page, this.pageSize).subscribe({
      next: (data: any) => {
        console.log('Page loaded successfully:', data);
        
        // Sort by most recent first (endedAt desc, then startedAt desc)
        const items = (data.content || []).slice();
        items.sort((a: ChatSession, b: ChatSession) => {
          const aEnd = a.endedAt ? new Date(a.endedAt as any).getTime() : 0;
          const bEnd = b.endedAt ? new Date(b.endedAt as any).getTime() : 0;
          if (aEnd !== bEnd) return bEnd - aEnd;
          const aStart = a.startedAt ? new Date(a.startedAt as any).getTime() : 0;
          const bStart = b.startedAt ? new Date(b.startedAt as any).getTime() : 0;
          return bStart - aStart;
        });
        this.chatSessions = items;
        this.totalPages = data.totalPages || 0;
        this.totalElements = data.totalElements || 0;
        this.isLoading = false;
        this.currentRequest = null;
        this.cdr.detectChanges();
        console.log('Page load completed - sessions:', this.chatSessions.length);
        
        // Debug: Log session end times
        this.chatSessions.forEach((session, index) => {
          console.log(`Session ${index + 1}:`, {
            id: session.id,
            sessionName: session.sessionName,
            startedAt: session.startedAt,
            endedAt: session.endedAt,
            endedAtType: typeof session.endedAt,
            endedAtNull: session.endedAt === null,
            endedAtUndefined: session.endedAt === undefined,
            endedAtEmpty: session.endedAt === '',
            endedAtTrimmed: session.endedAt ? session.endedAt.trim() : 'N/A'
          });
        });
      },
      error: (error) => {
        console.error('Error loading page:', error);
        this.errorMessage = 'Failed to load page. Please try again.';
        this.isLoading = false;
        this.currentRequest = null;
        this.cdr.detectChanges();
      }
    });
  }


  deleteChatSession(id: number): void {
    if (!confirm('Are you sure you want to delete this chat session?')) return;

    this.chatSessionService.deleteChatSession(id).subscribe({
      next: () => {
        this.chatSessions = this.chatSessions.filter(session => session.id !== id);
        this.totalElements--;
        console.log(`Deleted chat session with id: ${id}`);
        // Refresh the current page after deletion
        this.loadChatSessions();
      },
      error: (error) => {
        console.error('Error deleting chat session:', error);
        this.errorMessage = 'Failed to delete chat session. Please try again.';
      }
    });
  }

  refreshData(): void {
    console.log('Refreshing chat sessions data');
    this.currentPage = 0;
    this.loadChatSessions();
  }

  retryLoad(): void {
    console.log('Retrying to load chat sessions');
    this.errorMessage = '';
    this.loadChatSessions();
  }

  ngOnDestroy(): void {
    // Clean up any pending requests
    if (this.currentRequest) {
      this.currentRequest.unsubscribe();
    }
    if (this.autoRefreshHandle) {
      clearInterval(this.autoRefreshHandle);
      this.autoRefreshHandle = null;
    }
  }

  onPageChange(page: number): void {
    console.log('=== PAGINATION CLICKED ===');
    console.log('Requested page:', page);
    console.log('Current page before change:', this.currentPage);
    console.log('Total pages available:', this.totalPages);
    console.log('Is loading before change:', this.isLoading);
    
    // Simple validation
    if (page < 0 || page >= this.totalPages) {
      console.log('Page change ignored - invalid page number:', page);
      return;
    }
    
    console.log('Changing to page:', page);
    this.currentPage = page;
    console.log('Current page after setting:', this.currentPage);
    console.log('About to call loadPageDirectly...');
    this.loadPageDirectly(page);
    console.log('=== END PAGINATION CLICK ===');
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

}
