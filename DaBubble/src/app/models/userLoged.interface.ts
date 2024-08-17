export interface UserLoggedInterface {
    uid: string;         
    username: string;    
    email: string;       
    photoURL?: string;   
    joinedChannels: string[]; 
    lastLogin: Date;     
  }
  