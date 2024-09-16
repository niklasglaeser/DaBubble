import { Component, Inject, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UploadService } from '../../services/lp-services/upload.service';

@Component({
  selector: 'app-dialog-chat-img',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule
  ],
  templateUrl: './dialog-chat-img.component.html',
  styleUrl: './dialog-chat-img.component.scss'
})
export class DialogChatImgComponent {
  uploadServicce = inject(UploadService)
  constructor(@Inject(MAT_DIALOG_DATA) public data: { imagePath: string },private dialogRef: MatDialogRef<DialogChatImgComponent>) {}

  closeDialog(){
    this.dialogRef.close()
  }

  downloadImage(path: string) {
    this.saveImageToLocalStorage(path)
    setTimeout(() => {
      this.downloadImageFromLocalStorage()
    }, 500);
    
  }
 
  saveImageToLocalStorage(imagePath: string) {
    // Lade das Bild als Blob
    fetch(imagePath)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Speichere das Base64-Bild im localStorage
          localStorage.setItem('savedImage', base64data);
        };
        reader.readAsDataURL(blob);
      })
      .catch(error => {
        console.error('Fehler beim Laden des Bildes:', error);
      });
  }
  
  downloadImageFromLocalStorage() {
    const base64Image = localStorage.getItem('savedImage');
    if (base64Image) {
      // Erstelle ein unsichtbares <a>-Element zum Herunterladen
      const a = document.createElement('a');
      a.href = base64Image;
      a.download = 'downloadedImage.png'; // Name der heruntergeladenen Datei
      document.body.appendChild(a);
      a.click(); // Simuliere den Klick, um den Download zu starten
      document.body.removeChild(a); // Entferne das <a>-Element nach dem Download
    } else {
      console.error('Kein Bild im localStorage gefunden.');
    }
  }
  

}
