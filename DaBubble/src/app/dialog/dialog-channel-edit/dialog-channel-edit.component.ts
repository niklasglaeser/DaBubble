import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, Input, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../models/channel.service';
import { Channel } from '../../models/channel.class';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-dialog-channel-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-channel-edit.component.html',
  styleUrl: './dialog-channel-edit.component.scss',
})
export class DialogChannelEditComponent {
  @ViewChild('descriptionTextarea')
  descriptionTextarea!: ElementRef<HTMLTextAreaElement>;
  channel!: Channel;

  isOpen = true;
  title: string = 'Entwicklerteam 1';

  editName: string = 'Bearbeiten';
  editDescription: string = 'Bearbeiten';

  editNameClicked: boolean = false;
  editDescriptionClicked: boolean = false;

  inputNameDisabled: boolean = false; // testing
  channelExist?: boolean;

  name?: string;
  description?: string;
  creator?: string;

  constructor(
    private channelService: ChannelService,
    @Inject(MAT_DIALOG_DATA) public data: { channelId: string }
  ) {}

  ngOnInit() {
    this.loadChannel();
  }

  async loadChannel() {
    if (this.data.channelId) {
      const channelDoc = this.channelService.getSingleChannel(
        'channels',
        this.data.channelId
      );
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
        await this.channelService.updateChannel(
          this.data.channelId,
          this.channel
        );
        console.log('Channel updated successfully');
      } catch (e) {
        console.error('Error updating channel', e);
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

  toggleDialog() {
    this.isOpen = !this.isOpen;
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
