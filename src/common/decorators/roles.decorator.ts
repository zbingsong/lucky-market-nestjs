import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums';

export const USER_ROLE = 'userRole';
export const Roles = (role: Role) => SetMetadata(USER_ROLE, role);
