import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, Input, Inject, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../models/channel.class';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { getDoc } from '@angular/fire/firestore';
import { UserLogged } from '../../models/user-logged.model';
import { DialogEditProfilComponent } from '../dialog-edit-profil/dialog-edit-profil.component';

@Component({
  selector: 'app-dialog-channel-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-channel-edit.component.html',
  styleUrl: './dialog-channel-edit.component.scss'
})
export class DialogChannelEditComponent {
  @ViewChild('descriptionTextarea') descriptionTextarea!: ElementRef<HTMLTextAreaElement>;
  @Output() openAddUserDialogEvent = new EventEmitter<void>();
  channel!: Channel;
  members: UserLogged[] = [];

  isOpen = true;
  title: string = '';

  editName: string = 'Bearbeiten';
  editDescription: string = 'Bearbeiten';

  editNameClicked: boolean = false;
  editDescriptionClicked: boolean = false;

  inputNameDisabled: boolean = false; // testing
  channelExist?: boolean;

  name?: string;
  description?: string;
  creator?: string;

  constructor(private channelService: ChannelService, @Inject(MAT_DIALOG_DATA) public data: { channelId: string; members: UserLogged[] }, public dialogRef: MatDialogRef<DialogChannelEditComponent>, private dialog: MatDialog) {
    this.members = data.members;
  }

  ngOnInit() {
    this.loadChannel();
  }

  async loadChannel() {
    if (this.data.channelId) {
      const channelDoc = this.channelService.getSingleChannel(this.data.channelId);
      const channelData = (await getDoc(channelDoc)).data();
      if (channelData) {
        this.channel = new Channel({ id: this.data.channelId, ...channelData });
        this.name = this.channel.name;
        this.description = this.channel.description;
        this.creator = this.channel.creator;
      }
    }
  }

  async updateChannel() {
    if (this.channel) {
      try {
        this.channel.name = this.name!;
        this.channel.description = this.description!;
        await this.channelService.updateChannel(this.data.channelId, this.channel);
        console.log('Channel updated successfully');
      } catch (e) {
        console.error('Error updating channel', e);
      }
    }
  }

  async deleteChannel() {
    if (this.data.channelId) {
      try {
        await this.channelService.deleteChannel(this.data.channelId);
        this.dialogRef.close();
      } catch (e) {
        console.error('Error deleting channel', e);
      }
    }
  }

  async removeUserFromChannel() {
    if (this.data.channelId) {
      try {
        await this.channelService.removeUserFromChannel(this.data.channelId);
        this.dialogRef.close();
      } catch (e) {
        console.error('Error remove User from Channel', e);
      }
    }
  }

  editChannelBtn(event: Event) {
    if (!this.editNameClicked) {
      this.editNameClicked = true;
      this.editName = 'Speichern';
    } else {
      try {
        this.editNameClicked = false;
        this.editName = 'Bearbeiten';
        this.updateChannel();
      } catch {
        console.log('error');
      }
    }
  }

  editDescriptionBtn(event: Event) {
    if (!this.editDescriptionClicked) {
      this.editDescriptionClicked = true;
      this.editDescription = 'Speichern';
      setTimeout(() => {
        if (this.descriptionTextarea) {
          this.adjustHeightDirectly(this.descriptionTextarea.nativeElement);
        }
      }, 0);
    } else {
      try {
        this.editDescriptionClicked = false;
        this.editDescription = 'Bearbeiten';
        this.updateChannel();
      } catch {
        console.log('error');
      }
    }
  }

  openProfil(user: UserLogged) {
    const dialogRef = this.dialog.open(DialogEditProfilComponent, {
      data: { user: user }
    });

    dialogRef.afterClosed().subscribe((updatedUser: UserLogged) => {
      if (updatedUser) {
        this.updateUserList(updatedUser);
      }
    });
  }

  updateUserList(updatedUser: UserLogged) {
    const index = this.members.findIndex((member) => member.uid === updatedUser.uid);
    if (index !== -1) {
      this.members[index] = updatedUser;
    }
  }

  addUser() {
    this.openAddUserDialogEvent.emit();
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }

  adjustHeight(event: any) {
    event.target.style.height = 'auto';
    event.target.style.height = event.target.scrollHeight + 'px';
  }

  adjustHeightDirectly(textarea: HTMLTextAreaElement) {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }
}
