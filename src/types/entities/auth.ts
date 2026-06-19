import { ISODateTimeString } from "./common";
import { User, UserRole } from "./user";

export interface AuthSession {
  isAuthenticated: boolean;
  role: UserRole | null;
  user: User | null;
  accessToken?: string;
  expiresAt?: ISODateTimeString;
}
