// src/app/dialog-add-channel/dialog-add-channel.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Channel } from '../../../app/models/channel.class';
import { ChannelService } from '../../models/channel.service';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';

@Component({
  selector: 'app-dialog-add-channel',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DialogAddUserComponent],
  templateUrl: './dialog-add-channel.component.html',
  styleUrls: ['./dialog-add-channel.component.scss'],
})
export class DialogAddChannelComponent {
  addChannelForm: FormGroup;
  addUserForm: FormGroup;
  showInputField = false;
  addChannel: boolean = true;
  currentStep: 'channel' | 'user' = 'channel';
  channelName: string = '';

  constructor(
    private fbChannel: FormBuilder,
    private fbUser: FormBuilder,
    public dialogRef: MatDialogRef<DialogAddChannelComponent>,
    private channelService: ChannelService
  ) {
    this.addChannelForm = this.fbChannel.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
    });
    this.addUserForm = this.fbUser.group({
      selection: ['', Validators.required],
      specificMembers: [''],
    });
  }

  async submit() {
    if (this.addChannelForm.valid) {
      let formData = this.addChannelForm.value;
      let newChannel = new Channel({
        name: formData.name,
        description: formData.description,
      });
      try {
        await this.channelService.createChannel(newChannel);
        console.log('Channel created successfully:', newChannel);
        this.channelName = formData.name;
        this.currentStep = 'user';
      } catch (e) {
        console.error('Error creating channel:', e);
      }
    }
  }

  submitUser() {
    if (this.addUserForm.valid) {
      let formData = this.addUserForm.value;
      console.log('Users added to channel:', formData);
      this.dialogRef.close();
    }
  }

  close() {
    this.dialogRef.close();
  }
}
