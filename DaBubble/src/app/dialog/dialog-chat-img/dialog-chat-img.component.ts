import { Component, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
  constructor(@Inject(MAT_DIALOG_DATA) public data: { imagePath: string },private dialogRef: MatDialogRef<DialogChatImgComponent>) {}

  closeDialog(){
    this.dialogRef.close()
  }
}
