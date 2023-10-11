import { Role } from '../enums';

/**
 * Interface for the current user
 * In controller methods, current user is retrieved by the @User decorator
 * Strategy's validate() method must return an object that conforms to this interface
 */
export interface ICurrentUser {
  userId: string;
  username: string;
  role: Role;
}
