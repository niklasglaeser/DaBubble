import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DialogAddChannelComponent } from './dialog/dialog-add-channel/dialog-add-channel.component';
import { DialogChannelEditComponent } from './dialog/dialog-channel-edit/dialog-channel-edit.component';
import { DialogEditProfilComponent } from './dialog/dialog-edit-profil/dialog-edit-profil.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'sidebar', component: DialogEditProfilComponent },
];
