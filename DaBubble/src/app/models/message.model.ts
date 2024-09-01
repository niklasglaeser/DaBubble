import { Reaction } from './reaction.model';

export interface Message {
  id?: string;
  senderId: string;
  recipientId?: string;
  senderName?: string;
  photoURL?: string;
  message: string;
  reactions?: Reaction[];
  imagePath?: string;
  created_at: Date;
  updated_at?: Date;
}
