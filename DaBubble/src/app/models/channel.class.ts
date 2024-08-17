import { User } from './user.model';

export class Channel {
  id?: string;
  name: string;
  description: string;
  creator: string;
  members?: User[];

  constructor(data: {
    id?: string;
    name?: string;
    description?: string;
    creator?: string;
    members?: User[];
  }) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.description = data.description || '';
    this.creator = data.creator || 'Demo User';
    this.members = data.members || [];
  }
}
