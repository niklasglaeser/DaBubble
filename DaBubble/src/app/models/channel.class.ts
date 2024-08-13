export class Channel {
  Id?: string;
  name: string;
  description: string;
  creator: string;
  // members: User[];

  constructor(data: {
    Id?: string;
    name?: string;
    description?: string;
    creator?: string;
    // members?: User[];
  }) {
    this.Id = data.Id || '';
    this.name = data.name || '';
    this.description = data.description || '';
    this.creator = data.creator || 'Demo User';
    // this.members = data.members || [];
  }
}
