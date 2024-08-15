import { User } from "@angular/fire/auth";

export interface UserInterface extends Partial<User> {
    email: string;
    username: string;
    // Du kannst zusätzliche Eigenschaften hinzufügen, die du in deiner App benötigst
}
