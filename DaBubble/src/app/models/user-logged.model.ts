export class UserLogged {
    uid: string;         
    username: string;    
    email: string;       
    photoURL?: string;   
    joinedChannels: string[]; 
    directMessage: string[]; 
    onlineStatus: boolean;  
  
    constructor(obj?: {
      uid?: string;
      username?: string;
      email?: string;
      photoURL?: string;
      joinedChannels?: string[];
      directMessage?: string[];
      onlineStatus?: boolean;
    }) {
      this.uid = obj?.uid || '';
      this.username = obj?.username || '';
      this.email = obj?.email || '';
      this.photoURL = obj?.photoURL; 
      this.joinedChannels = obj?.joinedChannels || [];
      this.directMessage = obj?.directMessage || [];
      this.onlineStatus = obj?.onlineStatus || false;
    }
  
    public toJSON() {
     
      const json: any = {
        uid: this.uid,
        username: this.username,
        email: this.email,
        photoURL: this.photoURL,
        joinedChannels: this.joinedChannels,
        directMessage: this.directMessage,
        onlineStatus: this.onlineStatus
      };
  
      return json;
    }
  }
  