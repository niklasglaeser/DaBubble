import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AddSelectedUserListComponent } from './add-selected-user-list/add-selected-user-list.component';
import { UserService } from '../../services/user.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dialog-add-user',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    AddSelectedUserListComponent,
  ],
  templateUrl: './dialog-add-user.component.html',
  styleUrl: './dialog-add-user.component.scss',
})
export class DialogAddUserComponent {
  form: FormGroup;
  isOpen = true;
  showInputField = false;
  users$: Observable<User[]> = new Observable<User[]>();

  selectedUsers: User[] = [];

  constructor(private fb: FormBuilder, private userService: UserService) {
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
