export class Channel {
  Id?: string;
  name: string;
  // members: User[];
  description: string;
  creator: string;

  constructor(data: {
    Id?: string;
    name?: string;
    description?: string;
    // members?: User[];
    creator?: string;
  }) {
    this.Id = data.Id || '';
    this.name = data.name || '';
    this.description = data.description || '';
    // this.members = data.members || [];
    this.creator = data.creator || 'Demo User';
  }
}
