import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessageService } from '../../../service/chat-message-service';
import { ChatMessage } from '../../../model/chat-message/chat-message-module';
import { PageResponse } from '../../../model/common/page-response';

@Component({
  selector: 'app-chatmessage-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatmessage-management.html',
  styleUrls: ['./chatmessage-management.css']
})
export class ChatmessageManagement implements OnInit, OnDestroy {

  chatMessages: ChatMessage[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;
  private currentRequest: any = null;

  constructor(
    private chatMessageService: ChatMessageService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    console.log('ChatMessageManagement component initialized');
    this.loadChatMessages();
  }

  // Method to handle menu click - reset and reload data
  onMenuClick(): void {
    console.log('Menu clicked - resetting component state');
    this.currentPage = 0;
    this.isLoading = false;
    this.errorMessage = '';
    this.loadChatMessages();
  }

  loadChatMessages(): void {
    console.log('Loading chat messages for page:', this.currentPage);
    this.loadPageDirectly(this.currentPage);
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

  private loadPageDirectly(page: number): void {
    console.log('Loading page directly:', page);
    this.isLoading = true;
    this.errorMessage = '';
    
    // Cancel any existing request
    if (this.currentRequest) {
      this.currentRequest.unsubscribe();
    }
    
    console.log('Making HTTP request to:', `http://localhost:8083/api/chatmessages/paginated?page=${page}&size=${this.pageSize}`);
    
    this.currentRequest = this.chatMessageService.getAllChatMessagesPaginated(page, this.pageSize).subscribe({
      next: (data: any) => {
        console.log('=== RAW BACKEND RESPONSE ===');
        console.log('Full response:', JSON.stringify(data, null, 2));
        console.log('Response type:', typeof data);
        console.log('Response keys:', Object.keys(data));
        console.log('Content array:', data.content);
        console.log('Total pages:', data.totalPages);
        console.log('Total elements:', data.totalElements);
        console.log('=== END RESPONSE ===');
        
        this.chatMessages = data.content || [];
        this.totalPages = data.totalPages || 0;
        this.totalElements = data.totalElements || 0;
        this.isLoading = false;
        this.currentRequest = null;
        this.cdr.detectChanges();
        console.log('Page load completed - messages:', this.chatMessages.length);
      },
      error: (error) => {
        console.error('=== HTTP ERROR ===');
        console.error('Error object:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        console.error('=== END ERROR ===');
        
        this.errorMessage = `Failed to load page. Error: ${error.status} - ${error.message}`;
        this.isLoading = false;
        this.currentRequest = null;
        this.cdr.detectChanges();
      }
    });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  deleteChatMessage(id: number): void {
    if (!confirm('Are you sure you want to delete this chat message?')) return;

    this.chatMessageService.deleteChatMessage(id).subscribe({
      next: () => {
        this.chatMessages = this.chatMessages.filter(msg => msg.id !== id);
        console.log(`Deleted message with id: ${id}`);
        // Refresh the current page after deletion
        this.loadChatMessages();
      },
      error: (error) => {
        console.error('Error deleting chat message:', error);
        this.errorMessage = 'Failed to delete chat message. Please try again.';
      }
    });
  }

  refreshData(): void {
    console.log('Refreshing chat messages data');
    this.currentPage = 0;
    this.loadChatMessages();
  }

  retryLoad(): void {
    console.log('Retrying to load chat messages');
    this.errorMessage = '';
    this.loadChatMessages();
  }


  ngOnDestroy(): void {
    // Clean up any pending requests
    if (this.currentRequest) {
      this.currentRequest.unsubscribe();
    }
  }

}
