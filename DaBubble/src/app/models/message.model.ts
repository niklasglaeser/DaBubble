import { Reaction } from './reaction.model';

export interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  message: string;
  reactions?: Reaction[];
  created_at: Date;
  updated_at: Date;
}
