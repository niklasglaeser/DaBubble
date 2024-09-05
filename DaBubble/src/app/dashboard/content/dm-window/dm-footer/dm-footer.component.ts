import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { Message } from '../../../../models/message.model';
import { DirectMessagesService } from '../../../../services/direct-message.service';
import { Observable, Subscription } from 'rxjs';
import { UserLogged } from '../../../../models/user-logged.model';
import { UserLoggedService } from '../../../../services/lp-services/user-logged.service';
import { UploadService } from '../../../../services/lp-services/upload.service';
import { AuthService } from '../../../../services/lp-services/auth.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dm-footer',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dm-footer.component.html',
  styleUrl: './dm-footer.component.scss'
})
export class DmFooterComponent {
  userService = inject(UserLoggedService);
  imgUploadService = inject(UploadService);
  currentUserId: string = '';
  recipientUser$: Observable<UserLogged | null>;

  chatImg: string | null = null; 
  uploadError: string | null = null;
  isPdf: boolean = false;
  safePath: string | null = null; 

  private userSubscription: Subscription | undefined;
  private conversationIdSubscription: Subscription | undefined;
  conversationId: string | undefined;
  
  constructor(private dmService: DirectMessagesService, private authService: AuthService,private sanitizer: DomSanitizer,) {
    this.recipientUser$ = this.dmService.recipientUser$;
    this.currentUserId = this.authService.uid;
  }

  ngOnInit() {
    // Abonniere das Observable für conversationId
    this.conversationIdSubscription = this.dmService.conversationId$.subscribe(id => {
      if (id) {this.conversationId = id;}
    });

  }

  ngOnDestroy(): void {
    if (this.conversationIdSubscription) {
      this.conversationIdSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  sendMessage(): void {
    const textarea = document.getElementById('dm-message-input') as HTMLTextAreaElement;
    const messageText = textarea.value;

    if (messageText || this.chatImg) {
      const message: Message = {
        message: messageText,
        senderId: '',
        imagePath: this.chatImg!,
        created_at: new Date(),
      };

      this.dmService.addMessage(message).then(() => {
        textarea.value = '';
        this.chatImg = null
      });
      console.log('send');
      console.log('send', message.imagePath);

    }
  }

  @HostListener('keyup.enter', ['$event'])
  onEnter(event: KeyboardEvent): void {
    this.sendMessage();
  }

  uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.isPdf = file.type === 'application/pdf';

      const currentUser = this.authService.currentUserSig();
      if (currentUser) {
        this.imgUploadService.uploadImgChat(currentUser.userId, file, this.conversationId).pipe(
        ).subscribe({
          next: (imagePath: string) => {
            this.chatImg = imagePath;
            this.safePath = this.isPdf ? this.sanitizer.bypassSecurityTrustResourceUrl(imagePath) as string : null
            this.uploadError = null;
          },
          error: (err: any) => {
            this.uploadError = err.message || 'Fehler beim Hochladen des Bildes.';
            this.chatImg = null;
            this.safePath = null;
            this.isPdf = false;

            setTimeout(() => {
              this.uploadError = null;
            }, 3000);
          }
        });
      }
    }
  }

  triggerFileUpload(inputElement: HTMLInputElement) {
    inputElement.click();
  }

  deleteImg() {
    if (this.chatImg) {
        this.imgUploadService.deleteImgChat(this.chatImg).subscribe({
            next: () => {
                this.chatImg = null;
                this.safePath = null;
                this.isPdf = false;

                const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = '';
                }
            },
            error: (err: any) => {
                console.error('Fehler beim Löschen der Datei:', err);
            }
        });
    }
}

}
