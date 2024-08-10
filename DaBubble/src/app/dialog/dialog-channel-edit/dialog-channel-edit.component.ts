import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  isOpen = true;
  title: string = 'Entwicklerteam 1';
  description: string =
    'Dieser Channel ist für alles rund um #dfsdf vorgesehen. Hier kannst du zusammen mit deinem Team Meetings abhalten, Dokumente teilen und Entscheidungen treffen';
  creator: string = 'DaBubble';

  editName: string = 'Bearbeiten';
  editDescription: string = 'Bearbeiten';

  editNameClicked: boolean = false;
  editDescriptionClicked: boolean = false;

  inputNameDisabled: boolean = false; //testing

  constructor() {}

  editChannelBtn(event: Event) {
    if (!this.editNameClicked) {
      this.editNameClicked = true;
      this.editName = 'Speichern';
    } else {
      try {
        this.editNameClicked = false;
        this.editName = 'Bearbeiten';
        this.channelUpdate(event);
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
        this.channelUpdate(event);
      } catch {
        console.log('error');
      }
    }
  }

  channelUpdate(event: Event) {
    console.log('Channel update' + event);
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
