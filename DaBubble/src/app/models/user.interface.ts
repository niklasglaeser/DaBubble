import { User } from "@angular/fire/auth";

export interface UserInterface extends Partial<User> {
    email: string;
    username: string;
    userId: string;
}
