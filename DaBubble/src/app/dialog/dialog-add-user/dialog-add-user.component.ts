import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dialog-add-user',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './dialog-add-user.component.html',
  styleUrl: './dialog-add-user.component.scss',
})
export class DialogAddUserComponent {
  form: FormGroup;
  isOpen = true;
  showInputField = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      selection: ['', Validators.required],
      specificMembers: [''],
    });

    this.form.get('selection')?.valueChanges.subscribe((value) => {
      this.showInputField = value === 'select';
      if (!this.showInputField) {
        this.form.get('specificMembers')?.reset();
      }
    });
  }

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  submit() {
    if (this.form.valid) {
      console.log('Form Value:', this.form.value);
      this.close();
    }
  }
}
