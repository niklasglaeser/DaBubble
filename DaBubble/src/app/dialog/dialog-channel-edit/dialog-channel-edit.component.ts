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
  isDefaultChannel: boolean = false;

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

  constructor(public channelService: ChannelService, @Inject(MAT_DIALOG_DATA) public data: { channelId: string; members: UserLogged[] }, public dialogRef: MatDialogRef<DialogChannelEditComponent>, private dialog: MatDialog) {
    this.members = data.members;
  }

  /**
   * Initializes the component by loading the channel data and checking if it's the default channel.
   */
  ngOnInit() {
    this.loadChannel();
    this.checkIfDefaultChannel();
  }

  /**
   * Loads the channel data based on the provided channel ID.
   * Retrieves the channel information from the channel service and assigns it to the component.
   */
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

  /**
   * Updates the channel's name and description based on the current values.
   * Sends the updated data to the channel service.
   */
  async updateChannel() {
    if (this.channel) {
      try {
        this.channel.name = this.name!;
        this.channel.description = this.description!;
        await this.channelService.updateChannel(this.data.channelId, this.channel);
      } catch (e) {
        console.error('Error updating channel', e);
      }
    }
  }

  /**
   * Deletes the current channel using the channel service and closes the dialog.
   */
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

  /**
   * Removes a user from the current channel using the channel service and closes the dialog.
   */
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

  /**
   * Handles the edit button click for the channel name.
   * Toggles between edit and save modes, and updates the channel if changes are made.
   * @param {Event} event - The click event.
   */
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

  /**
   * Handles the edit button click for the channel description.
   * Toggles between edit and save modes, adjusts the textarea height, and updates the channel.
   * @param {Event} event - The click event.
   */
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

  /**
   * Opens the profile editing dialog for a given user.
   * Updates the user list with any changes made in the profile editing dialog.
   * @param {UserLogged} user - The user whose profile will be edited.
   */
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

  /**
   * Updates the list of members with the provided updated user information.
   * @param {UserLogged} updatedUser - The user object with updated information.
   */
  updateUserList(updatedUser: UserLogged) {
    const index = this.members.findIndex((member) => member.uid === updatedUser.uid);
    if (index !== -1) {
      this.members[index] = updatedUser;
    }
  }

  /**
   * Emits an event to open the "Add User" dialog and closes the current dialog.
   */
  addUser() {
    this.openAddUserDialogEvent.emit();
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }

  /**
   * Checks if the current channel is the default channel.
   * Sets the `isDefaultChannel` flag accordingly.
   */
  checkIfDefaultChannel() {
    if (this.data.channelId === this.channelService.defaultChannelId) {
      this.isDefaultChannel = true;
    } else {
      this.isDefaultChannel = false;
    }
  }

  /**
   * Adjusts the height of a textarea dynamically based on its content.
   * @param {any} event - The input event from the textarea.
   */
  adjustHeight(event: any) {
    event.target.style.height = 'auto';
    event.target.style.height = event.target.scrollHeight + 'px';
  }

  /**
   * Adjusts the height of a provided textarea element dynamically based on its content.
   * @param {HTMLTextAreaElement} textarea - The textarea element whose height needs adjustment.
   */
  adjustHeightDirectly(textarea: HTMLTextAreaElement) {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }
}
