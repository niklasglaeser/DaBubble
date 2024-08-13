// src/app/dialog-add-channel/dialog-add-channel.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-add-channel',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './dialog-add-channel.component.html',
  styleUrls: ['./dialog-add-channel.component.scss'],
})
export class DialogAddChannelComponent {
  form: FormGroup;
  // isOpen = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogAddChannelComponent>
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
    });
  }

  close() {
    this.dialogRef.close();
  }

  submit() {
    if (this.form.valid) {
      console.log('Form Value:', this.form.value);
      this.close();
    }
  }
}
