import { Component } from '@angular/core';
import { Message } from '../../../../models/message.model';
import { ThreadService } from '../../../../services/thread.service';
import { AuthService } from '../../../../services/lp-services/auth.service';

@Component({
  selector: 'app-thread-footer',
  standalone: true,
  imports: [],
  templateUrl: './thread-footer.component.html',
  styleUrl: './thread-footer.component.scss',
})
export class ThreadFooterComponent {
  constructor(
    private threadService: ThreadService,
    private authService: AuthService
  ) {}

  sendMessage(): void {
    console.log('Sende Nachricht'); // Überprüfung, ob Methode aufgerufen wird

    const textarea = document.getElementById(
      'chat-message-input-thread'
    ) as HTMLTextAreaElement;

    if (!textarea) {
      console.error('Textarea nicht gefunden');
      return;
    }

    const messageText = textarea.value;
    console.log('Textarea-Inhalt:', messageText); // Logge den Inhalt des Textareas

    const currentUser = this.authService.currentUserSig();

    if (messageText.trim()) {
      const newMessage: Message = {
        message: messageText,
        senderId: currentUser?.userId || 'Unknown User',
        created_at: new Date(),
        updated_at: new Date(),
      };

      console.log('threadmessage ' + messageText); // Überprüfung, ob Nachricht erstellt wird

      // Hole die aktuelle ausgewählte Nachricht und Thread-Informationen aus dem Service
      const selectedThread =
        this.threadService.selectedMessageSource.getValue();

      if (selectedThread) {
        this.threadService
          .addThreadMessage(
            selectedThread.channelId,
            selectedThread.messageId,
            newMessage
          )
          .then(() => {
            console.log('Nachricht erfolgreich zum Thread hinzugefügt.');
            textarea.value = '';
          })
          .catch((error) => {
            console.error(
              'Fehler beim Senden der Nachricht zum Thread:',
              error
            );
          });
      } else {
        console.error('Kein Thread ausgewählt.');
      }
    } else {
      console.log('Leere Nachricht, wird nicht gesendet.');
    }
  }
}
